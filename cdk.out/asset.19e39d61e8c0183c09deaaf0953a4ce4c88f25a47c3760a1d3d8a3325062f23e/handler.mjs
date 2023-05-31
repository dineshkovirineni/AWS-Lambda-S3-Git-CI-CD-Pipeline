export const handler = async (event) => {
  console.log('Success');
  const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};