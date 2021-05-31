import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from '../../../../database';

describe("Get Balance Controller", () => {
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

  it("should be able to get the balance of the authenticated user", async () => {
    const deposit = {
      amount: 200,
      description: "deposit test"
    };

    await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send(deposit);

    const withdraw = {
      amount: 100,
      description: "withdraw test"
    };

    await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send(withdraw);

    const { status, body } = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(status).toBe(200);
    expect(body.balance).toBe(deposit.amount - withdraw.amount);
    expect(body.statement).toHaveLength(2);
  });

});