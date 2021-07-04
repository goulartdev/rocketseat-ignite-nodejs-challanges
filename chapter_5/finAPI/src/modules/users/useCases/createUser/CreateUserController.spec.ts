import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import createConnection from '../../../../database';

describe("Create User Controller", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection();

  })

  afterAll(async () => {
    await connection.close();
  })

  it("should be able to create an user", async () => {
    var random = Math.trunc(Math.random() * 1000);

    const response = await request(app)
      .post('/api/v1/users')
      .send({
        name: 'some_new_user',
        email: `some_new_user_${random}@email.com`,
        password: 'some_password'
      });

    expect(response.status).toBe(201);
  });
});
