import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from '../../../../database';
import { OperationType } from "../../entities/Statement";

describe("Get Statement Operation Controller", () => {
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

  it("should be able to get a statement operation of the authenticated user", async () => {
    const deposit = {
      amount: 200,
      description: "deposit test"
    };

    const { body: { id } } = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send(deposit);

    const { status, body } = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: id,
      amount: deposit.amount.toFixed(2),
      description: deposit.description,
      type: OperationType.DEPOSIT.toString()
    });
  });

});