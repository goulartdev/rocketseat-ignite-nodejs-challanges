import request from "supertest";
import { Connection, getConnection } from "typeorm";

import { app } from "../../../../app";
import createConnection from '../../../../database';

describe("User Profile Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();
  })

  afterAll(async () => {
    await connection.close();
  })

  it("should be able to get the profile of the authenticated user", async () => {
    var random = Math.trunc(Math.random() * 1000);

    const user = {
      name: 'some_new_user',
      email: `some_new_user_${random}@email.com`,
      password: 'some_password'
    }

    await request(app)
      .post("/api/v1/users")
      .send(user);

    const { body: { token } } = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: user.password
      })

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: user.name,
      email: user.email
    });
  })

})