const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5002;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Global Python process management
let pythonProcess = null;
let processOutput = [];
let currentResponseCallback = null;

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

// Start the Python inference process (only one at a time)
app.post("/api/inference/start", (req, res) => {
  try {
    const { videoPath } = req.body;
    
    console.log("Starting inference for video:", videoPath);
    
    // Kill existing process if any
    if (pythonProcess) {
      console.log("Killing existing Python process");
      pythonProcess.kill();
      pythonProcess = null;
    }
    
    // Clear any existing fin_frame files
    const tempDir = path.join(__dirname, "..", "TempAnnoFile");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const files = fs.readdirSync(tempDir);
    files.forEach(file => {
      if (file.startsWith('fin_frame_') && file.endsWith('.json')) {
        fs.unlinkSync(path.join(tempDir, file));
        console.log("Cleaned up:", file);
      }
    });
    
    // Reset output buffer
    processOutput = [];
    currentResponseCallback = null;
    
    // Start new Python process
    const scriptPath = path.join(__dirname, "..", "scripts", "RealInference.py");
    pythonProcess = spawn("python3", [
      scriptPath,
      "--video", videoPath,
      "--frame", "0"
    ]);
    
    console.log("Python process started");
    
    // Handle stdout (inference results)
    pythonProcess.stdout.on("data", (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        try {
          const result = JSON.parse(line);
          console.log("Python output:", result);
          
          // If we have a waiting response, send it immediately
          if (currentResponseCallback) {
            currentResponseCallback(result);
            currentResponseCallback = null;
          } else {
            // Otherwise store for later retrieval
            processOutput.push(result);
          }
        } catch (e) {
          console.log("Non-JSON output:", line);
        }
      });
    });
    
    // Handle stderr (logs)
    pythonProcess.stderr.on("data", (data) => {
      console.log("[Python]", data.toString().trim());
    });
    
    // Handle process exit
    pythonProcess.on("close", (code) => {
      console.log(`Python process exited with code ${code}`);
      pythonProcess = null;
      
      // If there's a waiting response, send error
      if (currentResponseCallback) {
        currentResponseCallback({ 
          status: "error", 
          error: "Python process terminated unexpectedly" 
        });
        currentResponseCallback = null;
      }
    });
    
    pythonProcess.on("error", (error) => {
      console.error("Failed to start Python process:", error);
      pythonProcess = null;
    });
    
    res.json({ 
      success: true, 
      message: "Inference process started successfully" 
    });
    
  } catch (error) {
    console.error("Start inference error:", error);
    res.status(500).json({ 
      error: "Failed to start inference", 
      details: error.message 
    });
  }
});

// Get next inference result
app.get("/api/inference/next", (req, res) => {
  if (!pythonProcess) {
    return res.status(400).json({ 
      error: "No inference process running. Please start inference first." 
    });
  }
  
  // If we already have output buffered, send it immediately
  if (processOutput.length > 0) {
    const result = processOutput.shift();
    return res.json({ success: true, data: result });
  }
  
  // Otherwise wait for next output
  currentResponseCallback = (result) => {
    res.json({ success: true, data: result });
  };
  
  // Set timeout to prevent hanging requests
  setTimeout(() => {
    if (currentResponseCallback === res.json) {
      currentResponseCallback = null;
      res.status(408).json({ 
        error: "Timeout waiting for inference result" 
      });
    }
  }, 30000); // 30 second timeout
});

// Save annotations and continue to next frame
app.post("/api/inference/continue", (req, res) => {
  try {
    const { frameNumber, annotations } = req.body;
    
    if (!pythonProcess) {
      return res.status(400).json({ 
        error: "No inference process running" 
      });
    }
    
    console.log(`Saving annotations for frame ${frameNumber}`);
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, "..", "TempAnnoFile");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Save as fin_frame_N.json
    const finFilePath = path.join(tempDir, `fin_frame_${frameNumber}.json`);
    fs.writeFileSync(finFilePath, JSON.stringify(annotations, null, 2));
    
    console.log(`Saved annotations to ${finFilePath}`);
    
    res.json({ 
      success: true, 
      message: `Frame ${frameNumber} annotations saved`,
      path: finFilePath
    });
    
  } catch (error) {
    console.error("Save annotations error:", error);
    res.status(500).json({ 
      error: "Failed to save annotations", 
      details: error.message 
    });
  }
});

// Stop inference process
app.post("/api/inference/stop", (req, res) => {
  try {
    if (pythonProcess) {
      console.log("Stopping Python process");
      pythonProcess.kill();
      pythonProcess = null;
    }
    
    // Clear buffers
    processOutput = [];
    currentResponseCallback = null;
    
    res.json({ 
      success: true, 
      message: "Inference process stopped" 
    });
    
  } catch (error) {
    console.error("Stop inference error:", error);
    res.status(500).json({ 
      error: "Failed to stop inference", 
      details: error.message 
    });
  }
});

// Original inference endpoint (keep for backward compatibility)
app.post("/api/inference", async (req, res) => {
  try {
    const { videoPath, frameNumber, annotations } = req.body;

    console.log("Received inference request:", {
      videoPath,
      frameNumber,
      annotationsCount: annotations ? Object.keys(annotations).length : 0,
    });

    if (!videoPath || frameNumber === undefined) {
      return res.status(400).json({
        error: "Missing required parameters: videoPath and frameNumber",
      });
    }

    const pythonScriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "inference.py",
    );

    const args = [
      pythonScriptPath,
      "--video",
      videoPath,
      "--frame",
      frameNumber.toString(),
    ];

    let tempAnnotationsPath = null;
    if (annotations) {
      tempAnnotationsPath = path.join(
        __dirname,
        "temp",
        `annotations_${Date.now()}.json`,
      );

      const tempDir = path.join(__dirname, "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      fs.writeFileSync(tempAnnotationsPath, JSON.stringify(annotations));
      args.push("--annotations", tempAnnotationsPath);
    }

    const pythonProcess = spawn("python3", args);

    let outputData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (data) => {
      outputData += data.toString();
      console.log("Original Python output:", data.toString());
    });

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
      console.error("Original Python error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      if (tempAnnotationsPath && fs.existsSync(tempAnnotationsPath)) {
        fs.unlinkSync(tempAnnotationsPath);
      }

      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        return res.status(500).json({
          error: "Inference failed",
          details: errorData,
        });
      }

      try {
        const result = JSON.parse(outputData);
        res.json({
          success: true,
          data: result,
        });
      } catch (parseError) {
        res.json({
          success: true,
          data: outputData,
        });
      }
    });
  } catch (error) {
    console.error("Inference error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Clean up on server shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  
  if (pythonProcess) {
    console.log('Killing Python process...');
    pythonProcess.kill();
  }
  
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("  GET  /api/health");
  console.log("  POST /api/inference/start");
  console.log("  GET  /api/inference/next");
  console.log("  POST /api/inference/continue");
  console.log("  POST /api/inference/stop");
  console.log("  POST /api/inference (legacy)");
});
