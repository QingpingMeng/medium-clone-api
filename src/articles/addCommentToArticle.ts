import { Handler, Context, Callback } from 'aws-lambda';
import { connectToDatabase } from '../common/db';
import { User } from '../models/User';
import { Article } from '../models/Article';
import { Comment } from '../models/Comment';
import { enableCors } from '../common/cors';

const addCommentToArticle: Handler = (
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

            const { comment } = JSON.parse(event.body);
            const commentModel = new Comment(comment);
            commentModel.article = article;
            commentModel.author = user;

            return Promise.all([
                commentModel.save(),
                Promise.resolve(user),
                Promise.resolve(article)
            ]);
        })
        .then(([comment, user, article]) => {
            article.comments.push(comment);
            return Promise.all([
                article.save(),
                Promise.resolve(user),
                Promise.resolve(comment)
            ]);
        })
        .then(([article, user, comment]) => {
            return callback(undefined, {
                statusCode: 200,
                body: JSON.stringify({
                    comment: comment.toJSONFor(user)
                })
            });
        })
        .catch(error => callback(error));
};

export default enableCors(addCommentToArticle);
