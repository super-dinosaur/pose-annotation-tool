# 快速调试指南

## 如何调试React应用（像使用pdb/gdb一样）

### 1. 最简单的方法：使用 debugger 语句

在想要调试的地方加上 `debugger;`：

```javascript
function handleClick() {
  debugger;  // 代码会在这里暂停
  console.log('点击了按钮');
}
```

### 2. Chrome DevTools 调试

1. **打开DevTools**: F12 或 右键->检查
2. **设置断点**: 
   - Sources标签 → 找到文件 → 点击行号
   - 或使用 Cmd+P 搜索文件名
3. **调试快捷键**:
   - F8: 继续执行
   - F10: 单步执行（不进入函数）
   - F11: 单步执行（进入函数）
   - Shift+F11: 跳出函数

### 3. VS Code 调试

创建 `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug React",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

然后在VS Code中：
- 点击行号左边设置断点
- 按F5启动调试

## Express后端调试

### 方法1: 使用 --inspect
```bash
node --inspect server.js
# 或
nodemon --inspect server.js
```
然后在Chrome访问 `chrome://inspect`

### 方法2: VS Code调试
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Express",
  "program": "${workspaceFolder}/server.js",
  "restart": true
}
```

## 你的视频上传问题调试流程

1. **运行应用**: `./start-app.sh`
2. **打开Chrome DevTools** (F12)
3. **查看Console日志**，应该看到：
   ```
   ====== 视频上传流程开始 ======
   1. 文件信息: {name: "test.mp4", type: "video/mp4", size: "10.5 MB"}
   2. 文件验证结果: true
   3. 创建的视频URL: blob:http://localhost:3000/xxxxx
   4. 调用 onVideoUpload 回调
   5. 回调执行完成
   ```

4. **如果没看到这些日志**，在以下位置加debugger：
   - VideoUpload.js 的 handleFileSelect
   - AppHeader.js 的 handleVideoUpload
   - useVideoFrame.js 的 useEffect

## 常见问题

**Q: 为什么视频不显示？**
- 检查Console是否有错误
- 检查Network标签看视频是否加载
- 确认视频格式支持（MP4, WebM）

**Q: 如何查看当前状态？**
```javascript
// 在Console中输入
window.__debugState = state;
console.log(window.__debugState);
```

**Q: 如何手动触发上传？**
```javascript
// 在Console中测试
document.querySelector('input[type="file"]').click();
```
