import { Handler, Context, Callback } from 'aws-lambda';
import { validateToken } from '../auth/authorizer';
import { User, IUserModel } from '../models/User';
import { connectToDatabase } from '../common/db';

export const getProfile: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    connectToDatabase()
        .then(() =>
            User.findOne({ username: event.pathParameters.username }).exec()
        )
        .then((user: IUserModel) => {
            if (user) {
                console.log(user.toProfileJSONFor());
                validateToken(event.authorizationToken)
                    .then(() =>
                        callback(undefined, {
                            statusCode: 200,
                            body: {
                                profile: user.toProfileJSONFor(user)
                            }
                        })
                    )
                    .catch(() =>
                        callback(undefined, {
                            statusCode: 200,
                            body: {
                                profile: user.toProfileJSONFor()
                            }
                        })
                    );
            } else {
                return callback(new Error('User not found'));
            }
        });
};
