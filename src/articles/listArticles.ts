import { Handler, Context, Callback } from 'aws-lambda';
import { connectToDatabase } from '../common/db';
import { User } from '../models/User';
import { Article } from '../models/Article';
import { validateToken } from '../auth/authorizer';
import { enableCors } from '../common/cors';

const listArticles: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let { limit, offset } = event.queryStringParameters;
    const {
        tag: queryTag,
        author: queryAuthor,
        favorited: queryFavorited
    } = event.queryStringParameters;

    const query: any = {};
    limit = limit || 20;
    offset = offset || 0;

    if (queryTag) {
        query.tagList = { $in: [queryTag] };
    }
    connectToDatabase()
        .then(() => {
            return Promise.all([
                queryAuthor
                    ? User.findOne({ username: queryAuthor }).exec()
                    : Promise.resolve(undefined),
                queryFavorited
                    ? User.findOne({ username: queryFavorited }).exec()
                    : Promise.resolve(undefined)
            ]);
        })
        .then(([author, favoriter]) => {
            if (author) {
                query.author = author._id;
            }

            if (favoriter) {
                query._id = { $in: favoriter.favorites };
            } else if (queryFavorited) {
                query._id = { $in: [] };
            }

            return Promise.all([
                Article.find(query)
                    .limit(Number(limit))
                    .skip(Number(offset))
                    .sort({ createdAt: 'desc' })
                    .populate('author')
                    .exec(),
                Article.count(query).exec(),
                validateToken(event.headers && (event.headers.authorization || event.headers.Authorization))
                    .then(decoded => {
                        console.log('ListArticle decoded:', decoded);
                        return User.findById(decoded.id).exec();
                    })
                    .catch(() => {
                        console.log('ListArticle get current user failed. Event header:', event.headers);
                        return Promise.resolve(undefined);
                    })
            ]);
        })
        .then(([articles, articlesCount, currentUser]) => {
            console.log(`ListArticle: Current user: ${currentUser}`);
            return callback(undefined, {
                statusCode: 200,
                body: JSON.stringify({
                    articles: articles.map(article => {
                        return article.toJSONFor(currentUser || undefined);
                    }),
                    articlesCount
                })
            });
        })
        .catch(error => {
            console.log('list articles error', error);
            return callback(error);
        });
    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

export default enableCors(listArticles);
