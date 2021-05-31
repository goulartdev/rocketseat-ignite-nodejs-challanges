import { Connection, createConnection } from 'typeorm';

// (async () => await createConnection())();

export default async (): Promise<Connection> => {
  return createConnection();
};