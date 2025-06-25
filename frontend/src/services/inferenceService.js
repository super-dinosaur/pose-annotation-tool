/**
 * API service for inference operations
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

/**
 * Start inference process for a video
 * @param {string} videoPath - Path or name of the video
 * @returns {Promise<Object>} Start result
 */
export const startInference = async (videoPath) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inference/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoPath }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to start inference");
    }

    return await response.json();
  } catch (error) {
    console.error("Start inference error:", error);
    throw error;
  }
};

/**
 * Get next inference result from the running process
 * @returns {Promise<Object>} Inference result for next frame
 */
export const getNextInferenceResult = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inference/next`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get inference result");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Get inference error:", error);
    throw error;
  }
};

/**
 * Save current frame annotations and trigger next frame processing
 * @param {number} frameNumber - Current frame number
 * @param {Object} annotations - Annotations data to save
 * @returns {Promise<Object>} Save result
 */
export const saveAndContinue = async (frameNumber, annotations) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inference/continue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ frameNumber, annotations }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save annotations");
    }

    return await response.json();
  } catch (error) {
    console.error("Save annotations error:", error);
    throw error;
  }
};

/**
 * Stop the running inference process
 * @returns {Promise<Object>} Stop result
 */
export const stopInference = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inference/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to stop inference");
    }

    return await response.json();
  } catch (error) {
    console.error("Stop inference error:", error);
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

// Keep original functions for backward compatibility
/**
 * Run inference on the current frame (legacy)
 * @param {string} videoPath - Path or URL to the video
 * @param {number} frameNumber - Current frame number
 * @param {Object} annotations - Current annotations (optional)
 * @returns {Promise<Object>} Inference results
 */
export const runInference = async (
  videoPath,
  frameNumber,
  annotations = null,
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inference`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoPath,
        frameNumber,
        annotations,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Inference failed");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Inference API error:", error);
    throw error;
  }
};

// Remove the unused runUnderlyingInference function
