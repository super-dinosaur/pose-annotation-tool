# React Debugging Guide for Video Upload Issue

## Professional React Debugging Techniques

### 1. **Browser DevTools Debugging (Like GDB/PDB)**

#### Setting Breakpoints:
1. Open Chrome DevTools (F12)
2. Go to "Sources" tab
3. Navigate to your file in the file tree (webpack://./src/...)
4. Click on line numbers to set breakpoints
5. Or add `debugger;` statements in your code

#### Using the Debugger:
- **F8**: Continue execution
- **F10**: Step over (next line)
- **F11**: Step into function
- **Shift+F11**: Step out of function
- **Watch expressions**: Add variables to watch
- **Call stack**: See function call hierarchy
- **Scope**: View local and closure variables

### 2. **React Developer Tools**

1. Install React Developer Tools extension
2. In DevTools, you'll see new tabs: "⚛️ Components" and "⚛️ Profiler"
3. In Components tab:
   - Search for components by name
   - View/edit props and state in real-time
   - View component tree hierarchy
   - Track which components re-render

### 3. **Redux DevTools** (if using Redux)
- Time-travel debugging
- Action history
- State diff viewer

## Debugging Your Video Upload Issue

Based on the code, here's the flow and potential issues:

### 1. **File Selection Flow**:
```
User clicks Upload → File dialog → handleFileSelect → validateVideoFile → createVideoUrl → onVideoUpload → handleVideoUpload → actions.setVideoSrc
```

### 2. **State Update Flow**:
```
actions.setVideoSrc → dispatch → appReducer → new state → components re-render → useVideoFrame effect triggers
```

### 3. **Video Processing Flow**:
```
useVideoFrame effect → create video element → load video → onloadedmetadata → processVideoMetadata → extractFrameFromVideo → setFrameImage
```

## Common Issues and Solutions:

### Issue 1: State not updating after dispatch
**Debug steps:**
1. Check if action is dispatched (console logs)
2. Check if reducer receives action
3. Check if state actually changes
4. Check if components re-render

### Issue 2: Video element not loading
**Debug steps:**
1. Check if video URL is valid (blob:// URL)
2. Check video element events (loadedmetadata, error)
3. Check CORS issues
4. Check video codec support

### Issue 3: Effect not triggering
**Debug steps:**
1. Check dependency array
2. Check if previous checks prevent execution
3. Add console logs at each step

## Quick Debug Commands to Run in Console:

```javascript
// Check current state
const state = document.querySelector('#root')._reactRootContainer._internalRoot.current.memoizedState;

// Check if video element exists
document.querySelectorAll('video');

// Check blob URL validity
fetch('blob:http://localhost:3000/...').then(r => console.log('Valid')).catch(e => console.log('Invalid'));

// Manually trigger state update (for testing)
window.testVideoUpload = () => {
  const testUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
  // Find your component and call the handler
};
```

## Setting Up Debug Session:

1. Add these debug points:
   - In `handleFileSelect` after file selection
   - In `handleVideoUpload` when called
   - In `appReducer` when SET_VIDEO_SRC action received
   - In `useVideoFrame` effect when video source changes

2. Open DevTools and go to Sources tab
3. Find your files and set breakpoints
4. Upload a video and step through the code

## The Main Issue in Your Code:

Looking at the flow, the most likely issue is that the state update is happening but the effect dependencies aren't triggering properly. The `prevSrcRef` check might be preventing the video from loading if the component re-renders.

Let me fix this:
