import { Handler, Context, Callback } from "aws-lambda";

interface HelloResponse {
  statusCode: number;
  body: string;
}

const hello: Handler = (event: any, context: Context, callback: Callback) => {
  const response: HelloResponse = {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v1.0! Your function executed successfully!",
      input: event
    })
  };

  callback(undefined, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

export { hello };
