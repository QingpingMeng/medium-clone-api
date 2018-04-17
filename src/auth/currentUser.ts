import { Handler, Context, Callback } from 'aws-lambda';
import { connectToDatabase } from '../common/db';
import { User, IUserModel } from '../models/User';
// import { connectToDatabase } from '../common/db';

export const currentUser: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    connectToDatabase()
        .then(() =>
            User.findById(event.requestContext.authorizer.principalId).exec()
        )
        .then((user: IUserModel) => {
            if (user) {
                return callback(undefined, {
                    body: JSON.stringify({user: user.toAuthJSON()}),
                    statusCode: 200
                });
            } else {
                callback(new Error('User not found'));
            }
        });
};
