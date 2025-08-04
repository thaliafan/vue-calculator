// hashPassword.js
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 询问要加密的密码
rl.question('请输入需要加密的密码: ', (password) => {
  const saltRounds = 10; // 哈希强度

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('加密出错:', err);
    } else {
      console.log('\n=======================================');
      console.log('密码哈希值已生成:');
      console.log(hash);
      console.log('=======================================');
      console.log('请将此哈希值存入数据库的 password_hash 字段。');
    }
    rl.close();
  });
});