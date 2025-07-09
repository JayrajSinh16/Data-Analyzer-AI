import React from 'react';

const DataSummary = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="card h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Data Summary</h2>
        <span className="badge badge-violet">{stats.file_type}</span>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-700/30 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-400 font-medium">File Information</h3>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">File Name:</span>
              <span className="text-gray-300">{stats.file_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Size:</span>
              <span className="text-gray-300">{stats.file_size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Modified:</span>
              <span className="text-gray-300">{stats.last_modified}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/30 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-400 font-medium">Dataset Structure</h3>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Rows:</span>
              <span className="text-gray-300">{stats.row_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Columns:</span>
              <span className="text-gray-300">{stats.column_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Missing Values:</span>
              <span className="text-gray-300">{stats.missing_values}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duplicate Rows:</span>
              <span className="text-gray-300">{stats.duplicate_rows}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/30 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-400 font-medium">Column Types</h3>
          </div>
          <div className="mt-3 space-y-2">
            {stats.column_types && Object.entries(stats.column_types).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="text-gray-400">{type}:</span>
                <span className="text-gray-300">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {stats.correlations && (
          <div className="bg-gray-700/30 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-gray-400 font-medium">Top Correlations</h3>
            </div>
            <div className="mt-3 space-y-2">
              {stats.correlations.slice(0, 5).map((correlation, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-400">{correlation.columns}</span>
                  <span className={`${Math.abs(correlation.value) > 0.7 ? 'text-violet-400' : 'text-gray-300'}`}>
                    {correlation.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataSummary;
