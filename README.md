# Atividade N1B Web 2 - API sistema de gerenciamento de salas

---

## 👥 Equipe
| [<img loading="lazy" src="https://avatars.githubusercontent.com/u/106767229?s=400&u=d91f527c50979c457174cc70127a0411747c70e5&v=4" width=115><br><sub>Nicolas Ferreira</sub>](https://github.com/Niccofs) | [<img loading="lazy" src="https://avatars.githubusercontent.com/u/100231973?v=4" width=115><br><sub>Rudhá Esmeraldo</sub>](https://github.com/rudhaesmeraldo) | [<img loading="lazy" src="https://avatars.githubusercontent.com/u/90151294?v=4" width=115><br><sub>Hívina Yanna</sub>](https://github.com/hivinayanna) |
| :---: | :---: | :---: |

---

## 📁 Estrutura de Pastas do Código

A estrutura de pastas é organizada para refletir a separação de responsabilidades e facilitar a manutenção do código:

```
src/
  ├── api/
      ├── index.js
  ├── config/
      ├── cloudinary.js
      ├── database.js
      └── index.js
  ├── models/
      ├── Laboratorio.js
      └── user.js
  ├── routers/
      ├── authController.js
      └── laboratorioController.js    
  ├── middlewares/
      ├── auth.js
      └── restrictAccess.js
  ├── utils
      └── generate-keys.js
  ├── tests
      ├── /uploads
      ├── auth.test.js
      ├── laboratorio.test.js    
  ├── package.json
  ├── compose.yaml
```
---

## 🛠 Tecnologias

- **Node.js**
- **MongoDB**
- **JavaScript**
- **Vercel**
- **Cloudinary**
- **Jest**
- **Docker**
  
---

## 🚀 Rota GET /api

Retorna "🚀 Bem-vindo à API de Gerenciamento de Salas!", servindo como teste primário de funcionamento da API.

---

## 📝 Rota POST /api/cadastrar

Cadastra um usuário no mongodb recebendo nome, email e senha

### 📥 Exemplo de Entrada

```
{
    "nome": "Hivina",
    "email": "admin@teste.com",
    "senha": "123456"
}
```

### 📤 Saída

```
{
    "mensagem": "Usuário cadastrado com sucesso"
}
```
---

## 🔐 Rota POST /logar

Loga um usuário já cadastrado anteriormente para gera um token via jwt

### 📥 Exemplo de Entrada
```
{
  "email": "admin@teste.com",
  "senha": "123456"
}
```

### 📤 Saída

```
{
    "token": "<token_jwt>"
}
```
---

### 🌐 Link para o Vercel

```
https://ideal-googles.vercel.app/
```
