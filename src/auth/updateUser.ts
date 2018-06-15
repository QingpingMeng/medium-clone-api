import { Handler, Context, Callback } from 'aws-lambda';
import { connectToDatabase } from '../common/db';
import { User, IUserModel } from '../models/User';
import { enableCors } from '../common/cors';
// import { connectToDatabase } from '../common/db';

const updatetUser: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    connectToDatabase()
        .then(() =>
            User.findById(event.requestContext.authorizer.principalId).exec()
        )
        .then((currentUser: IUserModel) => {
            if (!currentUser) {
                return callback(undefined, {
                    statusCode: 401
                });
            }
            const { user } = JSON.parse(event.body);
            if (typeof user.username !== 'undefined') {
                currentUser.username = user.username;
            }
            if (typeof user.email !== 'undefined') {
                currentUser.email = user.email;
            }
            if (typeof user.bio !== 'undefined') {
                currentUser.bio = user.bio;
            }
            if (typeof user.image !== 'undefined') {
                currentUser.image = user.image;
            }
            if (typeof user.password !== 'undefined') {
                currentUser.setPassword(user.password);
            }

            return currentUser.save().then(() => {
                return callback(undefined, {
                    statusCode: 200,
                    body: JSON.stringify({
                        user: currentUser.toAuthJSON()
                    })
                });
            });
        });
};

export default enableCors(updatetUser);
