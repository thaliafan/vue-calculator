// users.cjs
const users = [
  {
    id: 1,
    username: 'admin',
    role: 'admin',
    password_hash: '$2b$10$dflFu5cDJYaYGwZD0MhB1efoOiRUDC7YXivxZX6IURNBNbR8.cIVa'
  }, // 👈 修正1：在这里添加了逗号

  // 👇 修正2：用花括号 { } 把新用户信息包起来
  {
    id: 2,
    username: 'adm1',
    role: 'adm',
    // 👇 修正3：用单引号 ' ' 把哈希值包起来
    password_hash: '$2b$10$dflFu5cDJYaYGwZD0MhB1efoOiRUDC7YXivxZX6IURNBNbR8.cIVa'
  },
  {
    id: 3, // 确保 id 是唯一的
    username: 'ACS', // 为新用户设置一个用户名
    role: 'cx', // 👈 *** 这就是唯一的、最关键的区别！***
    password_hash: '$2b$10$fJ1.Lwf0cW6d1tXUcPVp6eA3tJax6s90gJjcYUppYO7kvbr7UyfeO'
  }
];

module.exports = users;