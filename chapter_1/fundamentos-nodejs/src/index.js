const express = require('express');
const { v4: generateId } = require("uuid");

const app = express();

app.use(express.json());

const accounts = {};

app.post("/account", (req, res) => {
  const { name, cpf } = req.body;
  
  if (getAccount(cpf)) {
    return res.status(400).json({ error : `An account with cpf ${cpf} already exists.`});
  }

  const newAccount = { 
    id: generateId(),
    name, 
    cpf,
    statement: [] 
  };

  accounts[newAccount.cpf] = newAccount;

  return res.status(201).json(newAccount); 
});

app.put("/account", accountExists, (req, res) => {
  const { account } = req;
  const { name } = req.body;
  
  account.name = name;
  
  return res.status(201).json(account); 
});

app.get("/account", accountExists, (req, res) => {
  const { account } = req;
  return res.status(201).json(account); 
});

app.delete("/account", accountExists, (req, res) => {
  const { account: { cpf } } = req;

  delete accounts[cpf];

  return res.status(201).send(); 
});

app.get("/balance", accountExists, (req, res) => {
  const { account } = req;
  const balance = getBalance(account);
  
  return res.status(201).json({ balance: balance }); 
});

app.get("/statement", accountExists, (req, res) => {
  const { account } = req;
  return res.json(account.statement);
});

app.get("/statement/date", accountExists, (req, res) => {
  const { account } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = account.statement.filter(({ createdAt }) => {
    return createdAt.toDateString() === dateFormat.toDateString();
  });

  return res.json(statement);
});

app.post("/deposit", accountExists, (req, res) => {
  const { description, amount } = req.body;
  const { account } = req;

  const operation = {
    description,
    amount,
    createdAt: new Date(),
    type: "credit"
  };

  account.statement.push(operation);

  return res.status(201).send();
});

app.post("/withdraw", accountExists, (req, res) => {
  const { description, amount } = req.body;
  const { account } = req;
  const balance = getBalance(account);

  if (balance < amount) {
    return res.status(400).json({ error : 'Insufficient funds.'});
  };

  const operation = {
    description,
    amount,
    createdAt: new Date(),
    type: "debt"
  };

  account.statement.push(operation);

  return res.status(201).send();

});

function accountExists(req, res, next) {
  const { cpf } = req.headers;
  const account = getAccount(cpf);

  if (!account) {
    return res.status(400).json({ error : 'Account not found.'});
  }

  req.account = account;

  return next();
}

function getBalance ({ statement }) {
  return statement.reduce((balance, { amount, type }) => {
    if (type === 'debt') {
      amount = amount * -1;
    }

    return balance + amount;
  }, 0);
}

function getAccount (cpf) {
  return accounts[cpf];
}

app.listen(3000);