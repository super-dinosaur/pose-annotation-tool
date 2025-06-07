/**
 * Debug script to test video upload functionality
 * Run this in the browser console to debug video upload issues
 */

function debugVideoUpload() {
  console.log('=== Video Upload Debug Started ===');
  
  // Check if file input exists
  const fileInput = document.querySelector('input[type="file"]');
  console.log('File input found:', !!fileInput);
  
  // Check if video element exists
  const videoElements = document.querySelectorAll('video');
  console.log('Video elements found:', videoElements.length);
  
  videoElements.forEach((video, index) => {
    console.log(`Video ${index + 1}:`, {
      src: video.src,
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      duration: video.duration,
      currentTime: video.currentTime
    });
  });
  
  // Check for any blob URLs in memory
  const performance = window.performance;
  if (performance.getEntriesByType) {
    const resources = performance.getEntriesByType('resource');
    const blobUrls = resources.filter(resource => resource.name.startsWith('blob:'));
    console.log('Blob URLs found:', blobUrls.length);
    blobUrls.forEach(url => console.log('Blob URL:', url.name));
  }
  
  // Check React state if available
  const reactRoot = document.querySelector('#root');
  if (reactRoot && reactRoot._reactInternalInstance) {
    console.log('React instance found, checking state...');
    // This would need to be adapted based on the actual React structure
  }
  
  console.log('=== Video Upload Debug Completed ===');
}

// Auto-run debug if called directly
if (typeof window !== 'undefined') {
  debugVideoUpload();
}

// Export for manual use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = debugVideoUpload;
}
