import { Handler, Context, Callback } from 'aws-lambda';
import { connectToDatabase } from '../common/db';
import { User } from '../models/User';
import { Article } from '../models/Article';
import { Comment } from '../models/Comment';
import { enableCors } from '../common/cors';

const deleteComment: Handler = (
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
                ).exec(),
                Comment.findById(event.pathParameters.id).exec()
            ]);
        })
        .then(([article, user, comment]) => {
            if (!user) {
                callback(undefined, {
                    statusCode: 401
                });
                return Promise.reject(new Error('Unauthorized'));
            }

            if (!article || !comment) {
                callback(undefined, {
                    statusCode: 404
                });

                return Promise.reject(new Error('NotFound'));
            }

            if (comment.author.toString() !== user._id.toString()) {
                callback(undefined, {
                    statusCode: 403
                });
                return Promise.reject(new Error('Forbidden'));
            }

            article.comments.remove(comment._id);
            return article.save().then(() => Promise.resolve(comment));
        })
        .then(comment =>
            Comment.find({ _id: comment._id })
                .remove()
                .exec()
        )
        .then(() => {
            return callback(undefined, {
                statusCode: 204
            });
        })
        .catch(error => callback(error));
};

export default enableCors(deleteComment);
