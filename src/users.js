const bcrypt = require('bcryptjs');

// Simula um "banco de dados" com um usuário já com senha criptografada
const senhaCriptografada = bcrypt.hashSync('123456', 8);

const users = [
  {
    id: 1,
    email: 'admin@teste.com',
    senha: senhaCriptografada,
  },
];

module.exports = { users };
