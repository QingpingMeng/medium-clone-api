import { Document, Schema, Model, model } from 'mongoose';
import { IUser } from './User';
import { IComment } from './Comment';

const uniqueValidator = require('mongoose-unique-validator');

export interface IArticle {
    slug: string;
    title: string;
    description: string;
    body: string;
    favCount: number;
    comments: IComment[];
    tagList: string[];
    author: IUser;
}

export interface IArticleModel extends IArticle, Document {}

export const ArticleSchema = new Schema(
    {
        slug: { type: String, lowercase: true, unique: true },
        title: String,
        description: String,
        body: String,
        favoritesCount: { type: Number, default: 0 },
        comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
        tagList: [{ type: String }],
        author: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

ArticleSchema.plugin(uniqueValidator, { message: 'is already taken' });

export const Article: Model<IArticleModel> = model<IArticleModel>(
    'Article',
    ArticleSchema
);
