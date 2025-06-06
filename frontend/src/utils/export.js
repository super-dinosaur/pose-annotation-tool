/**
 * Data export/import utilities
 */

import { transformAnnotationsForExport } from './annotation';

/**
 * Export annotations to JSON file
 * @param {import('../types').Annotations} annotations - Annotations data
 * @param {import('../types').Person[]} persons - Persons data
 * @param {import('../types').VideoInfo} videoInfo - Video information
 * @param {string} filename - Output filename
 */
export const exportAnnotationsToJson = (annotations, persons, videoInfo, filename = 'annotations.json') => {
  const { persons: transformedPersons, annotations: transformedAnnotations } = 
    transformAnnotationsForExport(annotations, persons);
  
  const exportData = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    videoInfo,
    persons: transformedPersons,
    annotations: transformedAnnotations
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', filename);
  linkElement.click();
};

/**
 * Import annotations from JSON file
 * @param {File} file - JSON file
 * @returns {Promise<Object>} Parsed annotation data
 */
export const importAnnotationsFromJson = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (!data.annotations) {
          reject(new Error('Invalid JSON format: missing annotations field'));
          return;
        }
        
        resolve({
          annotations: data.annotations,
          persons: data.persons || {},
          videoInfo: data.videoInfo || {}
        });
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Download data as file
 * @param {Object} data - Data to download
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 */
export const downloadAsFile = (data, filename, mimeType = 'application/json') => {
  const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
