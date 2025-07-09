"""
Utility functions for processing uploaded data files.
"""
import io
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Tuple

def process_file(file_content: bytes, filename: str, file_ext: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Process an uploaded file and convert it to a pandas DataFrame.
    
    Args:
        file_content: Binary content of the file
        filename: Name of the file
        file_ext: File extension (csv, xlsx, etc.)
        
    Returns:
        Tuple of (DataFrame, file_info_dict)
    """
    # Create file-like object from binary content
    file_obj = io.BytesIO(file_content)
    
    # Process based on file extension
    if file_ext == 'csv':
        # Try different encodings and delimiters
        try:
            # First try with utf-8 encoding and comma delimiter
            df = pd.read_csv(file_obj, encoding='utf-8')
        except:
            # Reset file pointer
            file_obj.seek(0)
            try:
                # Try with latin-1 encoding
                df = pd.read_csv(file_obj, encoding='latin-1')
            except:
                # Reset file pointer
                file_obj.seek(0)
                try:
                    # Try with semicolon delimiter (common in European CSVs)
                    df = pd.read_csv(file_obj, encoding='utf-8', sep=';')
                except:
                    # Reset file pointer
                    file_obj.seek(0)
                    # Last attempt with tab delimiter
                    df = pd.read_csv(file_obj, encoding='utf-8', sep='\t')
        
        file_type = 'CSV'
        
    elif file_ext in ['xlsx', 'xls']:
        # Process Excel file
        df = pd.read_excel(file_obj)
        file_type = 'Excel'
        
    else:
        raise ValueError(f"Unsupported file extension: {file_ext}")
    
    # Process DataFrame
    df = _preprocess_dataframe(df)
    
    # Calculate file size in human-readable format
    file_size = len(file_content)
    if file_size < 1024:
        size_str = f"{file_size} bytes"
    elif file_size < 1024 * 1024:
        size_str = f"{file_size / 1024:.1f} KB"
    else:
        size_str = f"{file_size / (1024 * 1024):.1f} MB"
    
    # Create file info dictionary
    file_info = {
        'file_name': filename,
        'file_type': file_type,
        'file_size': size_str,
        'last_modified': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return df, file_info

def _preprocess_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess the DataFrame to improve data quality.
    
    Args:
        df: Input DataFrame
        
    Returns:
        Preprocessed DataFrame
    """
    # Convert column names to strings
    df.columns = df.columns.astype(str)
    
    # Replace problematic column names
    df.columns = [col.replace('.', '_').replace(' ', '_').lower() for col in df.columns]
    
    # Make column names unique if duplicates exist
    if len(df.columns) != len(set(df.columns)):
        new_columns = []
        seen = {}
        
        for col in df.columns:
            if col in seen:
                seen[col] += 1
                new_col = f"{col}_{seen[col]}"
                new_columns.append(new_col)
            else:
                seen[col] = 0
                new_columns.append(col)
                
        df.columns = new_columns
    
    # Try to convert string columns that might be dates to datetime
    for col in df.select_dtypes(include=['object']).columns:
        # Skip if column has too many unique values
        if df[col].nunique() > 1000:
            continue
            
        # Sample some non-null values
        sample = df[col].dropna().head(100).astype(str)
        
        # Skip if empty
        if len(sample) == 0:
            continue
        
        # Try to convert to datetime if the column might contain dates
        date_patterns = [
            r'\d{4}-\d{2}-\d{2}',  # ISO format
            r'\d{2}/\d{2}/\d{4}',  # MM/DD/YYYY
            r'\d{1,2}\s[A-Za-z]{3}\s\d{4}',  # DD MMM YYYY
        ]
        
        might_be_date = any(
            sample.str.match(pattern).any() 
            for pattern in date_patterns
        )
        
        if might_be_date:
            try:
                df[col] = pd.to_datetime(df[col], errors='coerce')
            except:
                # If conversion fails, leave as is
                pass
    
    # Try to convert string columns that might be numeric to numeric types
    for col in df.select_dtypes(include=['object']).columns:
        # Skip if column has too many unique values or already converted to datetime
        if df[col].nunique() > 1000 or df[col].dtype.kind == 'M':
            continue
        
        # Try to convert to numeric
        try:
            numeric_col = pd.to_numeric(df[col], errors='coerce')
            
            # Only replace if conversion is meaningful (not too many NaNs)
            non_na_before = df[col].notna().sum()
            non_na_after = numeric_col.notna().sum()
            
            # If we didn't lose too many values (less than 10%)
            if non_na_after >= 0.9 * non_na_before:
                df[col] = numeric_col
        except:
            # If conversion fails, leave as is
            pass
    
    # Convert all-integer boolean columns (0/1) to actual boolean
    for col in df.select_dtypes(include=['int64', 'int32']).columns:
        if df[col].dropna().isin([0, 1]).all():
            df[col] = df[col].astype('boolean')
    
    return df
