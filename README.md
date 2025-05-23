README.md - Data Analyzer AI
# [Data Analyzer AI]
An AI-powered full-stack web app that helps users explore their datasets with charts, insights, and natural language
questions using LLMs.
## Features
### Frontend (React + Tailwind CSS)
- Upload `.csv` or `.xlsx` files
- Clean and responsive UI using Tailwind CSS
- Dynamic chart visualizations (bar, line, etc.)
- Data preview table with scroll
- Ask AI questions about your dataset
- AI-generated insights & column analysis
### Backend (FastAPI + Python)
- CSV/XLSX file parsing
- Column-wise stats (mean, median, mode, etc.)
- Histogram & correlation visualizations
- Categorical correlation (Chi-squared)
- Natural language queries via OpenRouter 

## Installation & Setup
### Backend Setup (FastAPI)
cd backend
python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate
uvicorn main:app --reload # Starts the FastAPI server on port 8000
### Frontend Setup (React)
Page 1
README.md - Data Analyzer AI
cd frontend
npm install
npm run dev # Starts the React app (default port: 5000)

## Built With
- Frontend: React, Tailwind CSS, Recharts
- Backend: FastAPI, Pandas, Uvicorn
- AI: OpenRouter API 
## Example Prompts
- "Which feature is most correlated with target?"
- "Show average revenue by region"
- "Any missing values in this dataset?"
- "Top 5 products with highest sales?"
## License
This project is licensed under the MIT License.
## Author
Made with love by Jayraj Zala
