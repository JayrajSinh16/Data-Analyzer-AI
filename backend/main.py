"""
Main FastAPI application for the Data Analysis Platform.
"""
from typing import Dict, Optional, Any
from fastapi import FastAPI, File, UploadFile, HTTPException
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

# class CorrelationRequest(BaseModel):
#     column1: str
#     column2: str

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
@app.post("/upload")
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
@app.post("/ask-ai", response_model=AIResponse)
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


if __name__ == "__main__":
    # Run the FastAPI application with uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
