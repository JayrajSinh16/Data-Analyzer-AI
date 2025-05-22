/**
 * API utility functions for interacting with the backend
 */

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Handle API errors consistently
 * @param {Response} response - Fetch response object
 * @returns {Promise} - Resolves with data or rejects with error
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.detail || 'An unexpected error occurred');
    error.statusCode = response.status;
    error.response = data;
    throw error;
  }
  
  return data;
};

/**
 * Upload a file to the server
 * @param {FormData} formData - Form data containing the file
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise} - Resolves with processed data
 */
export const uploadFile = async (formData, onProgress) => {
  const xhr = new XMLHttpRequest();
  
  // Create a promise that resolves when the request completes
  const promise = new Promise((resolve, reject) => {
    xhr.open('POST', `${API_BASE_URL}/upload`);
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          const error = new Error(errorData.detail || 'File upload failed');
          error.statusCode = xhr.status;
          error.response = errorData;
          reject(error);
        } catch (e) {
          reject(new Error(`File upload failed with status ${xhr.status}`));
        }
      }
    };
    
    xhr.onerror = () => {
      reject(new Error('Network error during file upload'));
    };
    
    // Set up progress tracking
    if (onProgress) {
      xhr.upload.onprogress = onProgress;
    }
  });
  
  // Send the request
  xhr.send(formData);
  
  return promise;
};


/**
 * Send a question to the AI and get a response
 * @param {string} question - The user's question
 * @param {string} model - The AI model to use
 * @param {Object} dataSummary - Summary of the uploaded data for context
 * @returns {Promise} - Resolves with AI response
 */

export const askAI = async (question, model, dataSummary) => {
  const response = await fetch(`${API_BASE_URL}/ask-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      model,
      context: dataSummary
    }),
  });
  
  return handleResponse(response);
};

/**
 * Get data statistics for a specific column
 * @param {string} columnName - The name of the column
 * @returns {Promise} - Resolves with column statistics
 */
export const getColumnStats = async (columnName) => {
  const response = await fetch(`${API_BASE_URL}/column-stats/${columnName}`);
  return handleResponse(response);
};

/**
 * Get correlation between two columns
 * @param {string} column1 - First column name
 * @param {string} column2 - Second column name
 * @returns {Promise} - Resolves with correlation data
 */
export const getCorrelation = async (column1, column2) => {
  const response = await fetch(`${API_BASE_URL}/correlation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      column1,
      column2,
    }),
  });
  
  return handleResponse(response);
};
