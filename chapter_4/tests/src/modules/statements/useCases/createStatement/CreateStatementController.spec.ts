import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from '../../../../database';

describe("Create Statement Controller", () => {
  let connection: Connection;

  const random = Math.trunc(Math.random() * 1000);

  const user = {
    name: 'some_new_user',
    email: `some_new_user_${random}@email.com`,
    password: 'some_password'
  };

  let token: string;

  beforeAll(async () => {
    connection = await createConnection();

    await request(app)
      .post("/api/v1/users")
      .send(user);

    const { body } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    token = body.token;
  })

  afterAll(async () => {
    await connection.close();
  })

  it("should be able to make a deposit", async () => {
    const operation = {
      amount: 200,
      description: "deposit test"
    };

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send(operation);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      description: operation.description,
      amount: operation.amount,
      type: 'deposit',
    });
  });

  it("should be able to make a deposit", async () => {
    const operation = {
      amount: 100,
      description: "withdraw test"
    };

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send(operation);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      description: operation.description,
      amount: operation.amount,
      type: 'withdraw',
    });
  });

})