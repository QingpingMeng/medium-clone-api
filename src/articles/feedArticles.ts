import { Handler, Context, Callback } from 'aws-lambda';
import { connectToDatabase } from '../common/db';
import { User } from '../models/User';
import { Article } from '../models/Article';
import { enableCors } from '../common/cors';

const feedArticles: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const limit = event.queryStringParameters.limit || 20;
    const offset = event.queryStringParameters.offset || 0;
    connectToDatabase()
        .then(() => {
            return User.findById(event.requestContext.authorizer.principalId).exec();
        })
        .then(user => {
            if (!user) {
                callback(undefined, {
                    statusCode: 401
                });
                return Promise.reject(new Error('Unauthorized'));
            }

            console.log(user.following);
            return Promise.all([
                Promise.resolve(user),
                Article.find({ author: { $in: user.following } })
                    .limit(Number(limit))
                    .skip(Number(offset))
                    .populate('author')
                    .exec(),
                Article.count({ author: { $in: user.following } }).exec()
            ]);
        })
        .then(([user, articles, articlesCount]) => {
            return callback(undefined, {
                statusCode: 200,
                body: JSON.stringify({
                    articles: articles.map(article => {
                        return article.toJSONFor(user);
                    }),
                    articlesCount
                })
            });
        });
};

export default enableCors(feedArticles);
