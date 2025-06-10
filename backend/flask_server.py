from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import os
import tempfile

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'Backend is running'})

@app.route('/api/inference', methods=['POST'])
def run_inference():
    try:
        data = request.json
        video_path = data.get('videoPath')
        frame_number = data.get('frameNumber')
        annotations = data.get('annotations')
        
        if not video_path or frame_number is None:
            return jsonify({'error': 'Missing required parameters'}), 400
        
        # Run the inference script
        cmd = [
            'python3', 
            os.path.join('..', 'scripts', 'inference.py'),
            '--video', video_path,
            '--frame', str(frame_number)
        ]
        
        # If annotations provided, save to temp file
        temp_annotations = None
        if annotations:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                json.dump(annotations, f)
                temp_annotations = f.name
                cmd.extend(['--annotations', temp_annotations])
        
        # Execute the script
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        # Clean up temp file
        if temp_annotations:
            os.unlink(temp_annotations)
        
        if result.returncode != 0:
            return jsonify({'error': 'Inference failed', 'details': result.stderr}), 500
        
        # Parse the output
        try:
            output_data = json.loads(result.stdout)
            return jsonify({'success': True, 'data': output_data})
        except json.JSONDecodeError:
            return jsonify({'success': True, 'data': result.stdout})
            
    except Exception as e:
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
