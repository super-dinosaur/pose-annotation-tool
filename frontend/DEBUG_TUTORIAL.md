# React和Express调试完整教程

## 一、Chrome DevTools 调试步骤

### 1. 运行你的React应用
```bash
cd /Users/franky/Documents/code/labelme-full-stack/frontend
npm start
```

### 2. 打开Chrome，访问 http://localhost:3000

### 3. 打开DevTools (F12 或 右键->检查)

### 4. 现在代码会自动在断点处停下！

我已经在代码中添加了3个断点：
- 🔴 断点1：VideoUpload.js - 文件选择后
- 🔴 断点2：AppHeader.js - 上传回调被调用  
- 🔴 断点3：useVideoFrame.js - 视频源变化，准备加载

### 5. 调试时的快捷键：
- **F8** 或 **继续按钮**: 继续执行到下一个断点
- **F10** 或 **跨步按钮**: 单步执行（不进入函数内部）
- **F11** 或 **步入按钮**: 单步执行（进入函数内部）
- **Shift+F11** 或 **步出按钮**: 跳出当前函数

### 6. 调试时能做什么：
- 查看变量值：鼠标悬停在变量上
- 在Console中输入变量名查看值
- 在右侧Scope中查看所有变量
- 在Watch中添加要监视的表达式
- 查看Call Stack看函数调用栈

## 二、调试你的视频上传问题

1. 点击"Upload Video"按钮
2. 选择一个视频文件
3. 代码会在第一个断点停下
4. 按F10逐步执行，观察：
   - `file` 对象是否正确
   - `videoUrl` 是否成功创建
   - `onVideoUpload` 是否被调用

## 三、不用debugger的其他调试方法

### 方法1：Console.log调试
```javascript
console.log('步骤1: 文件选择', file);
console.log('步骤2: URL创建', videoUrl);
console.log('步骤3: 回调调用', onVideoUpload);
```

### 方法2：React Developer Tools
1. 安装Chrome扩展"React Developer Tools"
2. DevTools会多出两个标签：⚛️ Components 和 ⚛️ Profiler
3. 在Components中可以：
   - 搜索组件
   - 查看和修改props/state
   - 查看组件树

### 方法3：使用VS Code调试
1. 安装VS Code扩展："Debugger for Chrome"
2. 在项目根目录创建 `.vscode/launch.json`：
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```
3. 在VS Code中设置断点（点击行号左边）
4. 按F5启动调试

## 四、Express后端调试

### 方法1：使用VS Code调试Express
1. 创建 `.vscode/launch.json`：
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Express",
      "program": "${workspaceFolder}/backend/server.js",
      "runtimeExecutable": "nodemon",
      "restart": true,
      "console": "integratedTerminal"
    }
  ]
}
```

### 方法2：使用Node.js内置调试器
```bash
# 启动时加上 --inspect 参数
node --inspect server.js
# 或使用nodemon
nodemon --inspect server.js
```
然后在Chrome中访问 `chrome://inspect`

### 方法3：使用debugger语句
```javascript
app.post('/api/upload', (req, res) => {
  debugger; // 会在这里停下
  console.log('请求数据:', req.body);
  // ...
});
```

## 五、常见问题

### Q: 为什么我在Sources里找不到我的文件？
A: 使用 Cmd+P (Mac) 或 Ctrl+P (Windows) 搜索文件名

### Q: 为什么断点是灰色的？
A: 代码还没执行到，或者source map有问题

### Q: 怎么查看网络请求？
A: 在Network标签中查看所有HTTP请求

### Q: 怎么调试异步代码？
A: 使用async/await，在await行设置断点

## 六、调试技巧

1. **条件断点**：右键断点，设置条件
2. **日志断点**：不暂停，只打印日志
3. **XHR断点**：在特定URL的请求时暂停
4. **DOM断点**：当DOM被修改时暂停

## 七、移除debugger语句

调试完成后，记得移除所有debugger语句：
```bash
# 搜索所有debugger语句
grep -r "debugger" src/

# 或在VS Code中全局搜索 debugger
```
