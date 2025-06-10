/**
 * API service for inference operations
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Run inference on the current frame
 * @param {string} videoPath - Path or URL to the video
 * @param {number} frameNumber - Current frame number
 * @param {Object} annotations - Current annotations (optional)
 * @returns {Promise<Object>} Inference results
 */
export const runInference = async (videoPath, frameNumber, annotations = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoPath,
        frameNumber,
        annotations
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Inference failed');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Inference API error:', error);
    throw error;
  }
};

/**
 * Check if the backend is running
 * @returns {Promise<boolean>}
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};
