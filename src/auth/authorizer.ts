import {
    Handler,
    Context,
    Callback,
    CustomAuthorizerResult,
    AuthResponse
} from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { secret } from '../config';
import { enableCors } from '../common/cors';
import { decode } from 'punycode';

const authorizer: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    const token = event.authorizationToken;
    validateToken(token)
        .then(decoded => {
            console.log(decoded);
            console.log('Arn allowed:', event.methodArn);
            return callback(
                undefined,
                generatePolicy(decoded.id, 'Allow', event.methodArn)
            );
        })
        .catch(() => callback(new Error('Unauthorized')));
};

export const validateToken = (token: string) => {
    if (!token) {
        console.log(`ValidateToken Failed: token does'n exist`);
        return Promise.reject(undefined);
    }

    const tokenParts = token.split(' ');
    const tokenValue = tokenParts[1];

    console.log(`Token parts:`, tokenParts);

    if (!tokenValue) {
        // no auth token!
        console.log('ValidateToken failed: no token value');
        return Promise.reject(false);
    }

    try {
        const decoded = jwt.verify(tokenValue, secret) as { id: string };
        console.log('Verify token value successfull:', decode);
        return Promise.resolve(decoded);
    } catch (error) {
        console.log('Verify token value failed:', error);
        return Promise.reject(undefined);
    }
};

const generatePolicy = (
    principalId: string,
    effect: string,
    resource: string
): CustomAuthorizerResult => {
    const path = resource.split(':');
    path[5] = '*';
    resource = path.join(':');
    console.log('new resource:', resource);
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

export default enableCors(authorizer);
