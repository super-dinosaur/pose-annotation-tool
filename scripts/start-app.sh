#!/bin/bash

echo "======================================"
echo "启动 React 视频标注应用"
echo "======================================"
echo ""
echo "调试步骤："
echo "1. 打开浏览器访问 http://localhost:3000"
echo "2. 按 F12 打开开发者工具"
echo "3. 切换到 Console 标签"
echo "4. 点击 Upload Video 按钮选择视频"
echo ""
echo "查看以下日志："
echo "- [视频上传流程开始] - 文件选择"
echo "- [AppHeader 处理视频上传] - 回调处理"
echo "- [Reducer] SET_VIDEO_SRC - 状态更新"
echo "- [useVideoFrame Effect] - 视频加载"
echo ""
echo "如果视频没有显示，检查："
echo "1. 控制台是否有错误信息"
echo "2. 视频格式是否支持（MP4, WebM, MOV）"
echo "3. 视频文件是否损坏"
echo ""
echo "======================================"

cd /home/ghy/Desktop/pose-annotation-tool/frontend
npm start
