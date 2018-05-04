import { Handler, Context, Callback } from 'aws-lambda';
import { connectToDatabase } from '../common/db';
import { User } from '../models/User';
import { enableCors } from '../common/cors';

const followUser: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    connectToDatabase()
        .then(() => {
            return Promise.all([
                User.findOne({
                    username: event.pathParameters.username
                }).exec(),
                User.findById(
                    event.requestContext.authorizer.principalId
                ).exec()
            ]);
        })
        .then(([profile, currentUser]) => {
            if (profile && currentUser) {
                currentUser.follow(profile.id).then(() => {
                    return callback(undefined, {
                        statusCode: 200,
                        body: JSON.stringify({
                            profile: profile.toProfileJSONFor(currentUser)
                        })
                    });
                });
            } else if (!currentUser) {
                return callback(undefined, {
                    statusCode: 401
                });
            } else {
                return callback(undefined, {
                    statusCode: 404
                });
            }
        });
};

export default enableCors(followUser);
