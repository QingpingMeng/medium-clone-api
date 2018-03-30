import { Document, Schema, Model, model } from 'mongoose';
import { IUser, IUserModel } from './User';
import { IArticle } from './Article';

export interface IComment {
    body: string;
    author: IUserModel;
    article: IArticle;
}

export interface ICommentModel extends IComment, Document {
    toJSONFor: (user?: IUser) => ICommentModel;
}

export const CommentSchema = new Schema(
    {
        body: String,
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        article: { type: Schema.Types.ObjectId, ref: 'Article' }
    },
    { timestamps: true }
);

CommentSchema.methods.toJSONFor = function(user: IUser) {
    return {
        id: this._id,
        body: this.body,
        createdAt: this.createdAt,
        author: this.author.toProfileJSONFor(user)
    };
};

export const Comment: Model<ICommentModel> = model<ICommentModel>(
    'Comment',
    CommentSchema
);
