"""
AI Service for interacting with the OpenRouter API.
"""
import os
import json
import time
import requests
from typing import Dict, Any, Optional
import pandas as pd

class AIService:
    """
    Service for generating AI-powered insights from data.
    """
    
    def __init__(self):
        """
        Initialize the AI service.
        """
        
        
        
        # Model mappings - OpenRouter model IDs
        self.api_key = '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'
        self.api_base = "https://openrouter.ai/api/v1"

        self.models = {
            "microsoft/phi-4-reasoning-plus:free": "microsoft/phi-4-reasoning-plus:free",
            "meta-llama/llama-3.3-8b-instruct:free": "meta-llama/llama-3.3-8b-instruct:free",
            "qwen/qwen3-0.6b-04-28:free": "qwen/qwen3-0.6b-04-28:free",
        }
    
    def get_response(
        self, 
        question: str, 
        model: str, 
        data: pd.DataFrame, 
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Get a response from the AI model about the data.
        
        Args:
            question: The user's question
            model: The model to use
            data: The pandas DataFrame
            context: Additional context about the data
            
        Returns:
            Dict containing the AI's response
        """
        start_time = time.time()

        # Validate model
        if model not in self.models:
            model = "meta-llama/llama-3.3-8b-instruct:free"  # Default if model not found
        
        openrouter_model = model
        
        # Prepare data description
        data_description = self._prepare_data_description(data, context)
        
        # Create messages for the AI
        messages = [
            {
                "role": "system",
                "content": ( 
                    "You are an AI data analyst assistant. You'll be given data information and a question about this data. "
                    "Provide a helpful, informative, and accurate response based on the data provided. "
                    "If you can't answer based on the available data, explain what would be needed to answer it correctly. "
                    "When appropriate, offer insights that might not be directly asked for but would be valuable to the user. "
                    "For numerical answers, include the number in the response."
                    "Answer in short & consise way such as it will easy for user to understand."
                )
            },
            {
                "role": "user", 
                "content": f"Here's information about my data:\n\n{data_description}\n\nAnswer in short & consise way such as it will easy for user to understand.\n\nMy question is: {question}"
            }
        ]
        
        # Call the OpenRouter API
        try:
            response = self._call_openrouter_api(openrouter_model, messages)
            
            # Extract the response content
            answer = response.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            if not answer:
                answer = "I couldn't generate a response. Please try again or try a different question."
            
            processing_time = time.time() - start_time
            
            return {
                "answer": answer,
                "model_used": model,
                "processing_time": round(processing_time, 2)
            }
            
        except Exception as e:
            # Handle API errors
            return {
                "answer": f"I encountered an error while processing your request: {str(e)}. Please try again or try a different question.",
                "model_used": model,
                "processing_time": round(time.time() - start_time, 2)
            }
    
    def _prepare_data_description(
        self, 
        data: pd.DataFrame, 
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Prepare a textual description of the data for the AI.
        
        Args:
            data: The pandas DataFrame
            context: Additional context about the data
            
        Returns:
            String description of the data
        """
        # Start with basic info
        description = [
            f"The dataset has {len(data)} rows and {len(data.columns)} columns."
        ]
        
        # Add column information
        description.append("\nColumns in the dataset:")
        
        for column in data.columns:
            col_type = str(data[column].dtype)
            missing = data[column].isna().sum()
            missing_pct = round(100 * missing / len(data), 2) if len(data) > 0 else 0
            
            # Add column description
            description.append(f"- {column} (type: {col_type}, missing: {missing} ({missing_pct}%))")
            
            # Add some sample values for context (limited to prevent prompt getting too large)
            non_null_values = data[column].dropna()
            if len(non_null_values) > 0:
                if col_type.startswith(('int', 'float')):
                    # For numerical columns, add statistical info
                    description.append(f"  Range: {non_null_values.min()} to {non_null_values.max()}")
                    description.append(f"  Mean: {non_null_values.mean():.2f}, Median: {non_null_values.median()}")
                else:
                    # For other columns, add unique values (if not too many)
                    unique_values = non_null_values.unique()
                    if len(unique_values) <= 10:
                        description.append(f"  Unique values: {', '.join(str(v) for v in unique_values[:10])}")
                    else:
                        description.append(f"  Has {len(unique_values)} unique values")
                        description.append(f"  Examples: {', '.join(str(v) for v in unique_values[:5])}")
        
        # Add insights from context if provided
        if context:
            if 'columns' in context:
                # Add data types distribution if available
                description.append("\nColumn types distribution:")
                
                if 'columnTypes' in context:
                    for type_name, count in context['columnTypes'].items():
                        description.append(f"- {type_name}: {count} columns")
            
            # Add any correlations if available
            if 'correlations' in context and isinstance(context['correlations'], list):
                if len(context['correlations']) > 0:
                    description.append("\nTop correlations between columns:")
                    
                    for correlation in context['correlations'][:5]:  # Limit to top 5
                        columns = correlation.get('columns', '')
                        value = correlation.get('value', 0)
                        description.append(f"- {columns}: {value:.2f}")
        
        # Add a small sample of the data for context
        if len(data) > 0:
            description.append("\nSample data (first 3 rows):")
            
            # Convert sample to string representation, handling potential display issues
            sample_data = data.head(3).to_string()
            description.append(sample_data)
        
        return "\n".join(description)
    
    def _call_openrouter_api(self, model: str, messages: list) -> Dict[str, Any]:
        """
        Call the OpenRouter API.
        
        Args:
            model: OpenRouter model ID
            messages: List of message objects
            
        Returns:
            API response as a dictionary
        """
        if not self.api_key:
            raise ValueError(
                "OpenRouter API key not found. Please set the OPENROUTER_API_KEY environment variable."
            )
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://datainsight.ai",  # Replace with your actual domain
            "X-Title": "Data Analyzer AI Analysis Platform"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.3,  # Lower temperature for more factual responses
            "max_tokens": 1024
        }
        
        response = requests.post(
            f"{self.api_base}/chat/completions"
            headers=headers,
            data=json.dumps(payload)
        )
        
        if response.status_code != 200:
            raise Exception(f"API error: {response.status_code} - {response.text}")
        
        return response.json()

