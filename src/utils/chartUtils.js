/**
 * Utility functions for chart rendering and data visualization
 */

/**
 * Generate an array of colors with a base color
 * @param {number} count - Number of colors needed
 * @param {string} baseColor - Base color in hex format (e.g. '#8b5cf6')
 * @returns {Array} - Array of color strings
 */
export const generateChartColors = (count, baseColor = '#8b5cf6') => {
  const colors = [];
  
  // If we have a base color, create variations
  if (baseColor) {
    // Convert hex to RGB
    const r = parseInt(baseColor.substring(1, 3), 16);
    const g = parseInt(baseColor.substring(3, 5), 16);
    const b = parseInt(baseColor.substring(5, 7), 16);
    
    // Generate colors with varying luminance
    for (let i = 0; i < count; i++) {
      const factor = 0.8 + (i * 0.4 / count); // Luminance factor
      
      // Adjust RGB values and convert back to hex
      const adjustedR = Math.min(255, Math.floor(r * factor));
      const adjustedG = Math.min(255, Math.floor(g * factor));
      const adjustedB = Math.min(255, Math.floor(b * factor));
      
      const rHex = adjustedR.toString(16).padStart(2, '0');
      const gHex = adjustedG.toString(16).padStart(2, '0');
      const bHex = adjustedB.toString(16).padStart(2, '0');
      
      colors.push(`#${rHex}${gHex}${bHex}`);
    }
  } else {
    // Fallback color palette
    const palette = [
      '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', 
      '#6366f1', '#84cc16', '#a855f7', '#ef4444',
      '#0ea5e9', '#f59e0b', '#10b981', '#6b7280'
    ];
    
    for (let i = 0; i < count; i++) {
      colors.push(palette[i % palette.length]);
    }
  }
  
  return colors;
};

/**
 * Format number values for display in charts
 * @param {number} value - The number to format
 * @returns {string} - Formatted number string
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined) return '';
  
  // Handle large numbers with abbreviations
  if (Math.abs(value) >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B';
  }
  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  
  // Handle decimal places
  if (Number.isInteger(value)) {
    return value.toString();
  }
  
  // Format to at most 2 decimal places for readability
  return Number(value.toFixed(2)).toString();
};

/**
 * Determine the best chart type for a given set of data
 * @param {Object} columnData - Information about the column
 * @returns {string} - Recommended chart type
 */
export const recommendChartType = (columnData) => {
  const { dataType, uniqueValues, totalValues } = columnData;
  
  // For categorical data with few unique values, pie/bar charts are good
  if (dataType === 'categorical' || dataType === 'boolean') {
    if (uniqueValues <= 5) return 'pie';
    if (uniqueValues <= 15) return 'bar';
    return 'bar'; // Default to bar for categorical with many values
  }
  
  // For time series data, line charts are best
  if (dataType === 'datetime') {
    return 'line';
  }
  
  // For numerical data, histograms/line/scatter plots
  if (dataType === 'numerical') {
    if (totalValues > 100) return 'histogram';
    return 'line';
  }
  
  // Default chart type if we can't determine
  return 'bar';
};

/**
 * Generate bins for histogram data
 * @param {Array} data - Array of numerical values
 * @param {number} binCount - Number of bins to create
 * @returns {Array} - Array of binned data for histogram
 */
export const createHistogramData = (data, binCount = 10) => {
  // Remove null/undefined values
  const validData = data.filter(val => val !== null && val !== undefined);
  
  if (validData.length === 0) return [];
  
  // Find min and max values
  const min = Math.min(...validData);
  const max = Math.max(...validData);
  
  // Calculate bin width
  const binWidth = (max - min) / binCount;
  
  // Initialize bins
  const bins = Array(binCount).fill(0).map((_, index) => {
    const binStart = min + (index * binWidth);
    const binEnd = binStart + binWidth;
    
    return {
      binStart: Number(binStart.toFixed(2)),
      binEnd: Number(binEnd.toFixed(2)),
      count: 0,
      label: `${binStart.toFixed(1)} - ${binEnd.toFixed(1)}`
    };
  });
  
  // Count values in each bin
  validData.forEach(value => {
    // Handle edge case for max value
    if (value === max) {
      bins[binCount - 1].count++;
      return;
    }
    
    const binIndex = Math.floor((value - min) / binWidth);
    if (binIndex >= 0 && binIndex < binCount) {
      bins[binIndex].count++;
    }
  });
  
  return bins;
};
