import { Handler, Context, Callback } from 'aws-lambda';
import { User } from '../models/User';
import { connectToDatabase } from '../common/db';

export const signup: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    const body = JSON.parse(event.body);
    const user = new User();
    user.email = body.user.email;
    user.username = body.user.username;
    user.setPassword(body.user.password);

    connectToDatabase()
        .then(() => user.save())
        .then(() => {
            const response = {
                statusCode: 200,
                body: JSON.stringify({user: user.toAuthJSON()})
            };
            callback(undefined, response);
        })
        .catch(error => {
            callback(error);
        });
};
