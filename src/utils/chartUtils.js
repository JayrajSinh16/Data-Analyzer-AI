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

