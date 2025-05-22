"""
Main FastAPI application for the Data Analysis Platform.
"""
import os
from typing import Dict, List, Optional, Union, Any
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
 
from models.data_analyzer import DataAnalyzer
from models.ai_service import AIService
from utils.file_processor import process_file

# Initialize FastAPI app
app = FastAPI(
    title="Data Analysis Platform API",
    description="API for processing and analyzing data files with AI-powered insights",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global data store - in a production app, this would use a database
current_data = None
current_analyzer = None

# Initialize AI service
ai_service = AIService()

# Request models
class AIRequest(BaseModel):
    question: str
    model: str
    context: Optional[Dict[str, Any]] = None

class CorrelationRequest(BaseModel):
    column1: str
    column2: str

# Response models
class AIResponse(BaseModel):
    answer: str
    model_used: str
    processing_time: float


# Root endpoint to verify that the API is running
@app.get("/")
async def root():
    """Root endpoint that confirms the API is running."""
    return {"message": "Data Analysis Platform API is running"}


# Endpoint to upload a file and perform initial analysis
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload and process a data file (CSV or Excel).
    Returns processed data, statistics, and visualizations.
    """
    global current_data, current_analyzer

    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    # Validate file format
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in ['csv', 'xlsx', 'xls']:
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file format. Please upload a CSV or Excel file."
        )

    try:
        # Read file content asynchronously
        file_content = await file.read()

        # Process and convert the uploaded file to a DataFrame
        data, file_info = process_file(file_content, file.filename, file_ext)

        # Initialize analyzer for data exploration
        analyzer = DataAnalyzer(data)

        # Get basic stats like mean, median, missing values, etc.
        stats = analyzer.get_basic_stats()

        # Include file-related info (name, size, format)
        stats.update(file_info)

        # Generate basic visualizations (histograms, correlations, etc.)
        visualizations = analyzer.generate_visualizations()

        # Save current state to memory for use in other endpoints
        current_data = data
        current_analyzer = analyzer

        return {
            "status": "success",
            "data": data.to_dict(orient='records'),  # convert to list of dicts
            "stats": stats,
            "visualizations": visualizations
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file: {str(e)}"
        )


# Endpoint to ask AI a question about the uploaded data
@app.post("/api/ask-ai", response_model=AIResponse)
async def ask_ai(request: AIRequest):
    """
    Ask a question about the data and get an AI-powered response.
    """
    global current_data, current_analyzer

    # Ensure data is available before allowing queries
    if current_data is None:
        raise HTTPException(
            status_code=400,
            detail="No data available. Please upload a file first."
        )

    try:
        # Use the AI service to get an answer to the question
        response = ai_service.get_response(
            question=request.question,
            model=request.model,
            data=current_data,
            context=request.context
        )
        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting AI response: {str(e)}"
        )


# Endpoint to get statistics for a specific column
@app.get("/column-stats/{column_name}")
async def get_column_stats(column_name: str):
    """
    Get detailed statistics for a specific column.
    """
    global current_analyzer

    if current_analyzer is None:
        raise HTTPException(
            status_code=400,
            detail="No data available. Please upload a file first."
        )

    # Ensure the requested column exists
    if column_name not in current_analyzer.data.columns:
        raise HTTPException(
            status_code=404,
            detail=f"Column '{column_name}' not found in the data."
        )

    try:
        # Get descriptive statistics for the column
        stats = current_analyzer.get_column_stats(column_name)
        return stats

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calculating column statistics: {str(e)}"
        )


# Endpoint to calculate correlation between two selected columns
@app.post("/correlation")
async def get_correlation(request: CorrelationRequest):
    """
    Calculate correlation between two columns.
    """
    global current_analyzer

    if current_analyzer is None:
        raise HTTPException(
            status_code=400,
            detail="No data available. Please upload a file first."
        )

    # Validate if both columns exist
    if request.column1 not in current_analyzer.data.columns:
        raise HTTPException(
            status_code=404,
            detail=f"Column '{request.column1}' not found in the data."
        )

    if request.column2 not in current_analyzer.data.columns:
        raise HTTPException(
            status_code=404,
            detail=f"Column '{request.column2}' not found in the data."
        )

    try:
        # Compute correlation value (e.g., Pearson/Spearman)
        correlation = current_analyzer.calculate_correlation(
            request.column1, request.column2
        )
        return correlation

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calculating correlation: {str(e)}"
        )

if __name__ == "__main__":
    # Run the FastAPI application with uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
