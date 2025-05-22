import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../utils/api';

const FileUpload = ({ onUploadSuccess, onUploadError, setIsLoading }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Validate file type
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      onUploadError({ message: 'Please upload a CSV or Excel file' });
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onUploadError({ message: 'File size must be less than 10MB' });
      return;
    }
    
    try {
      setIsLoading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Define upload progress handler
      const onProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      };
      
      const result = await uploadFile(formData, onProgress);
      onUploadSuccess(result);
    } catch (error) {
      onUploadError(error);
      console.error('File upload error:', error);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  }, [onUploadSuccess, onUploadError, setIsLoading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  // Update dragging state for styling
  React.useEffect(() => {
    setIsDragging(isDragActive);
  }, [isDragActive]);

  return (
    <div className="card">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
          ${isDragging ? 'border-violet-500 bg-violet-500/10' : 'border-gray-600 hover:border-violet-500 hover:bg-gray-700/30'}`}
      >
        <input {...getInputProps()} />
        
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <h3 className="mt-4 text-xl font-medium text-gray-300">
            {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
          </h3>
          
          <p className="mt-2 text-sm text-gray-400">
            or <span className="text-violet-400">browse files</span>
          </p>
          
          <p className="mt-1 text-xs text-gray-500">
            Supports CSV, XLS, XLSX (Max 10MB)
          </p>
        </div>
      </div>
      
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-4">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-violet-400">
                  Uploading...
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-violet-400">
                  {uploadProgress}%
                </span>
              </div> 
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
              <div 
                style={{ width: `${uploadProgress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-violet-500 transition-all duration-300"
              ></div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <div className="flex items-center bg-gray-700/50 rounded-lg p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="ml-2 text-sm text-gray-400">
              Upload your data file to visualize statistics and interact with AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
