import * as jest from 'jest';
import { Connection } from 'typeorm';

import createConnection from '../database';

let connection: Connection;

async function init() {
  connection = await createConnection();
  await connection.runMigrations();
}

async function teardown() {
  await connection.dropDatabase();
  await connection.close();
}

init().then(() => jest.run()).then(teardown)
