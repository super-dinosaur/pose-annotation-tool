import numpy as np
import os.path as osp
import os
from icecream import ic
import json

frame_idx = 0;
path = osp.dirname(osp.dirname(osp.abspath(__file__)))
ic(path)

if __name__ == '__main__':
    while(True):
        # check whether file named osp.join(path,'TempAnnoFile','anno4frame_'+'${frame_idx}')exists
        # if exist, then load it
        # if not, then continue the loop
        expected_file_path = osp.join(path,'TempAnnoFile','anno4frame_'+f'{frame_idx}.json')
        source_anno_file_path = osp.join(path,'TempAnnoFile','gt4frame_'+f'{frame_idx}.json')
        if expected_file_path :
            #mock inference 
            result = json.load(source_anno_file_path)
            with open(expected_file_path,'w') as f:
                json.dump(result,f,indent=4)
        else:
            pass
