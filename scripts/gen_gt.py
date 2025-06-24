import json
import os.path as osp
from icecream import ic

frame_idx = 0
path = osp.dirname(osp.dirname(osp.abspath(__file__)))
expected_file_path = osp.join(path,'TempAnnoFile','anno4frame_'+f'{frame_idx}.json')
source_anno_file_path = osp.join(path,'TempAnnoFile','gt4frame_'+f'{frame_idx}.json')

if __name__ == "__main__":
    result = {
            "frame" : frame_idx,
            "predictions" : [
                {
                 "person_id" : 0, 
                 "keypoints": {
                    "nose": {"x": 420, "y": 340, "confidence": 0.95},
                    "left_eye": {"x": 410, "y": 330, "confidence": 0.92},
                    "right_eye": {"x": 430, "y": 330, "confidence": 0.93},
                    # Add more keypoints as needed
                },
                 "bbox":[440,220,20,10]
                },
                { 
                 "person_id" : 1, 
                 "keypoints": {
                    "nose": {"x": 420, "y": 340, "confidence": 0.95},
                    "left_eye": {"x": 410, "y": 330, "confidence": 0.92},
                    "right_eye": {"x": 430, "y": 330, "confidence": 0.93},
                    # Add more keypoints as needed
                },
                 "bbox":[440,220,20,10]
                },
                ]
            }
    with open(source_anno_file_path,'w') as f:
        json.dump(result,f,indent=4)
        ic(source_anno_file_path) 
