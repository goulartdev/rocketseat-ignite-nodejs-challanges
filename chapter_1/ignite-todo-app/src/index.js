const express = require('express');
const cors = require('cors');
const { v4: generateId, validate } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }

  request.user = user;

  return next();
}

function checksCreateTodosUserAvailability(request, response, next) {
  const { user: { pro, todos } } = request;

  if (!pro && todos.length === 10) {
    return response.status(403).json({ error: "Max to-dos for free account reached." });
  }

  return next();
}

function checksTodoExists(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }

  if (!validate(id)) {
    return response.status(400).json({ error: "Invalid to-do id." });
  }

  const todo = user.todos.find((todo) => todo.id === id);;

  if (!todo) {
    return response.status(404).json({ error: "Todo not found." });
  }

  request.user = user;
  request.todo = todo;

  return next();
}

function findUserById(request, response, next) {
  const { id } = request.params;

  const user = users.find((user) => user.id === id);

  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username, pro } = request.body;

  const existing = users.find((user) => user.username === username);

  if (existing) {
    return response.status(400).json({ error: "Username unavailable" });
  }

  const user = {
    id: generateId(),
    name,
    username,
    pro: !!pro,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/users/:id', findUserById, (request, response) => {
  const { user } = request;
  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user: { todos } } = request;
  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, checksCreateTodosUserAvailability, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: generateId(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksTodoExists, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksTodoExists, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksTodoExists, (request, response) => {
  const { user: { todos }, todo } = request;

  const todoIndex = todos.findIndex(({ id }) => id === todo.id);
  todos.splice(todoIndex, 1);

  return response.status(204).send()
});

module.exports = {
  app,
  users,
  checksExistsUserAccount,
  checksCreateTodosUserAvailability,
  checksTodoExists,
  findUserById
};