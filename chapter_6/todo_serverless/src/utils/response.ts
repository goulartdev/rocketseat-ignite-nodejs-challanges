interface ResponseBody {
  [key: string]: any;
}

const jsonResponse = (code: number, body: ResponseBody) => {
  return {
    statusCode: code,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json"
    }
  }
}

export { jsonResponse };