/**
 *src/features/annotation/components/AnnotationCanvas.js
 * Annotation canvas component using React Konva
 */

import React, { useCallback, useMemo, useEffect, useState } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Circle,
  Line,
  Text,
} from "react-konva";
import { message } from "antd";
import { useAppContext } from "../../../store";
import { useVideoFrame } from "../../video/hooks/useVideoFrame";
import {
  SKELETON_CONNECTIONS,
  VISUAL_CONSTANTS,
  KEYPOINTS,
} from "../../../constants";
import { getNextKeypoint } from "../../../utils/annotation";
import { calculateScaleFactor } from "../../../utils/video";
import "./AnnotationCanvas.css";

/**
 * AnnotationCanvas component
 * @returns {JSX.Element}
 */
export const AnnotationCanvas = () => {
  const { state, actions } = useAppContext();
  const { video, annotation } = state;

  // 移除 useVideoFrame 的调用，因为视频处理应该在一个地方进行
  // const { frameImage, isLoading } = useVideoFrame();

  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [image, setImage] = useState(null);

  // Calculate scale and canvas dimensions
  const { canvasWidth, canvasHeight, scale } = useMemo(() => {
    if (!video.info.width || !video.info.height) {
      return { canvasWidth: 800, canvasHeight: 600, scale: 1 };
    }

    const containerWidth = stageSize.width - 40; // Padding
    const containerHeight = stageSize.height - 40;

    const calculatedScale = calculateScaleFactor(
      video.info.width,
      video.info.height,
      containerWidth,
      containerHeight,
    );

    return {
      canvasWidth: video.info.width * calculatedScale,
      canvasHeight: video.info.height * calculatedScale,
      scale: calculatedScale,
    };
  }, [video.info.width, video.info.height, stageSize]);

  // Update stage size based on container
  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector(".annotation-canvas");
      if (container) {
        setStageSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // Load frame image
  useEffect(() => {
    console.log(
      "Frame image updated:",
      video.frameImage ? "Image received" : "No image",
    );

    if (video.frameImage) {
      const img = new window.Image();
      img.onload = () => {
        console.log("Image loaded into canvas");
        setImage(img);
      };
      img.onerror = (error) => {
        console.error("Image load error:", error);
      };
      img.src = video.frameImage;
    } else {
      console.log("video.frameImage is False!");
      setImage(null);
    }
  }, [video.frameImage]);

  // Get current frame annotations
  const currentFrameAnnotations = useMemo(() => {
    const frameKey = `frame_${video.currentFrame}`;
    return annotation.annotations[frameKey] || {};
  }, [annotation.annotations, video.currentFrame]);

  // Handle canvas click for annotation
  const handleStageClick = useCallback(
    (e) => {
      if (!annotation.selectedPersonId || !annotation.selectedKeypoint) {
        message.warning("Please select a person and keypoint first");
        return;
      }

      const stage = e.target.getStage();
      const pointerPosition = stage.getPointerPosition();

      // Convert screen coordinates to image coordinates
      const imageX = pointerPosition.x / scale;
      const imageY = pointerPosition.y / scale;

      // Add annotation
      actions.addAnnotation(
        video.currentFrame,
        annotation.selectedPersonId,
        annotation.selectedKeypoint.id,
        { x: imageX, y: imageY },
      );

      // Auto-select next keypoint
      const nextKeypoint = getNextKeypoint(annotation.selectedKeypoint);
      if (nextKeypoint) {
        actions.setSelectedKeypoint(nextKeypoint);
      }

      message.success(`Annotated ${annotation.selectedKeypoint.name}`);
    },
    [
      annotation.selectedPersonId,
      annotation.selectedKeypoint,
      scale,
      video.currentFrame,
      actions,
    ],
  );

  // Render keypoints for all persons
  const renderKeypoints = useCallback(() => {
    //stop in line 203
    const elements = [];

    annotation.persons.forEach((person) => {
      const personAnnotations = currentFrameAnnotations[person.id] || {};

      // Render keypoints
      Object.entries(personAnnotations).forEach(([keypointId, position]) => {
        const keypoint = KEYPOINTS.find((kp) => kp.id === parseInt(keypointId));
        if (!keypoint || !position) return;

        const isSelected =
          annotation.selectedPersonId === person.id &&
          annotation.selectedKeypoint?.id === parseInt(keypointId);

        elements.push(
          <Circle
            key={`${person.id}-${keypointId}`}
            x={position.x * scale}
            y={position.y * scale}
            radius={VISUAL_CONSTANTS.KEYPOINT_RADIUS}
            fill={keypoint.color}
            stroke={VISUAL_CONSTANTS.KEYPOINT_STROKE}
            strokeWidth={VISUAL_CONSTANTS.KEYPOINT_STROKE_WIDTH}
            opacity={isSelected ? 1 : 0.8}
            scaleX={isSelected ? 1.2 : 1}
            scaleY={isSelected ? 1.2 : 1}
          />,
        );

        // Add keypoint label
        elements.push(
          <Text
            key={`label-${person.id}-${keypointId}`}
            x={position.x * scale + 10}
            y={position.y * scale - 10}
            text={keypoint.name}
            fontSize={10}
            fill={keypoint.color}
            fontStyle="bold"
          />,
        );
      });

      // Render skeleton connections
      SKELETON_CONNECTIONS.forEach(([startId, endId], index) => {
        const startPos = personAnnotations[startId];
        const endPos = personAnnotations[endId];

        if (startPos && endPos) {
          elements.push(
            <Line
              key={`skeleton-${person.id}-${index}`}
              points={[
                startPos.x * scale,
                startPos.y * scale,
                endPos.x * scale,
                endPos.y * scale,
              ]}
              stroke={person.color}
              strokeWidth={VISUAL_CONSTANTS.SKELETON_LINE_WIDTH}
              opacity={0.6}
            />,
          );
        }
      });
    });

    return elements;
  }, [
    annotation.persons,
    currentFrameAnnotations,
    annotation.selectedPersonId,
    annotation.selectedKeypoint,
    scale,
  ]);

  //start return part
  if (!video.src) {
    return (
      <div className="annotation-canvas">
        <div className="canvas-placeholder">
          <div className="placeholder-content">
            <h3>No Video Loaded</h3>
            <p>Please upload a video to start annotation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="annotation-canvas">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onClick={handleStageClick}
        className="annotation-stage"
      >
        <Layer>
          {image && (
            <KonvaImage
              image={image}
              width={canvasWidth}
              height={canvasHeight}
              x={0}
              y={0}
            />
          )}
          {renderKeypoints()}
        </Layer>
      </Stage>

      {annotation.selectedKeypoint && annotation.selectedPersonId && (
        <div className="annotation-hint">
          <span>
            Click to place{" "}
            <strong style={{ color: annotation.selectedKeypoint.color }}>
              {annotation.selectedKeypoint.name}
            </strong>{" "}
            for{" "}
            <strong
              style={{
                color: annotation.persons.find(
                  (p) => p.id === annotation.selectedPersonId,
                )?.color,
              }}
            >
              {
                annotation.persons.find(
                  (p) => p.id === annotation.selectedPersonId,
                )?.name
              }
            </strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default AnnotationCanvas;
