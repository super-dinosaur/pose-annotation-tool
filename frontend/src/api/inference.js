const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// 确保临时目录存在
const TMP_DIR = '/tmp';
const CURRENT_FRAME_FILE = path.join(TMP_DIR, 'current_frame_annotations.json');
const NEXT_FRAME_FILE = path.join(TMP_DIR, 'next_frame_annotations.json');

// 检查目录权限
async function checkDirectoryPermissions() {
  try {
    // 检查目录是否存在
    await fs.access(TMP_DIR);
    console.log(`${TMP_DIR} 目录存在`);
    
    // 尝试创建测试文件
    const testFile = path.join(TMP_DIR, 'test_permission.txt');
    await fs.writeFile(testFile, 'test');
    await fs.unlink(testFile);
    console.log(`${TMP_DIR} 目录有写入权限`);
    
    return true;
  } catch (error) {
    console.error('目录权限检查失败:', error);
    return false;
  }
}

// 导出当前帧的标注信息
router.post('/export-annotations', async (req, res) => {
  try {
    console.log('收到导出标注请求');
    
    // 检查目录权限
    const hasPermission = await checkDirectoryPermissions();
    if (!hasPermission) {
      throw new Error(`${TMP_DIR} 目录没有写入权限`);
    }
    
    const { data } = req.body;
    if (!data) {
      throw new Error('请求中没有提供标注数据');
    }
    
    console.log('正在写入文件:', CURRENT_FRAME_FILE);
    console.log('写入的数据:', JSON.stringify(data, null, 2));
    
    // 确保文件目录存在
    await fs.mkdir(path.dirname(CURRENT_FRAME_FILE), { recursive: true });
    
    // 写入文件
    await fs.writeFile(CURRENT_FRAME_FILE, JSON.stringify(data, null, 2));
    console.log('文件写入成功');
    
    // 验证文件是否成功写入
    const fileContent = await fs.readFile(CURRENT_FRAME_FILE, 'utf8');
    console.log('文件内容验证成功');
    
    res.json({ success: true });
  } catch (error) {
    console.error('导出标注信息失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ 
      error: '导出标注信息失败: ' + error.message,
      details: error.stack
    });
  }
});

// 运行推理脚本
router.post('/run-inference', async (req, res) => {
  try {
    console.log('收到运行推理请求');
    const scriptPath = path.join(__dirname, '../../scripts/inference_next_frame.sh');
    console.log('脚本路径:', scriptPath);
    
    // 检查脚本是否存在
    try {
      await fs.access(scriptPath);
      console.log('推理脚本存在');
    } catch (error) {
      console.error('推理脚本不存在:', scriptPath);
      throw new Error('推理脚本不存在');
    }
    
    const command = `${scriptPath} ${CURRENT_FRAME_FILE} ${NEXT_FRAME_FILE}`;
    console.log('执行命令:', command);
    
    // 异步执行推理脚本
    execAsync(command)
      .then(() => {
        console.log('推理脚本执行成功');
      })
      .catch(error => {
        console.error('推理脚本执行错误:', error);
      });
    
    res.json({ success: true });
  } catch (error) {
    console.error('运行推理脚本失败:', error);
    res.status(500).json({ error: '运行推理脚本失败: ' + error.message });
  }
});

// 检查下一帧的标注文件是否存在
router.post('/check-next-frame-annotations', async (req, res) => {
  try {
    console.log('检查下一帧标注文件:', NEXT_FRAME_FILE);
    
    const exists = await fs.access(NEXT_FRAME_FILE)
      .then(() => true)
      .catch(() => false);
    
    if (exists) {
      console.log('找到下一帧标注文件');
      const content = await fs.readFile(NEXT_FRAME_FILE, 'utf8');
      const annotations = JSON.parse(content);
      console.log('成功解析标注数据');
      
      // 读取后删除文件
      await fs.unlink(NEXT_FRAME_FILE);
      console.log('已删除标注文件');
      
      res.json({ exists: true, annotations });
    } else {
      console.log('未找到下一帧标注文件');
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('检查下一帧标注失败:', error);
    res.status(500).json({ error: '检查下一帧标注失败: ' + error.message });
  }
});

module.exports = router; 