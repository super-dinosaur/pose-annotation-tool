const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" });
});

// Inference endpoint
app.post("/api/inference", async (req, res) => {
  try {
    const { videoPath, frameNumber, annotations } = req.body;

    console.log("Received inference request:", {
      videoPath,
      frameNumber,
      annotationsCount: annotations ? Object.keys(annotations).length : 0,
    });

    // Validate input
    if (!videoPath || frameNumber === undefined) {
      return res.status(400).json({
        error: "Missing required parameters: videoPath and frameNumber",
      });
    }

    // Path to your Python script
    const pythonScriptPath = path.join(
      __dirname,
      "..",
      "scripts",
      "inference.py",
    );

    // Prepare arguments for Python script
    const args = [
      pythonScriptPath,
      "--video",
      videoPath,
      "--frame",
      frameNumber.toString(),
    ];

    // If annotations provided, save them to a temp file
    let tempAnnotationsPath = null;
    if (annotations) {
      tempAnnotationsPath = path.join(
        __dirname,
        "temp",
        `annotations_${Date.now()}.json`,
      );

      // Ensure temp directory exists
      const tempDir = path.join(__dirname, "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      fs.writeFileSync(tempAnnotationsPath, JSON.stringify(annotations));
      args.push("--annotations", tempAnnotationsPath);
    }

    // Spawn Python process
    const pythonProcess = spawn("python3", args);

    let outputData = "";
    let errorData = "";

    // Collect output
    pythonProcess.stdout.on("data", (data) => {
      outputData += data.toString();
      console.log("Python output:", data.toString());
    });

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
      console.error("Python error:", data.toString());
    });

    // Handle process completion
    pythonProcess.on("close", (code) => {
      // Clean up temp file
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
        // Parse the output as JSON
        const result = JSON.parse(outputData);
        res.json({
          success: true,
          data: result,
        });
      } catch (parseError) {
        // If output is not JSON, return as text
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

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
