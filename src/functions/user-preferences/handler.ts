import {
  DeleteItemCommand,
  DeleteItemCommandOutput,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  PutItemCommand,
  PutItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';

const userPreferences: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  switch (event.httpMethod) {
    case 'POST':
      return handlePost(event);
    case 'GET':
      return handleGet(event);
    case 'DELETE':
      return handleDelete(event);
    default:
      return {
        statusCode: 500,
        body: `${event.httpMethod} is not being handled!`,
      };
  }
};

export const main = middyfy(userPreferences);

async function handlePost(event) {
  const client = new DynamoDBClient({ region: process.env.AWS_REGION });

  const params = {
    TableName: process.env.USER_PREFERENCES_TABLE,
    Item: {
      userId: {
        S: event.body.userId,
      },
      stocks: {
        SS: event.body.stocks,
      },
      coins: {
        SS: event.body.coins,
      },
    },
  };

  const command = new PutItemCommand(params);

  return client
    .send(command)
    .then((_output: PutItemCommandOutput) => {
      return formatJSONResponse({
        message: 'Success',
      });
    })
    .catch((error) => {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error', ...error }),
      };
    });
}

async function handleGet(event) {
  const client = new DynamoDBClient({ region: process.env.AWS_REGION });

  const params = {
    TableName: process.env.USER_PREFERENCES_TABLE,
    Key: {
      userId: {
        S: event.body.userId,
      },
    },
  };

  const command = new GetItemCommand(params);

  return client
    .send(command)
    .then((output: GetItemCommandOutput) => {
      return formatJSONResponse({
        message: 'Success',
        preferences: output.Item || {},
      });
    })
    .catch((error) => {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error', ...error }),
      };
    });
}

async function handleDelete(event) {
  const client = new DynamoDBClient({ region: process.env.AWS_REGION });

  const params = {
    TableName: process.env.USER_PREFERENCES_TABLE,
    Key: {
      userId: {
        S: event.body.userId,
      },
    },
  };

  const command = new DeleteItemCommand(params);

  return client
    .send(command)
    .then((_output: DeleteItemCommandOutput) => {
      return formatJSONResponse({
        message: 'Success',
      });
    })
    .catch((error) => {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error', ...error }),
      };
    });
}
