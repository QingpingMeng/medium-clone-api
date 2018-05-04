import { Handler, Context, Callback } from 'aws-lambda';
import { connectToDatabase } from '../common/db';
import { User } from '../models/User';
import { Article } from '../models/Article';
import { enableCors } from '../common/cors';

const favoriteArticle: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    connectToDatabase()
        .then(() =>
            Promise.all([
                Article.findOne({ slug: event.pathParameters.slug })
                    .populate('author')
                    .exec(),
                User.findById(
                    event.requestContext.authorizer.principalId
                ).exec()
            ])
        )
        .then(([article, user]) => {
            if (!user) {
                callback(undefined, {
                    statusCode: 401
                });

                return Promise.reject(new Error('Unauthorized'));
            }

            if (!article) {
                callback(undefined, {
                    statusCode: 404
                });

                return Promise.reject(new Error('NotFound'));
            }

            return user
                .favorite(article._id)
                .then(() => article.updateFavoriteCount())
                .then(article => {
                    return callback(undefined, {
                        statusCode: 200,
                        body: JSON.stringify({
                            article: article.toJSONFor(user)
                        })
                    });
                });
        })
        .catch(error => callback(error));
};

export default enableCors(favoriteArticle);