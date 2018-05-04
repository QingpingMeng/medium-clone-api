import { Handler, Context, Callback } from 'aws-lambda';
import { connectToDatabase } from '../common/db';
import { User } from '../models/User';
import { Article } from '../models/Article';
import { enableCors } from '../common/cors';

const createArticleHandler: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    context.callbackWaitsForEmptyEventLoop = false;
    connectToDatabase()
        .then(() =>
            User.findById(event.requestContext.authorizer.principalId).exec()
        )
        .then(user => {
            if (!user) {
                return callback(undefined, {
                    statusCode: 401
                });
            }

            const body = JSON.parse(event.body);
            console.log('article:', body.article);
            const articleModel = new Article(body.article);
            articleModel.author = user;

            return articleModel.save().then(() => {
                return callback(undefined, {
                    statusCode: 200,
                    body: JSON.stringify({
                        article: articleModel.toJSONFor(user)
                    })
                });
            });
        })
        .catch(error => {
            return callback(error);
        });
};

export default enableCors(createArticleHandler);
