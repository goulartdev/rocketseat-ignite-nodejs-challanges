import { APIGatewayProxyHandler } from "aws-lambda";

import { document } from "src/utils/dynamodb-client"
import { jsonResponse } from "src/utils/response";

export const handle: APIGatewayProxyHandler = async (event) => {
  const { id: userId } = event.pathParameters;

  const response = await document.query({
    TableName: "todos",
    IndexName: "userIdIndex",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  }).promise();

  const todos = response.Items;

  if (!todos) {
    return jsonResponse(404, { message: "No todos found for this user" });
  }

  return jsonResponse(200, {
    todos
  })

}