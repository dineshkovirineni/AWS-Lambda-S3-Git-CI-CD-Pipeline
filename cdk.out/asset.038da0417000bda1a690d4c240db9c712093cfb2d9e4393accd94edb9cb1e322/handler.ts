import { Context, Handler } from 'aws-lambda';

export const handler: Handler = async (event: any, context: Context) => {
  console.log('Received event:', JSON.stringify(event));
  console.log('Received context:', JSON.stringify(context));

  // Perform some action based on the event data
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello, world!'
    })
  };

  return response;
};