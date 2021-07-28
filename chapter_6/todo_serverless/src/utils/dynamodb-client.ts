import { DynamoDB } from 'aws-sdk';

const options = {
  region: "localhost",
  endpoint: "http://host.docker.internal:8000",
};

const isOffline = () => {
  return process.env.IS_OFFLINE === 'true';
};


export const document = isOffline()
  ? new DynamoDB.DocumentClient(options)
  : new DynamoDB.DocumentClient();