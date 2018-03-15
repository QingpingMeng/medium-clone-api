import {
    Handler,
    Context,
    Callback,
    CustomAuthorizerResult,
    AuthResponse
} from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { secret } from '../config';

export const authorizer: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    const token = event.authorizationToken;
    if (!token) {
        return callback(new Error('unauthrozied'));
    }

    const tokenParts = event.authorizationToken.split(' ');
    const tokenValue = tokenParts[1];

    if (!tokenValue) {
        // no auth token!
        return callback(new Error('Unauthorized'));
    }
    console.log('here');
    try {
        const decoded = jwt.verify(tokenValue, secret) as { id: string };
        return callback(
            undefined,
            generatePolicy(decoded.id, 'Allow', event.methodArn)
        );
    } catch (error) {
        console.log('Invalid Token', error);
        return callback(new Error('Unauthorized'));
    }
};

const generatePolicy = (
    principalId: string,
    effect: string,
    resource: string
): CustomAuthorizerResult => {
    const authResponse: AuthResponse = {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource
                }
            ]
        }
    };
    authResponse.principalId = principalId;
    return authResponse;
};
