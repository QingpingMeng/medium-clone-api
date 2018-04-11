import { Handler, Context, Callback } from 'aws-lambda';
import { connectToDatabase } from '../common/db';
import { Article } from '../models/Article';

export const getTags: Handler = (
    event: any,
    context: Context,
    callback: Callback
) => {
    connectToDatabase()
        .then(() =>
            Article.find()
                .distinct('tagList')
                .then(tags => {
                    callback(undefined, {
                        statusCode: 200,
                        body: JSON.stringify({
                            tags
                        })
                    });
                })
        )
        .catch(error => callback(error));
};
