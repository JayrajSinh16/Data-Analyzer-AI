import { useState } from "react";

// Component imports
import Navbar from "./components/Navbar.jsx";
import FileUpload from './components/FileUpload';
import DataSummary from './components/DataSummary';
import DataVisualization from './components/DataVisualization';
import AIChat from './components/AIChat';
import DataTable from './components/DataTable';

function App() {
  // State to store parsed data from the uploaded file
  const [fileData, setFileData] = useState(null);

  // State to store summary statistics of the uploaded data
  const [fileStats, setFileStats] = useState(null);

  // State to store generated visualizations from the data
  const [visualizations, setVisualizations] = useState([]);

  // Loading state to indicate background processing
  const [isLoading, setIsLoading] = useState(false);

  // Error state to capture and display any issues during upload or processing
  const [error, setError] = useState(null);

  /**
   * Handles successful file upload.
   * Populates the data, stats, and visualizations state.
   */
  const handleFileUploadSuccess = (data) => {
    setFileData(data.data);
    setFileStats(data.stats);
    setVisualizations(data.visualizations);
    setError(null); // Clear any previous errors
  };

  /**
   * Handles errors during file upload or processing.
   * Resets the data and displays a meaningful error message.
   */
  const handleFileUploadError = (err) => {
    setError(err.message || 'Failed to process file');
    setFileData(null);
    setFileStats(null);
    setVisualizations([]);
  };

  return (
    <>
      <div>
        {/* Top navigation bar */}
        <Navbar />

        {/* Main content area */}
        <main className="flex-grow px-4 py-8 md:px-8 lg:px-12 max-w-7xl mx-auto w-full">
          
          {/* Error message display */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg mb-6">
              <p className="font-medium">Error: {error}</p>
            </div>
          )}

          {/* File upload section with heading and description */}
          <section className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Data Analysis Platform</h1>
            <p className="text-gray-400 mb-6">Upload your data file and get AI-powered insights</p>
            
            <FileUpload 
              onUploadSuccess={handleFileUploadSuccess}
              onUploadError={handleFileUploadError}
              setIsLoading={setIsLoading}
            />
          </section>

          {/* Loading spinner while data is being processed */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          )}

          {/* Main content rendered after successful file upload */}
          {fileData && !isLoading && (
            <>
              {/* Data summary and visualizations */}
              <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3 mb-8">
                <div className="lg:col-span-1">
                  <DataSummary stats={fileStats} />
                </div>
                <div className="lg:col-span-2">
                  <DataVisualization visualizations={visualizations} />
                </div>
              </div>
              
              {/* Data table and AI-powered chat section */}
              <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <DataTable data={fileData} />
                </div>
                <div className="lg:col-span-1 h-[600px] overflow-auto custom-scrollbar">
                  <AIChat fileData={fileData} fileStats={fileStats} />
                </div>
              </div>
            </>
          )}

          {/* Empty state when no file is uploaded yet */}
          {!fileData && !isLoading && (
            <div className="bg-gray-800 rounded-xl p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 opacity-30">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M12 18v-6"></path>
                  <path d="M8 15h8"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">No data to display</h3>
              <p className="text-gray-500 mb-6">Upload a CSV or Excel file to get started</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
