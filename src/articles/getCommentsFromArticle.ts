import { Handler, Context, Callback } from 'aws-lambda';
import { connectToDatabase } from '../common/db';
import { User } from '../models/User';
import { Article } from '../models/Article';
import { validateToken } from '../auth/authorizer';
import { enableCors } from '../common/cors';

const getCommentsFromArticle: Handler = (
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
                validateToken(event.headers && event.headers.authorization)
                    .then(decoded => {
                        console.log('decode', decoded);
                        return User.findById(decoded.id).exec();
                    })
                    .catch(() => Promise.resolve(undefined))
            ]);
        })
        .then(([article, user]) => {
            if (!article) {
                callback(undefined, {
                    statusCode: 404
                });

                return Promise.reject(new Error('NotFound'));
            }

            return Promise.all([
                article
                    .populate({
                        path: 'comments',
                        populate: {
                            path: 'author'
                        },
                        options: {
                            sort: {
                                createdAt: 'desc'
                            }
                        }
                    })
                    .execPopulate(),
                Promise.resolve(user)
            ]);
        })
        .then(([article, user]) => {
            callback(undefined, {
                statusCode: 200,
                body: JSON.stringify({
                    comments: article.comments.map(comment => {
                        return comment.toJSONFor(user || undefined);
                    })
                })
            });
        })
        .catch(error => callback(error));
};

export default enableCors(getCommentsFromArticle);