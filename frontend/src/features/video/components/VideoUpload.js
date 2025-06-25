/**
 * Video upload component
 */

import React, { useCallback, useEffect } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { validateVideoFile, createVideoUrl, uploadVideoToServer } from "../services/videoService";
import "./VideoUpload.css";

/**
 * VideoUpload component
 * @param {Object} props - Component props
 * @param {Function} props.onVideoUpload - Callback when video is uploaded
 * @param {boolean} props.disabled - Whether upload is disabled
 * @returns {JSX.Element}
 */
export const VideoUpload = ({ onVideoUpload, disabled = false }) => {
  const handleFileSelect = useCallback(
    async (file) => {
      console.log("====== 视频上传流程开始 ======");
      console.log("1. 文件信息:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      });

      // 验证文件
      const isValid = validateVideoFile(file);
      console.log("2. 文件验证结果:", isValid);

      if (!isValid) {
        message.error("请选择有效的视频文件！");
        return false;
      }

      // 检查文件大小
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        console.log("文件太大:", file.size);
        message.error("视频文件太大！最大500MB");
        return false;
      }

      // 处理文件
      try {
        const videoUrl = createVideoUrl(file);
        console.log("3. 创建的视频URL:", videoUrl);

        if (onVideoUpload) {
          console.log("4. 调用 onVideoUpload 回调");
          onVideoUpload(videoUrl, file.name);
          console.log("5. 回调执行完成");
        } else {
          console.error("错误: onVideoUpload 回调未定义！");
        }

        message.success(`${file.name} 加载成功`);

      } catch (error) {
        console.error("处理视频时出错:", error);
        message.error("处理视频文件失败");
      }

      //新增：上传到服务器
      let serverPath = null;
      try {
        // 添加 await 关键字等待异步函数完成
        serverPath = await uploadVideoToServer(file);
        
        if (serverPath) {
          message.success(`视频已上传到"${serverPath}"位置`);
        } else {
          message.error("上传失败，请重试");
          return false;
        }
      } catch (err) {
        message.error("无法上传到服务器，请重试");
        console.error("上传错误:", err);
        return false;
      }

      return false; // 阻止默认上传行为
    },
    [onVideoUpload],
  );

  const uploadProps = {
    name: "video",
    accept: "video/*",
    showUploadList: false,
    beforeUpload: handleFileSelect,
    disabled: disabled,
  };

  return (
    <Upload
      {...uploadProps}
      style={{ display: "inline-block" }}
      className="video-upload-wrapper"
    >
      <Button icon={<UploadOutlined />} type="primary" disabled={disabled}>
        Upload Video
      </Button>
    </Upload>
  );
};

export default VideoUpload;
