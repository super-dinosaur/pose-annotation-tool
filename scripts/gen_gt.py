import json
import os
import os.path as osp
from icecream import ic
import random

# Get project root path
path = osp.dirname(osp.dirname(osp.abspath(__file__)))
temp_dir = osp.join(path, 'TempAnnoFile')

# Create temp directory if it doesn't exist
if not osp.exists(temp_dir):
    os.makedirs(temp_dir)

def generate_mock_keypoints(base_x, base_y, person_id):
    """Generate mock keypoints for a person"""
    # Add some variation based on person_id
    offset_x = person_id * 200
    offset_y = person_id * 50
    
    return {
        "nose": {"x": base_x + offset_x, "y": base_y + offset_y, "confidence": 0.95},
        "left_eye": {"x": base_x + offset_x - 10, "y": base_y + offset_y - 10, "confidence": 0.92},
        "right_eye": {"x": base_x + offset_x + 10, "y": base_y + offset_y - 10, "confidence": 0.93},
        "left_ear": {"x": base_x + offset_x - 20, "y": base_y + offset_y - 5, "confidence": 0.88},
        "right_ear": {"x": base_x + offset_x + 20, "y": base_y + offset_y - 5, "confidence": 0.89},
        "left_shoulder": {"x": base_x + offset_x - 40, "y": base_y + offset_y + 40, "confidence": 0.91},
        "right_shoulder": {"x": base_x + offset_x + 40, "y": base_y + offset_y + 40, "confidence": 0.90},
        "left_elbow": {"x": base_x + offset_x - 60, "y": base_y + offset_y + 80, "confidence": 0.87},
        "right_elbow": {"x": base_x + offset_x + 60, "y": base_y + offset_y + 80, "confidence": 0.86},
        "left_wrist": {"x": base_x + offset_x - 70, "y": base_y + offset_y + 120, "confidence": 0.85},
        "right_wrist": {"x": base_x + offset_x + 70, "y": base_y + offset_y + 120, "confidence": 0.84},
        "left_hip": {"x": base_x + offset_x - 30, "y": base_y + offset_y + 140, "confidence": 0.89},
        "right_hip": {"x": base_x + offset_x + 30, "y": base_y + offset_y + 140, "confidence": 0.88},
        "left_knee": {"x": base_x + offset_x - 35, "y": base_y + offset_y + 200, "confidence": 0.83},
        "right_knee": {"x": base_x + offset_x + 35, "y": base_y + offset_y + 200, "confidence": 0.82},
        "left_ankle": {"x": base_x + offset_x - 40, "y": base_y + offset_y + 260, "confidence": 0.80},
        "right_ankle": {"x": base_x + offset_x + 40, "y": base_y + offset_y + 260, "confidence": 0.79}
    }

def generate_frame_data(frame_idx, num_persons=2):
    """Generate mock inference data for a frame"""
    predictions = []
    
    for person_id in range(num_persons):
        # Simulate movement across frames
        base_x = 300 + frame_idx * 120
        base_y = 200 + frame_idx * 80
        
        keypoints = generate_mock_keypoints(base_x, base_y, person_id)
        
        # Calculate bounding box from keypoints
        x_coords = [kp["x"] for kp in keypoints.values()]
        y_coords = [kp["y"] for kp in keypoints.values()]
        bbox = [
            min(x_coords) - 10,
            min(y_coords) - 10,
            max(x_coords) - min(x_coords) + 20,
            max(y_coords) - min(y_coords) + 20
        ]
        
        predictions.append({
            "person_id": f"person_{person_id}",
            "keypoints": keypoints,
            "bbox": bbox,
            "confidence": 0.85 + random.random() * 0.1
        })
    
    return {
        "frame": frame_idx,
        "predictions": predictions
    }

def clean_temp_files():
    """Clean existing temp files"""
    print("Cleaning existing temp files...")
    for file in os.listdir(temp_dir):
        if file.startswith(('inf_frame_', 'fin_frame_')) and file.endswith('.json'):
            os.remove(osp.join(temp_dir, file))
            print(f"Removed: {file}")

if __name__ == "__main__":
    # Number of frames to generate
    num_frames = 10
    
    # Clean existing files
    clean_temp_files()
    
    print(f"\nGenerating {num_frames} mock inference files...")
    
    # Generate inference files for multiple frames
    for frame_idx in range(num_frames):
        inf_file_path = osp.join(temp_dir, f'inf_frame_{frame_idx}.json')
        ic(inf_file_path)        
        # Generate mock data
        frame_data = generate_frame_data(frame_idx)
        
        # Save to file
        with open(inf_file_path, 'w') as f:
            json.dump(frame_data, f, indent=4)
        
        print(f"Generated: inf_frame_{frame_idx}.json")
    
    print(f"\nGenerated {num_frames} mock inference files in {temp_dir}")
    print("\nYou can now run the inference process!")
