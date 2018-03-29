import { Handler, Context, Callback } from 'aws-lambda';
import { connectToDatabase } from '../common/db';
import { User } from '../models/User';
import { Article } from '../models/Article';
import { validateToken } from '../auth/authorizer';

export const getArticle: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    connectToDatabase()
        .then(() =>
            Promise.all([
                Article.findOne({ slug: event.pathParameters.slug }).populate('author').exec(),
                validateToken(event.headers.authorization)
                    .then(decoded => {
                        console.log('decode', decoded);
                        return User.findById(decoded.id).exec();
                    })
                    .catch(() => Promise.resolve(undefined))
            ])
        )
        .then(([article, user]) => {
            if (!article) {
                return callback(undefined, {
                    statusCode: 404
                });
            }

            return callback(undefined, {
                statusCode: 200,
                body: JSON.stringify({
                    article: article.toJSONFor(user || undefined)
                })
            });
        });
};
