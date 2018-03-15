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
    validateToken(token)
        .then(decoded => {
            console.log(decoded);
            return callback(
                undefined,
                generatePolicy(decoded.id, 'Allow', event.methodArn)
            );
        })
        .catch(() => callback(new Error('Unauthorized')));
};

export const validateToken = (token: string) => {
    if (!token) {
        return Promise.reject(undefined);
    }

    const tokenParts = token.split(' ');
    const tokenValue = tokenParts[1];

    if (!tokenValue) {
        // no auth token!
        return Promise.reject(false);
    }

    try {
        const decoded = jwt.verify(tokenValue, secret) as { id: string };
        return Promise.resolve(decoded);
    } catch (error) {
        return Promise.reject(undefined);
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
    return authResponse;
};
