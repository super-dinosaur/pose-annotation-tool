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
  res.json({ status: "OK", message: "MOTPose Backend is running" });
});

// MOTPose inference endpoint
app.post("/api/inference", async (req, res) => {
  try {
    const { 
      videoPath, 
      configPath, 
      inferenceModel, 
      outputsDir,
      useDistributed = false,
      useWandb = false 
    } = req.body;

    console.log("Received MOTPose inference request:", {
      videoPath,
      configPath,
      inferenceModel,
      outputsDir,
      useDistributed,
      useWandb
    });

    // Validate required input parameters
    if (!videoPath) {
      return res.status(400).json({
        error: "Missing required parameter: videoPath",
      });
    }

    // Set default paths if not provided
    const defaultConfigPath = configPath || "/home/ghy/MOTPose/configs/20250314_test.yaml";
    const defaultInferenceModel = inferenceModel || "/home/ghy/MOTPose/pretrains/motpose_0324_checkpoint_19.pth";
    const defaultOutputsDir = outputsDir || "./outputs/6.4";

    // Prepare the conda activation and Python command
    // We'll use bash to run the conda activate command followed by python
    const bashCommand = `
      source ~/miniconda3/etc/profile.d/conda.sh && \
      conda activate MOTIP && \
      python /home/ghy/MOTPose/main_react.py \
        --mode video \
        --use-distributed ${useDistributed} \
        --use-wandb ${useWandb} \
        --config-path "${defaultConfigPath}" \
        --video-path "${videoPath}" \
        --inference-model "${defaultInferenceModel}" \
        --outputs-dir "${defaultOutputsDir}"
    `;

    console.log("Executing command:", bashCommand);

    // Spawn bash process to execute the conda environment and python script
    const process = spawn("bash", ["-c", bashCommand], {
      cwd: "/home/ghy/MOTPose" // Set working directory
    });

    let outputData = "";
    let errorData = "";

    // Collect stdout
    process.stdout.on("data", (data) => {
      const output = data.toString();
      outputData += output;
      console.log("MOTPose output:", output);
    });

    // Collect stderr
    process.stderr.on("data", (data) => {
      const error = data.toString();
      errorData += error;
      console.error("MOTPose error:", error);
    });

    // Handle process completion
    process.on("close", (code) => {
      console.log(`MOTPose process exited with code ${code}`);

      if (code !== 0) {
        console.error(`MOTPose process failed with code ${code}`);
        return res.status(500).json({
          error: "MOTPose inference failed",
          exitCode: code,
          details: errorData,
          output: outputData
        });
      }

      // Success response
      res.json({
        success: true,
        message: "MOTPose inference completed successfully",
        exitCode: code,
        output: outputData,
        outputsDir: defaultOutputsDir
      });
    });

    // Handle process errors
    process.on("error", (error) => {
      console.error("Failed to start MOTPose process:", error);
      res.status(500).json({
        error: "Failed to start MOTPose process",
        details: error.message
      });
    });

  } catch (error) {
    console.error("MOTPose inference error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Get output files endpoint (optional - to list generated files)
app.get("/api/inference/outputs", (req, res) => {
  try {
    const { outputsDir = "./outputs/6.4" } = req.query;
    const fullOutputPath = path.resolve("/home/ghy/MOTPose", outputsDir);

    if (!fs.existsSync(fullOutputPath)) {
      return res.status(404).json({
        error: "Output directory not found",
        path: fullOutputPath
      });
    }

    const files = fs.readdirSync(fullOutputPath);
    res.json({
      success: true,
      outputsDir: fullOutputPath,
      files: files
    });

  } catch (error) {
    console.error("Error reading output directory:", error);
    res.status(500).json({
      error: "Failed to read output directory",
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`MOTPose Backend server running on http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("  GET  /api/health - Health check");
  console.log("  POST /api/inference - Run MOTPose inference");
  console.log("  GET  /api/inference/outputs - List output files");
});