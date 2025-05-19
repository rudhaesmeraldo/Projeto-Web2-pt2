const request = require('supertest');
const express = require('express');
const app = require('../../src/api/app');

jest.mock('../../src/users', () => ({
  users: [
    { id: 1, email: 'teste@teste.com', senha: '$2a$10$KIX/9PftTsd5XnJ5XKUiIuGe5MEXnpY66TxsFSWT/NrAbViU9vNQ2' } // senha: 123456
  ]
}));

describe('POST /api/logar', () => {
  it('deve autenticar com email e senha válidos', async () => {
    const res = await request(app)
      .post('/api/logar')
      .send({ email: 'teste@teste.com', senha: '123456' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('deve retornar erro para usuário inexistente', async () => {
    const res = await request(app)
      .post('/api/logar')
      .send({ email: 'naoexiste@teste.com', senha: '123456' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('erro');
  });

  it('deve retornar erro para senha inválida', async () => {
    const res = await request(app)
      .post('/api/logar')
      .send({ email: 'teste@teste.com', senha: 'errada' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('erro');
  });
});
