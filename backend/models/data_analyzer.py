"""
Data Analyzer for processing and analyzing datasets.
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime

class DataAnalyzer:
    """
    Analyzes data and generates statistics and visualizations.
    """
    
    def __init__(self, data: pd.DataFrame):
        """
        Initialize with a pandas DataFrame.
        
        Args:
            data: Input DataFrame to analyze
        """
        self.data = data
        self.numeric_columns = data.select_dtypes(include=np.number).columns.tolist()
        self.categorical_columns = data.select_dtypes(include=['object', 'category']).columns.tolist()
        self.datetime_columns = data.select_dtypes(include=['datetime']).columns.tolist()
        
        # Automatically detect datetime columns that might be stored as strings
        for col in self.categorical_columns:
            if self._is_potential_datetime(col):
                try:
                    self.data[col] = pd.to_datetime(self.data[col])
                    self.datetime_columns.append(col)
                    self.categorical_columns.remove(col)
                except:
                    # If conversion fails, leave as categorical
                    pass
    
    def _is_potential_datetime(self, column: str) -> bool:
        """
        Check if a column might contain datetime values.
        
        Args:
            column: Column name to check
            
        Returns:
            True if column might contain datetime values
        """
        # Sample a few values to check
        sample = self.data[column].dropna().head(5).astype(str)
        
        # Common datetime patterns
        datetime_patterns = [
            r'\d{4}-\d{2}-\d{2}',  # YYYY-MM-DD
            r'\d{2}/\d{2}/\d{4}',  # MM/DD/YYYY
            r'\d{1,2}\s[A-Za-z]{3}\s\d{4}',  # DD MMM YYYY
        ]
        
        # Check if any pattern matches the samples
        for value in sample:
            for pattern in datetime_patterns:
                if pd.Series(value).str.match(pattern).any():
                    return True
        
        return False
    
    def get_basic_stats(self) -> Dict[str, Any]:
        """
        Get basic statistics for the entire dataset.
        
        Returns:
            Dictionary of basic statistics
        """
        # Calculate column types
        column_types = {
            'numerical': len(self.numeric_columns),
            'categorical': len(self.categorical_columns),
            'datetime': len(self.datetime_columns),
            'boolean': len(self.data.select_dtypes(include=['bool']).columns)
        }
        
        # Calculate missing values
        missing_values = self.data.isna().sum().sum()
        
        # Calculate duplicate rows
        duplicate_rows = self.data.duplicated().sum()
        
        # Calculate correlations between numerical columns
        correlations = []
        if len(self.numeric_columns) >= 2:
            corr_matrix = self.data[self.numeric_columns].corr()
            
            # Extract upper triangle of correlation matrix
            for i in range(len(self.numeric_columns)):
                for j in range(i+1, len(self.numeric_columns)):
                    col1 = self.numeric_columns[i]
                    col2 = self.numeric_columns[j]
                    corr_value = corr_matrix.iloc[i, j]
                    
                    # Only include if not NaN
                    if not pd.isna(corr_value):
                        correlations.append({
                            'columns': f"{col1} - {col2}",
                            'value': corr_value
                        })
            
            # Sort by absolute correlation value
            correlations.sort(key=lambda x: abs(x['value']), reverse=True)
        
        # Columns with metadata
        columns = []
        for col in self.data.columns:
            col_type = 'unknown'
            if col in self.numeric_columns:
                col_type = 'numerical'
            elif col in self.categorical_columns:
                col_type = 'categorical'
            elif col in self.datetime_columns:
                col_type = 'datetime'
            elif self.data[col].dtype == bool:
                col_type = 'boolean'
                
            # Count missing values
            missing_count = self.data[col].isna().sum()
            
            # Add column info
            columns.append({
                'name': col,
                'type': col_type,
                'missing_values': int(missing_count),
                'missing_percentage': round(100 * missing_count / len(self.data), 2) if len(self.data) > 0 else 0
            })
        
        return {
            'row_count': len(self.data),
            'column_count': len(self.data.columns),
            'column_types': column_types,
            'missing_values': int(missing_values),
            'duplicate_rows': int(duplicate_rows),
            'correlations': correlations,
            'columns': columns
        }
    
    def get_column_stats(self, column_name: str) -> Dict[str, Any]:
        """
        Get detailed statistics for a specific column.
        
        Args:
            column_name: Name of the column to analyze
            
        Returns:
            Dictionary of column statistics
        """
        if column_name not in self.data.columns:
            raise ValueError(f"Column '{column_name}' not found in the dataset")
        
        column_data = self.data[column_name]
        result = {
            'name': column_name,
            'count': len(column_data),
            'missing': int(column_data.isna().sum()),
            'missing_percentage': round(100 * column_data.isna().sum() / len(column_data), 2)
        }
        
        # Handle different data types
        if column_name in self.numeric_columns:
            # Numerical column
            result['type'] = 'numerical'
            result['min'] = float(column_data.min()) if not pd.isna(column_data.min()) else None
            result['max'] = float(column_data.max()) if not pd.isna(column_data.max()) else None
            result['mean'] = float(column_data.mean()) if not pd.isna(column_data.mean()) else None
            result['median'] = float(column_data.median()) if not pd.isna(column_data.median()) else None
            result['std'] = float(column_data.std()) if not pd.isna(column_data.std()) else None
            
            # Calculate quartiles
            q1 = float(column_data.quantile(0.25)) if not pd.isna(column_data.quantile(0.25)) else None
            q3 = float(column_data.quantile(0.75)) if not pd.isna(column_data.quantile(0.75)) else None
            result['quartiles'] = {
                'q1': q1,
                'q3': q3
            }
            
            # Calculate interquartile range
            if q1 is not None and q3 is not None:
                iqr = q3 - q1
                result['iqr'] = iqr
                
                # Detect outliers (outside 1.5 * IQR)
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                outliers = column_data[(column_data < lower_bound) | (column_data > upper_bound)]
                result['outliers_count'] = int(len(outliers))
                result['outliers_percentage'] = round(100 * len(outliers) / len(column_data), 2)
            
            # Distribution data for histograms
            hist_data = np.histogram(column_data.dropna(), bins=10)
            result['distribution'] = {
                'bin_edges': hist_data[1].tolist(),
                'counts': hist_data[0].tolist()
            }
            
        elif column_name in self.categorical_columns:
            # Categorical column
            result['type'] = 'categorical'
            
            # Value counts
            value_counts = column_data.value_counts().reset_index()
            value_counts.columns = ['value', 'count']
            
            # Calculate percentages
            total_non_null = len(column_data.dropna())
            value_counts['percentage'] = value_counts['count'].apply(
                lambda x: round(100 * x / total_non_null, 2) if total_non_null > 0 else 0
            )
            
            result['unique_values'] = int(column_data.nunique())
            result['value_counts'] = value_counts.to_dict(orient='records')
            
        elif column_name in self.datetime_columns:
            # Datetime column
            result['type'] = 'datetime'
            result['min'] = column_data.min().isoformat() if not pd.isna(column_data.min()) else None
            result['max'] = column_data.max().isoformat() if not pd.isna(column_data.max()) else None
            
            # Time range in days
            if not pd.isna(column_data.min()) and not pd.isna(column_data.max()):
                time_range = (column_data.max() - column_data.min()).days
                result['time_range_days'] = time_range
            
        else:
            # Other types (boolean, etc.)
            if self.data[column_name].dtype == bool:
                result['type'] = 'boolean'
                true_count = int(column_data.sum())
                false_count = int(len(column_data.dropna()) - true_count)
                
                result['true_count'] = true_count
                result['false_count'] = false_count
                result['true_percentage'] = round(100 * true_count / len(column_data.dropna()), 2) if len(column_data.dropna()) > 0 else 0
                result['false_percentage'] = round(100 * false_count / len(column_data.dropna()), 2) if len(column_data.dropna()) > 0 else 0
            else:
                result['type'] = 'unknown'
        
        return result
    
    def calculate_correlation(self, column1: str, column2: str) -> Dict[str, Any]:
        """
        Calculate correlation between two columns.
        
        Args:
            column1: First column name
            column2: Second column name
            
        Returns:
            Dictionary with correlation information
        """
        if column1 not in self.data.columns:
            raise ValueError(f"Column '{column1}' not found in the dataset")
        
        if column2 not in self.data.columns:
            raise ValueError(f"Column '{column2}' not found in the dataset")
        
        # For numerical columns, calculate Pearson correlation
        if column1 in self.numeric_columns and column2 in self.numeric_columns:
            corr = self.data[[column1, column2]].corr().iloc[0, 1]
            
            return {
                'column1': column1,
                'column2': column2,
                'correlation_type': 'pearson',
                'correlation_value': float(corr) if not pd.isna(corr) else None,
                'interpretation': self._interpret_correlation(corr)
            }
        
        # For categorical columns, calculate Cramér's V (needs scipy)
        elif column1 in self.categorical_columns and column2 in self.categorical_columns:
            # Create a contingency table
            contingency = pd.crosstab(self.data[column1], self.data[column2])
            
            # Calculate chi-square statistic
            chi2 = 0
            n = contingency.sum().sum()
            
            for i in range(contingency.shape[0]):
                for j in range(contingency.shape[1]):
                    observed = contingency.iloc[i, j]
                    expected = contingency.iloc[i].sum() * contingency.iloc[:, j].sum() / n
                    if expected > 0:  # Avoid division by zero
                        chi2 += (observed - expected) ** 2 / expected
            
            # Calculate Cramér's V
            min_dim = min(contingency.shape) - 1
            if min_dim > 0 and n > 0:
                cramers_v = np.sqrt(chi2 / (n * min_dim))
            else:
                cramers_v = None
            
            return {
                'column1': column1,
                'column2': column2,
                'correlation_type': 'cramers_v',
                'correlation_value': float(cramers_v) if cramers_v is not None else None,
                'interpretation': self._interpret_correlation(cramers_v) if cramers_v is not None else 'Not enough data'
            }
        
        # For mixed type columns, or other combinations
        else:
            return {
                'column1': column1,
                'column2': column2,
                'correlation_type': 'not_applicable',
                'correlation_value': None,
                'interpretation': 'Correlation not applicable for these column types'
            }
    
    def _interpret_correlation(self, corr_value: float) -> str:
        """
        Interpret a correlation value.
        
        Args:
            corr_value: Correlation value
            
        Returns:
            String interpretation
        """
        if pd.isna(corr_value):
            return 'Not enough data'
        
        abs_corr = abs(corr_value)
        
        if abs_corr < 0.1:
            strength = 'Negligible'
        elif abs_corr < 0.3:
            strength = 'Weak'
        elif abs_corr < 0.5:
            strength = 'Moderate'
        elif abs_corr < 0.7:
            strength = 'Strong'
        else:
            strength = 'Very strong'
        
        direction = 'positive' if corr_value > 0 else 'negative'
        
        return f"{strength} {direction} correlation"
    
    def generate_visualizations(self) -> List[Dict[str, Any]]:
        """
        Generate visualizations for the dataset.
        
        Returns:
            List of visualization configurations
        """
        visualizations = []
        
        # Add distribution visualizations for numerical columns
        for column in self.numeric_columns[:5]:  # Limit to first 5 columns
            hist_data = self.data[column].dropna()
            
            if len(hist_data) == 0:
                continue
                
            # Create histogram data
            counts, bin_edges = np.histogram(hist_data, bins=10)
            
            # Create bin labels
            bin_labels = [f"{bin_edges[i]:.2f} - {bin_edges[i+1]:.2f}" 
                          for i in range(len(bin_edges)-1)]
            
            # Create data for the visualization
            data = [{"bin": label, "count": int(count)} 
                    for label, count in zip(bin_labels, counts)]
            
            visualizations.append({
                "chart_type": "bar",
                "title": f"Distribution of {column}",
                "data": data,
                "x_axis": "bin",
                "y_axis": "count"
            })
        
        # Add bar charts for categorical columns
        for column in self.categorical_columns[:5]:  # Limit to first 5 columns
            # Skip if too many unique values
            if self.data[column].nunique() > 15:
                continue
                
            value_counts = self.data[column].value_counts().reset_index()
            value_counts.columns = ['category', 'count']
            
            # Limit to top 10 categories
            if len(value_counts) > 10:
                top_categories = value_counts.head(9)
                other_count = value_counts.iloc[9:]['count'].sum()
                
                # Add an "Other" category
                other_row = pd.DataFrame([{'category': 'Other', 'count': other_count}])
                value_counts = pd.concat([top_categories, other_row])
            
            # Create data for the visualization
            data = value_counts.to_dict(orient='records')
            
            # Add pie chart for categorical columns with few values
            if len(data) <= 5:
                visualizations.append({
                    "chart_type": "pie",
                    "title": f"Distribution of {column}",
                    "data": data,
                    "x_axis": "category",
                    "y_axis": "count"
                })
            else:
                visualizations.append({
                    "chart_type": "bar",
                    "title": f"Distribution of {column}",
                    "data": data,
                    "x_axis": "category",
                    "y_axis": "count"
                })
        
        # Add time series charts for datetime columns
        for column in self.datetime_columns[:3]:  # Limit to first 3 columns
            if len(self.data) == 0:
                continue
                
            # Group by day/month depending on the date range
            date_data = self.data[[column]].copy()
            
            # Check the date range
            if date_data[column].notna().any():
                min_date = date_data[column].min()
                max_date = date_data[column].max()
                
                # Skip if both dates are the same
                if min_date == max_date:
                    continue
                    
                date_range = (max_date - min_date).days
                
                # Determine grouping frequency based on date range
                if date_range <= 30:
                    # Group by day for small ranges
                    date_data['period'] = date_data[column].dt.date
                elif date_range <= 365:
                    # Group by week for medium ranges
                    date_data['period'] = date_data[column].dt.to_period('W').apply(lambda x: x.start_time)
                else:
                    # Group by month for large ranges
                    date_data['period'] = date_data[column].dt.to_period('M').apply(lambda x: x.start_time)
                
                # Count records by period
                counts = date_data.groupby('period').size().reset_index()
                counts.columns = ['period', 'count']
                
                # Format dates as strings
                counts['period'] = counts['period'].astype(str)
                
                # Create data for visualization
                data = counts.to_dict(orient='records')
                
                visualizations.append({
                    "chart_type": "line",
                    "title": f"Time Series of {column}",
                    "data": data,
                    "x_axis": "period",
                    "y_axis": "count"
                })
        
        # Add scatter plots for correlated numerical columns
        if len(self.numeric_columns) >= 2:
            # Get correlation matrix
            corr_matrix = self.data[self.numeric_columns].corr()
            
            # Find highly correlated pairs (absolute value > 0.5)
            high_corr_pairs = []
            
            for i in range(len(self.numeric_columns)):
                for j in range(i+1, len(self.numeric_columns)):
                    col1 = self.numeric_columns[i]
                    col2 = self.numeric_columns[j]
                    corr_value = corr_matrix.iloc[i, j]
                    
                    if not pd.isna(corr_value) and abs(corr_value) > 0.5:
                        high_corr_pairs.append((col1, col2, abs(corr_value)))
            
            # Sort by correlation strength
            high_corr_pairs.sort(key=lambda x: x[2], reverse=True)
            
            # Create scatter plots for top pairs
            for col1, col2, _ in high_corr_pairs[:3]:  # Limit to top 3
                # Create sample of data for scatter plot (max 500 points)
                if len(self.data) > 500:
                    scatter_data = self.data.sample(500)
                else:
                    scatter_data = self.data
                
                # Drop rows with NA in either column
                scatter_data = scatter_data.dropna(subset=[col1, col2])
                
                # Create data for visualization
                data = scatter_data[[col1, col2]].to_dict(orient='records')
                
                visualizations.append({
                    "chart_type": "scatter",
                    "title": f"Correlation: {col1} vs {col2}",
                    "data": data,
                    "x_axis": col1,
                    "y_axis": col2
                })
        
        # If we have enough data, add a multi-series line chart for top numeric columns
        if len(self.numeric_columns) >= 2 and len(self.data) > 0:
            # Create a normalized view of top numeric columns
            top_numeric = self.numeric_columns[:3]  # Take top 3
            
            if len(top_numeric) >= 2:
                # Create index for X-axis
                normalized_data = pd.DataFrame({
                    'index': range(len(self.data))
                })
                
                # Normalize each column to 0-1 range
                for col in top_numeric:
                    col_data = self.data[col]
                    if col_data.notna().any():
                        min_val = col_data.min()
                        max_val = col_data.max()
                        
                        if max_val > min_val:
                            normalized_data[col] = (col_data - min_val) / (max_val - min_val)
                        else:
                            normalized_data[col] = 0
                    else:
                        normalized_data[col] = 0
                
                # Sample data if too large (max 100 points)
                if len(normalized_data) > 100:
                    step = len(normalized_data) // 100
                    normalized_data = normalized_data.iloc[::step].reset_index(drop=True)
                
                # Create data for the multi-series line chart
                data = normalized_data.to_dict(orient='records')
                
                visualizations.append({
                    "chart_type": "area",
                    "title": "Comparison of Normalized Values",
                    "data": data,
                    "x_axis": "index",
                    "y_axis": top_numeric[0],  # First column is the primary
                    "series": top_numeric,  # All columns as series
                    "colors": ["#8b5cf6", "#a78bfa", "#c4b5fd"]  # Purple palette
                })
        
        return visualizations
