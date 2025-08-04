// api.cjs
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const users = require('./users.cjs'); // 我们引用新的、简单的文件名

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_super_secret_key_12345';

app.use(cors());
app.use(express.json());

app.post('/api/login', async (req, res) => {
  console.log('------------------------------------');
  console.log('✅ 接收到前端登录请求...'); // 日志1: 确认接口被访问

  const { username, password } = req.body;
  console.log('➡️ 前端传来的用户名:', username); // 日志2: 查看收到的用户名
  console.log('➡️ 前端传来的密码:', password);   // 日志3: 查看收到的密码

  const user = users.find(u => u.username === username);

  if (!user) {
    console.log('❌ 后台检查结果：用户未在 users.cjs 中找到！'); // 日志4.1: 用户查找失败
    console.log('------------------------------------');
    return res.status(401).json({ message: '认证失败：用户不存在' });
  }

  console.log('✔️ 后台检查结果：用户已找到:', user.username); // 日志4.2: 用户查找成功
  console.log('⏳ 将用bcrypt比对密码...');

  try {
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordMatch) {
      console.log('❌ 后台检查结果：密码比对失败！'); // 日志5.1: 密码不匹配
      console.log('------------------------------------');
      return res.status(401).json({ message: '认证失败：密码错误' });
    }

    console.log('✔️ 后台检查结果：密码比对成功！正在生成Token...'); // 日志5.2: 密码匹配成功

    const token = jwt.sign(
      { id: user.id, role: user.role },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    
    console.log('🎉 成功！已返回Token给前端。');
    console.log('------------------------------------');
    
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });

  } catch (bcryptError) {
    console.error('‼️ Bcrypt比对时发生严重错误:', bcryptError); // 捕获可能的哈希格式等错误
    console.log('------------------------------------');
    return res.status(500).json({ message: '服务器内部错误' });
  }
});
app.listen(PORT, () => {
  console.log(`✅ 后端服务器已启动，正在监听 http://localhost:${PORT}`);
});