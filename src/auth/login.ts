import { Handler, Context, Callback } from 'aws-lambda';
import { User, IUserModel } from '../models/User';
import { connectToDatabase } from '../common/db';

export const login: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    const body = JSON.parse(event.body);
    const { email, password } = body.user;
    if (!email) {
        callback(undefined, {
            statusCode: 422,
            body: JSON.stringify({
                errors: { email: "can't be blank" + event.body }
            })
        });
    } else if (!password) {
        callback(undefined, {
            statusCode: 422,
            body: JSON.stringify({
                errors: { passowrd: "can't be blank" }
            })
        });
    }

    connectToDatabase()
        .then(() => User.findOne({ email }).exec())
        .then((user: IUserModel) => {
            if (user) {
                callback(undefined, {
                    statusCode: 200,
                    body: JSON.stringify({user: user.toAuthJSON()})
                });
            } else {
                callback(undefined, {
                    statusCode: 401
                });
            }
        });
    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
