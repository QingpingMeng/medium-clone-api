import { Handler, Context, Callback } from 'aws-lambda';
import { User } from '../models/User';
import { connectToDatabase } from '../common/db';
import { enableCors } from '../common/cors';

const signup: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    console.log('Enter signup function');
    const body = JSON.parse(event.body);
    const user = new User();
    user.email = body.user.email;
    user.username = body.user.username;
    user.setPassword(body.user.password);
    context.callbackWaitsForEmptyEventLoop = false;
    connectToDatabase()
        .then(() => user.save())
        .then(() => {
            const response = {
                statusCode: 200,
                body: JSON.stringify({ user: user.toAuthJSON() })
            };
            return callback(undefined, response);
        })
        .catch(error => {
            console.error(error);
            const { errors } = error;
            Object.keys(errors).map(key => {
                errors[key] = [errors[key].message];
            });
            return callback(undefined, {
                statusCode: 422,
                body: JSON.stringify({
                    errors: errors
                })
            });
        });
};

export default enableCors(signup);