import { Handler, Context, Callback } from 'aws-lambda';
import { connectToDatabase } from '../common/db';
import { User } from '../models/User';
import { Article } from '../models/Article';
import { enableCors } from '../common/cors';

const deleteArticle: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    connectToDatabase()
        .then(() => {
            return Promise.all([
                Article.findOne({ slug: event.pathParameters.slug })
                    .populate('author')
                    .exec(),
                User.findById(
                    event.requestContext.authorizer.principalId
                ).exec()
            ]);
        })
        .then(([articleModel, user]) => {
            if (!user) {
                callback(undefined, {
                    statusCode: 401
                });

                return Promise.reject(new Error('Unauthorized'));
            }

            if (!articleModel) {
                callback(undefined, {
                    statusCode: 404
                });

                return Promise.reject(new Error('NotFound'));
            }

            if (articleModel.author._id.toString() !== user._id.toString()) {
                callback(undefined, {
                    statusCode: 403
                });

                return Promise.reject(new Error('Forbidden'));
            }

            return articleModel.remove();
        })
        .then(() => {
            callback(undefined, {
                statusCode: 204
            });
        });
};

export default enableCors(deleteArticle);
