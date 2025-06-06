import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Circle, Line, Image } from 'react-konva';
import { 
  KEYPOINTS, 
  SKELETON_CONNECTIONS, 
  KEYPOINT_RADIUS, 
  KEYPOINT_STROKE, 
  KEYPOINT_STROKE_WIDTH,
  SKELETON_COLOR,
  PERSON_COLORS
} from '../../constants/keypoints';
import './KeypointAnnotator.css';

/**
 * 关键点标注组件
 * @param {Object} props - 组件属性
 * @param {string} props.frameImage - 当前帧图像的 Data URL
 * @param {number} props.videoWidth - 视频宽度
 * @param {number} props.videoHeight - 视频高度
 * @param {number} props.scale - 缩放比例
 * @param {Object} props.annotations - 标注数据
 * @param {number} props.currentFrame - 当前帧索引
 * @param {Object} props.selectedKeypoint - 当前选中的关键点
 * @param {Function} props.onAnnotate - 标注回调函数
 * @param {Function} props.onKeypointSelect - 关键点选择回调函数
 * @param {string} props.selectedPerson - 当前选中的人物ID
 * @param {Object} props.persons - 所有人物数据
 * @returns {JSX.Element} - 返回关键点标注组件
 */
const KeypointAnnotator = ({ 
  frameImage, 
  videoWidth, 
  videoHeight, 
  scale, 
  annotations, 
  currentFrame,
  selectedKeypoint,
  onAnnotate,
  onKeypointSelect,
  selectedPerson,
  persons
}) => {
  const [image, setImage] = useState(null);
  const [stageWidth, setStageWidth] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);
  const stageRef = useRef(null);

  // 当帧图像变化时，加载新图像
  useEffect(() => {
    if (frameImage) {
      const img = new window.Image();
      img.src = frameImage;
      img.onload = () => {
        setImage(img);
      };
    } else {
      setImage(null);
    }
  }, [frameImage]);

  // 更新舞台尺寸
  useEffect(() => {
    if (videoWidth && videoHeight && scale) {
      setStageWidth(videoWidth * scale);
      setStageHeight(videoHeight * scale);
    }
  }, [videoWidth, videoHeight, scale]);

  // 处理舞台点击事件
  const handleStageClick = (e) => {
    if (!selectedKeypoint || !selectedPerson) return;
    
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const x = pointerPosition.x / scale;
    const y = pointerPosition.y / scale;
    
    console.log('标注关键点:', {
      frame: currentFrame,
      person: selectedPerson,
      keypoint: selectedKeypoint.id,
      position: { x, y }
    });
    
    // 调用标注函数
    onAnnotate(currentFrame, selectedPerson, selectedKeypoint.id, { x, y });
    
    // 强制刷新
    setTimeout(() => {
      if (stageRef.current) {
        stageRef.current.batchDraw();
      }
    }, 0);
  };

  // 处理鼠标滚轮事件，用于切换关键点
  const handleWheel = (e) => {
    e.evt.preventDefault(); // 阻止默认滚动行为
    
    if (!selectedPerson) return; // 如果没有选中人物，不进行操作
    
    if (!selectedKeypoint && KEYPOINTS.length > 0) {
      // 如果当前没有选中关键点，则选择第一个
      onKeypointSelect(KEYPOINTS[0]);
      return;
    }
    
    // 获取当前选中关键点的索引
    const currentIndex = KEYPOINTS.findIndex(kp => kp.id === selectedKeypoint.id);
    
    // 根据滚轮方向选择下一个或上一个关键点
    let nextIndex;
    if (e.evt.deltaY > 0) {
      // 向下滚动，选择下一个关键点
      nextIndex = (currentIndex + 1) % KEYPOINTS.length;
    } else {
      // 向上滚动，选择上一个关键点
      nextIndex = (currentIndex - 1 + KEYPOINTS.length) % KEYPOINTS.length;
    }
    
    // 更新选中的关键点
    onKeypointSelect(KEYPOINTS[nextIndex]);
  };

  // 获取当前帧的标注数据
  const getCurrentFrameAnnotations = () => {
    const frameKey = `frame_${currentFrame}`;
    const frameAnnotations = annotations[frameKey] || {};
    console.log(`当前帧 ${currentFrame} 的标注数据:`, frameAnnotations);
    return frameAnnotations;
  };

  // 获取人物的颜色
  const getPersonColor = (personId) => {
    console.log('获取人物颜色, persons类型:', Array.isArray(persons) ? 'Array' : typeof persons, 'personId:', personId);
    
    // 处理persons为数组的情况
    if (Array.isArray(persons)) {
      const person = persons.find(p => p.id === personId);
      if (person && person.color) {
        return person.color;
      }
    } 
    // 处理persons为对象的情况
    else if (persons && typeof persons === 'object') {
      if (persons[personId] && persons[personId].color) {
        return persons[personId].color;
      }
    }
    
    // 默认颜色选择
    const colorIndex = (parseInt(personId) || 0) % PERSON_COLORS.length;
    return PERSON_COLORS[colorIndex];
  };

  // 渲染所有人物的关键点
  const renderKeypoints = () => {
    const frameAnnotations = getCurrentFrameAnnotations();
    const allKeypoints = [];
    
    console.log('渲染关键点，数据类型:', typeof frameAnnotations, '数据:', frameAnnotations);
    
    if (!frameAnnotations || typeof frameAnnotations !== 'object') {
      console.log('帧标注数据无效，跳过渲染');
      return allKeypoints;
    }
    
    // 遍历所有人物的标注
    Object.entries(frameAnnotations).forEach(([personId, personAnnotations]) => {
      if (!personAnnotations || typeof personAnnotations !== 'object') {
        console.log(`跳过无效的人物标注数据 (personId: ${personId}):`, personAnnotations);
        return;
      }
      
      const personColor = getPersonColor(personId);
      const isSelectedPerson = personId === selectedPerson;
      
      console.log(`渲染人物 ${personId} 的关键点，颜色: ${personColor}, 数据类型:`, typeof personAnnotations);
      
      // 遍历该人物的所有关键点
      Object.entries(personAnnotations).forEach(([keypointId, position]) => {
        // 校验位置数据
        if (!position || typeof position !== 'object' || !('x' in position) || !('y' in position)) {
          console.log(`跳过无效的关键点位置数据 (keypointId: ${keypointId}):`, position);
          return;
        }
        
        // 确保keypointId是数字
        const keypointIdNum = parseInt(keypointId);
        if (isNaN(keypointIdNum)) {
          console.log(`跳过非数字关键点ID: ${keypointId}`);
          return;
        }
        
        const keypoint = KEYPOINTS.find(k => k.id === keypointIdNum);
        if (!keypoint) {
          console.log(`找不到关键点定义: ${keypointId}`);
          return;
        }
        
        // 判断是否为当前选中的关键点
        const isSelected = isSelectedPerson && selectedKeypoint && selectedKeypoint.id === keypointIdNum;
        
        console.log(`渲染关键点 ${keypointId} 在位置: x=${position.x}, y=${position.y}`);
        
        allKeypoints.push(
          <Circle
            key={`${personId}-${keypointId}`}
            x={position.x * scale}
            y={position.y * scale}
            radius={isSelected ? KEYPOINT_RADIUS * 1.5 : KEYPOINT_RADIUS}
            fill={isSelectedPerson ? keypoint.color : personColor}
            stroke={KEYPOINT_STROKE}
            strokeWidth={isSelected ? KEYPOINT_STROKE_WIDTH * 1.5 : KEYPOINT_STROKE_WIDTH}
            opacity={isSelectedPerson ? 1 : 0.7}
          />
        );
      });
    });
    
    console.log(`总共渲染 ${allKeypoints.length} 个关键点`);
    return allKeypoints;
  };

  // 渲染所有人物的骨架连接线
  const renderSkeleton = () => {
    const frameAnnotations = getCurrentFrameAnnotations();
    const allSkeletons = [];
    
    if (!frameAnnotations || typeof frameAnnotations !== 'object') {
      console.log('帧标注数据无效，跳过骨架渲染');
      return allSkeletons;
    }
    
    // 遍历所有人物的标注
    Object.entries(frameAnnotations).forEach(([personId, personAnnotations]) => {
      if (!personAnnotations || typeof personAnnotations !== 'object') {
        console.log(`跳过无效的人物骨架数据 (personId: ${personId})`);
        return;
      }
      
      const personColor = getPersonColor(personId);
      const isSelectedPerson = personId === selectedPerson;
      
      // 为该人物渲染骨架
      SKELETON_CONNECTIONS.forEach((connection, index) => {
        const [fromId, toId] = connection;
        const fromPoint = personAnnotations[fromId];
        const toPoint = personAnnotations[toId];
        
        if (!fromPoint || !('x' in fromPoint) || !('y' in fromPoint) || 
            !toPoint || !('x' in toPoint) || !('y' in toPoint)) {
          // 缺少连接点，跳过该连接
          return;
        }
        
        allSkeletons.push(
          <Line
            key={`${personId}-${index}`}
            points={[
              fromPoint.x * scale,
              fromPoint.y * scale,
              toPoint.x * scale,
              toPoint.y * scale
            ]}
            stroke={isSelectedPerson ? SKELETON_COLOR : personColor}
            strokeWidth={isSelectedPerson ? 2 : 1.5}
            opacity={isSelectedPerson ? 0.8 : 0.6}
          />
        );
      });
    });
    
    console.log(`总共渲染 ${allSkeletons.length} 条骨架连接线`);
    return allSkeletons;
  };

  // 渲染当前选中的关键点和人物指示器
  const renderSelectedKeypointIndicator = () => {
    if (!selectedKeypoint || !selectedPerson) return null;
    
    // 获取人物名称 - 处理persons可能是对象或数组的情况
    let personName = '未命名';
    let personColor = getPersonColor(selectedPerson);
    
    if (Array.isArray(persons)) {
      const selectedPersonObj = persons.find(p => p.id === selectedPerson);
      if (selectedPersonObj) {
        personName = selectedPersonObj.name || '未命名';
        personColor = selectedPersonObj.color || personColor;
      }
    } else if (persons && typeof persons === 'object') {
      if (persons[selectedPerson]) {
        personName = persons[selectedPerson].name || '未命名';
        personColor = persons[selectedPerson].color || personColor;
      }
    }
    
    console.log(`当前选中的人物: ID=${selectedPerson}, 名称=${personName}, 颜色=${personColor}`);
    
    return (
      <div className="selected-keypoint-indicator">
        <div>
          人物: <span className="person-name-indicator" style={{ color: personColor }}>{personName}</span>
        </div>
        <div>
          关键点: <span style={{ color: selectedKeypoint.color }}>{selectedKeypoint.name}</span>
          <div className="keypoint-color-dot" style={{ backgroundColor: selectedKeypoint.color }}></div>
        </div>
      </div>
    );
  };

  if (!frameImage) {
    return <div className="keypoint-annotator-placeholder">请上传视频文件</div>;
  }

  return (
    <div className="keypoint-annotator">
      {renderSelectedKeypointIndicator()}
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        onClick={handleStageClick}
        onWheel={handleWheel}
      >
        <Layer>
          {image && (
            <Image
              image={image}
              width={stageWidth}
              height={stageHeight}
            />
          )}
          {renderSkeleton()}
          {renderKeypoints()}
        </Layer>
      </Stage>
      {!selectedPerson && (
        <div className="no-person-selected-overlay">
          <div className="no-person-selected-message">
            请先选择或创建一个人物
          </div>
        </div>
      )}
    </div>
  );
};

export default KeypointAnnotator; 