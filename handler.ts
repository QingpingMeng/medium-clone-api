import { Handler, Context, Callback } from 'aws-lambda';
export { login } from './src/auth/login';
export { signup } from './src/auth/signup';
export { authorizer } from './src/auth/authorizer';
export { currentUser } from './src/auth/currentUser';
export { getProfile } from './src/profiles/getProfile';
export { followUser } from './src/profiles/followUser';
export { unfollowUser } from './src/profiles/unfollowUser';
export { listArticles } from './src/articles/listArticles';
export { createArticle } from './src/articles/createArticle';
export { getArticle } from './src/articles/getArticle';
export { feedArticles } from './src/articles/feedArticles';
export { updateArticle } from './src/articles/updateArticle';
export { deleteArticle } from './src/articles/deleteArticle';
export { addCommentToArticle } from './src/articles/addCommentToArticle';
export { getCommentsFromArticle } from './src/articles/getCommentsFromArticle';
export { deleteComment } from './src/articles/deleteComment';
export { favoriteArticle } from './src/articles/favoriteArticle';

require('dotenv').config({ path: './variables.env' });

interface HelloResponse {
    statusCode: number;
    body: string;
}

const hello: Handler = (event: any, context: Context, callback: Callback) => {
    const response: HelloResponse = {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Go Serverless v1.0! Your function executed successfully!',
            input: event,
            env: process.env.DB
        })
    };

    callback(undefined, response);

    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

const getTags = (event: any, context: Context, callback: Callback) => {
    const response: HelloResponse = {
        statusCode: 200,
        body: JSON.stringify({ tags: [] })
    };

    callback(undefined, response);

    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

export { hello, getTags };
