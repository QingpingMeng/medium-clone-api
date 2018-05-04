import { Handler } from 'aws-lambda';

const middy = require('middy');
const { cors } = require('middy/middlewares');

const enableCors = (handler: Handler) => middy(handler).use(cors());

export { enableCors };
