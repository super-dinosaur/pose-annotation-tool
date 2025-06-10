# Backend Setup Guide

## Installation

1. Navigate to the backend directory:
```bash
cd backend
npm install
```

2. Install Python dependencies for inference (if needed):
```bash
pip install opencv-python numpy torch torchvision
# Add other dependencies your inference script needs
```

## Running the Backend

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The backend will run on http://localhost:5000

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns: `{ status: 'OK', message: 'Backend is running' }`

### Run Inference
- **POST** `/api/inference`
- Body:
  ```json
  {
    "videoPath": "path/to/video.mp4",
    "frameNumber": 42,
    "annotations": {} // optional existing annotations
  }
  ```
- Returns:
  ```json
  {
    "success": true,
    "data": {
      "frame": 42,
      "predictions": [...],
      "processing_time_ms": 150
    }
  }
  ```

## Customizing the Inference Script

Edit `scripts/inference.py` to implement your actual inference logic:

1. Replace the `run_inference()` function with your model loading and inference code
2. Ensure the script outputs JSON to stdout
3. Use stderr for logging/debugging messages

## Troubleshooting

1. **Python not found**: Make sure Python 3 is installed and available as `python3`
2. **Module not found**: Install required Python packages
3. **CORS errors**: The backend is configured to allow all origins in development
