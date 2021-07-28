import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuid } from "uuid";

import { document } from "src/utils/dynamodb-client"
import { jsonResponse } from "src/utils/response";
import * as dayjs from "dayjs";

interface CreateTodoDTO {
  title: string;
  deadline: string;
}

export const handle: APIGatewayProxyHandler = async (event) => {
  const { id: userId } = event.pathParameters;
  const { title, deadline } = JSON.parse(event.body) as CreateTodoDTO;

  const id = uuid();

  await document.put({
    TableName: "todos",
    Item: {
      id,
      userId,
      title,
      deadline: dayjs(deadline).format(),
      done: false
    }
  }).promise();

  return jsonResponse(201, { message: "Todo created" })

}