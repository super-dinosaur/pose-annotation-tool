/**
 * Utility functions for detecting and cropping black borders in videos
 */

/**
 * Detect black borders in a video frame
 * @param {HTMLCanvasElement} canvas - Canvas containing the video frame
 * @param {number} threshold - Darkness threshold (0-255, default 10)
 * @returns {Object} Crop bounds { x, y, width, height }
 */
export const detectBlackBorders = (canvas, threshold = 10) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Helper function to check if a pixel is black
  const isBlack = (x, y) => {
    const idx = (y * width + x) * 4;
    return data[idx] <= threshold && 
           data[idx + 1] <= threshold && 
           data[idx + 2] <= threshold;
  };

  // Find top border
  let topBorder = 0;
  outer: for (let y = 0; y < height; y++) {
    for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.9); x += 10) {
      if (!isBlack(x, y)) {
        topBorder = y;
        break outer;
      }
    }
  }

  // Find bottom border
  let bottomBorder = height - 1;
  outer: for (let y = height - 1; y >= 0; y--) {
    for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.9); x += 10) {
      if (!isBlack(x, y)) {
        bottomBorder = y;
        break outer;
      }
    }
  }

  // Find left border
  let leftBorder = 0;
  outer: for (let x = 0; x < width; x++) {
    for (let y = Math.floor(height * 0.1); y < Math.floor(height * 0.9); y += 10) {
      if (!isBlack(x, y)) {
        leftBorder = x;
        break outer;
      }
    }
  }

  // Find right border
  let rightBorder = width - 1;
  outer: for (let x = width - 1; x >= 0; x--) {
    for (let y = Math.floor(height * 0.1); y < Math.floor(height * 0.9); y += 10) {
      if (!isBlack(x, y)) {
        rightBorder = x;
        break outer;
      }
    }
  }

  return {
    x: leftBorder,
    y: topBorder,
    width: rightBorder - leftBorder + 1,
    height: bottomBorder - topBorder + 1
  };
};

/**
 * Create a cropped canvas from source canvas
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {Object} cropBounds - Crop bounds { x, y, width, height }
 * @returns {HTMLCanvasElement} Cropped canvas
 */
export const createCroppedCanvas = (sourceCanvas, cropBounds) => {
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropBounds.width;
  croppedCanvas.height = cropBounds.height;
  
  const ctx = croppedCanvas.getContext('2d');
  ctx.drawImage(
    sourceCanvas,
    cropBounds.x,
    cropBounds.y,
    cropBounds.width,
    cropBounds.height,
    0,
    0,
    cropBounds.width,
    cropBounds.height
  );
  
  return croppedCanvas;
};
