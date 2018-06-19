import { Document, Schema, Model, model } from 'mongoose';
import { IUserModel, User } from './User';
import { ICommentModel } from './Comment';

const uniqueValidator = require('mongoose-unique-validator');
const slug = require('slug');

export interface IArticle {
    slug: string;
    title: string;
    description: string;
    body: string;
    favoritesCount: number;
    comments: ICommentModel[] & { remove: (id: string) => void };
    tagList: string[];
    author: IUserModel;
}

export interface IArticleModel extends IArticle, Document {
    toJSONFor: (user?: IUserModel) => IArticleModel;
    slugify: () => string;
    updateFavoriteCount: () => Promise<IArticleModel>;
}

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

ArticleSchema.pre('validate', function(this: IArticleModel, next) {
    if (!this.slug) {
        this.slugify();
    }

    next();
});

ArticleSchema.methods.slugify = function() {
    this.slug =
        slug(this.title) +
        '-' +
        ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
};

ArticleSchema.methods.updateFavoriteCount = function() {
    const article = this;

    return User.count({ favorites: { $in: [article._id] } }).then(function(
        count
    ) {
        article.favoritesCount = count;

        return article.save();
    });
};

ArticleSchema.methods.toJSONFor = function(user?: IUserModel) {
    return {
        slug: this.slug,
        title: this.title,
        description: this.description,
        body: this.body,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        tagList: this.tagList,
        favorited: user ? user.isFavorite(this._id) : false,
        favoritesCount: this.favoritesCount,
        author: this.author.toProfileJSONFor(user)
    };
};

export const Article: Model<IArticleModel> = model<IArticleModel>(
    'Article',
    ArticleSchema
);
