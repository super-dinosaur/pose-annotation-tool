/**
 * 从视频中提取指定帧的图像
 * @param {HTMLVideoElement} videoElement - 视频元素
 * @param {number} frameIndex - 帧索引
 * @param {number} frameRate - 帧率
 * @returns {Promise<string>} - 返回帧图像的 Data URL
 */
export const extractFrameFromVideo = (videoElement, frameIndex, frameRate) => {
  return new Promise((resolve, reject) => {
    if (!videoElement) {
      reject(new Error('视频元素不存在'));
      return;
    }

    // 创建临时 canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置视频时间到指定帧
    videoElement.currentTime = frameIndex / frameRate;
    
    // 视频时间更新后绘制当前帧
    videoElement.onseeked = () => {
      try {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
        
        // 将当前帧转换为图像URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    videoElement.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * 计算视频的总帧数
 * @param {number} duration - 视频时长（秒）
 * @param {number} frameRate - 帧率
 * @returns {number} - 总帧数
 */
export const calculateTotalFrames = (duration, frameRate) => {
  return Math.floor(duration * frameRate);
};

/**
 * 计算适当的缩放比例，使视频适应容器
 * @param {number} videoWidth - 视频宽度
 * @param {number} videoHeight - 视频高度
 * @param {number} containerWidth - 容器宽度
 * @param {number} containerHeight - 容器高度
 * @returns {number} - 缩放比例
 */
export const calculateScaleFactor = (videoWidth, videoHeight, containerWidth, containerHeight) => {
  if (!videoWidth || !videoHeight || !containerWidth || !containerHeight) {
    return 1;
  }
  
  // 计算宽度和高度的缩放比例
  const widthScale = containerWidth / videoWidth;
  const heightScale = containerHeight / videoHeight;
  
  // 取较小的缩放比例，确保视频完全适应容器
  return Math.min(widthScale, heightScale);
};

/**
 * 将标注数据导出为JSON文件
 * @param {Object} annotations - 标注数据
 * @param {Array|Object} persons - 人物数据（可能是数组或对象）
 * @param {Object} videoInfo - 视频信息
 * @param {string} filename - 文件名
 */
export const exportAnnotationsToJson = (annotations, persons, videoInfo, filename = 'annotations.json') => {
  // 定义关键点ID到英文名称的映射
  const keypointIdToName = {
    0: 'Nose',
    1: 'LeftEye',
    2: 'RightEye',
    3: 'LeftEar',
    4: 'RightEar',
    5: 'LeftShoulder',
    6: 'RightShoulder',
    7: 'LeftElbow',
    8: 'RightElbow',
    9: 'LeftWrist',
    10: 'RightWrist',
    11: 'LeftHip',
    12: 'RightHip',
    13: 'LeftKnee',
    14: 'RightKnee',
    15: 'LeftAnkle',
    16: 'RightAnkle'
  };
  
  // 处理persons参数，确保正确格式无论输入是数组还是对象
  const personsObj = {};
  
  // 如果persons是数组，转换为对象格式，确保没有重复ID
  if (Array.isArray(persons)) {
    // 过滤掉重复ID的人物
    const uniquePersons = persons.filter((person, index, self) => 
      index === self.findIndex(p => p.id === person.id)
    );
    
    uniquePersons.forEach(person => {
      personsObj[person.id] = person;
    });
  } else {
    // 如果已经是对象格式，直接使用
    Object.assign(personsObj, persons);
  }
  
  // 创建新的标注数据，将数字ID替换为名称
  const transformedAnnotations = {};
  
  // 处理人物数据，确保ID格式正确
  const transformedPersons = {};
  const usedPersonNames = new Set(); // 用于跟踪已使用的人物名称
  const usedExportIds = new Set(); // 用于跟踪已使用的导出ID
  
  Object.entries(personsObj).forEach(([personId, personData]) => {
    // 为每个人物创建一个唯一的名称作为ID
    let baseName = personData.name ? personData.name.replace(/\s+/g, '_').toLowerCase() : `person_${personId}`;
    
    // 生成唯一的exportId
    let exportId = `${baseName}_${personId}`;
    
    // 确保exportId唯一
    let counter = 1;
    while (usedExportIds.has(exportId)) {
      exportId = `${baseName}_${personId}_${counter}`;
      counter++;
    }
    usedExportIds.add(exportId);
    
    // 同样确保名称唯一（用于显示）
    let displayName = personData.name || `Person_${personId}`;
    let nameCounter = 1;
    let originalName = displayName;
    while (usedPersonNames.has(displayName.toLowerCase())) {
      displayName = `${originalName}_${nameCounter}`;
      nameCounter++;
    }
    usedPersonNames.add(displayName.toLowerCase());
    
    transformedPersons[exportId] = {
      ...personData,
      name: displayName,
      originalId: personId // 保留原始ID以便参考
    };
  });
  
  // 创建人物ID映射表：原始ID -> 新ID
  const personIdMap = {};
  Object.entries(transformedPersons).forEach(([newId, personData]) => {
    personIdMap[personData.originalId] = newId;
  });
  
  // 遍历每一帧
  Object.entries(annotations).forEach(([frameKey, frameData]) => {
    transformedAnnotations[frameKey] = {};
    
    // 遍历每个人物
    Object.entries(frameData).forEach(([personId, personData]) => {
      // 使用新的人物ID
      const newPersonId = personIdMap[personId] || personId;
      transformedAnnotations[frameKey][newPersonId] = {};
      
      // 遍历每个关键点，将ID替换为名称
      Object.entries(personData).forEach(([keypointId, position]) => {
        const keypointName = keypointIdToName[keypointId] || keypointId;
        transformedAnnotations[frameKey][newPersonId][keypointName] = position;
      });
    });
  });
  
  // 删除transformedPersons中的originalId字段
  Object.values(transformedPersons).forEach(person => {
    delete person.originalId;
  });
  
  // 准备完整的导出数据
  const exportData = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    videoInfo,
    persons: transformedPersons,
    annotations: transformedAnnotations
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', filename);
  linkElement.click();
};

/**
 * 从JSON文件导入标注数据
 * @param {File} file - JSON文件
 * @returns {Promise<Object>} - 返回解析后的标注数据
 */
export const importAnnotationsFromJson = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('未选择文件'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // 验证导入的数据格式
        if (!data.annotations) {
          reject(new Error('导入的JSON文件格式不正确，缺少annotations字段'));
          return;
        }
        
        resolve({
          annotations: data.annotations,
          persons: data.persons || {},
          videoInfo: data.videoInfo || {}
        });
      } catch (error) {
        reject(new Error(`解析JSON文件失败: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };
    
    reader.readAsText(file);
  });
}; 