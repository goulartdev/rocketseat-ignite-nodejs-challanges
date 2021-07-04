import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from '../../../../database';

describe("Authenticate User Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
  })

  afterAll(async () => {
    await connection.close();
  })

  it("should be able to authenticate an existing user", async () => {
    var random = Math.trunc(Math.random() * 1000);

    const user = {
      name: 'some_new_user',
      email: `some_new_user_${random}@email.com`,
      password: 'some_password'
    }

    await request(app)
      .post("/api/v1/users")
      .send(user);

    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      token: expect.any(String),
      user: expect.anything()
    });
  });

  it("should not be able to authenticate a non-existing user", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: 'non_existing_user',
        password: 'non_existing_user@email.com'
      });

    expect(response.status).toBe(401);
  })

})