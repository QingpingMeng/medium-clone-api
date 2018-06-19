import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { secret } from '../config';
import { Document, Schema, Model, model } from 'mongoose';

const uniqueValidator = require('mongoose-unique-validator');

export interface IUser {
    username: string;
    email: string;
    token: string;
    bio: string;
    image: string;
}

export interface IProfile {
    username: string;
    bio: string;
    image: string;
    following: boolean;
}

export interface IUserModel extends IUser, Document {
    hash: string;
    salt: string;
    following: string[];
    favorites: string[];
    setPassword: (password: string) => void;
    validPassword: (password: string) => boolean;
    toAuthJSON: () => IUser;
    toProfileJSONFor: (user?: IUser) => IProfile;
    follow: (userId: string) => Promise<IUserModel>;
    unfollow: (userId: string) => Promise<IUserModel>;
    isFollowing: (userId: string) => boolean;
    favorite: (articleId: string) => Promise<IUserModel>;
    unfavorite: (articleId: string) => Promise<IUserModel>;
    isFavorite: (articleId: string) => boolean;
}

export const UserSchema = new Schema(
    {
        username: {
            type: String,
            lowercase: true,
            unique: true,
            required: [true, "can't be blank"],
            match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
            index: true
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: [true, "can't be blank"],
            match: [/\S+@\S+\.\S+/, 'is invalid'],
            index: true
        },
        bio: String,
        image: String,
        following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        favorites: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
        hash: String,
        salt: String
    },
    { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UserSchema.methods.setPassword = function(password: string) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto
        .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
        .toString('hex');
};

UserSchema.methods.validPassword = function(password: string): boolean {
    const hash = crypto
        .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
        .toString('hex');
    return this.hash === hash;
};

UserSchema.methods.generateJWT = function(): string {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            exp: parseInt(exp.getTime() / 1000 + '', 10)
        },
        secret
    );
};

UserSchema.methods.toAuthJSON = function(): IUser {
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        bio: this.bio,
        image: this.image
    };
};

UserSchema.methods.toProfileJSONFor = function(user: IUserModel) {
    return {
        username: this.username,
        bio: this.bio,
        image:
            this.image ||
            'https://static.productionready.io/images/smiley-cyrus.jpg',
        following: user ? user.isFollowing(this._id) : false
    };
};

UserSchema.methods.follow = function(id: string) {
    if (this.following.indexOf(id) === -1) {
        this.following.push(id);
    }
    return this.save();
};

UserSchema.methods.unfollow = function(id: string) {
    this.following.remove(id);
    return this.save();
};

UserSchema.methods.favorite = function(id: string) {
    if (this.favorites.indexOf(id) === -1) {
        this.favorites.push(id);
    }
    return this.save();
};

UserSchema.methods.unfavorite = function(articleId: string) {
    this.favorites.remove(articleId);
    return this.save();
};

UserSchema.methods.isFollowing = function(id: string): boolean {
    return this.following.some(function(followId: string) {
        return followId.toString() === id.toString();
    });
};

UserSchema.methods.isFavorite = function(articleId: string) {
    return this.favorites.some(function(favoriteId: string) {
        return favoriteId.toString() === articleId.toString();
    });
};

export const User: Model<IUserModel> = model<IUserModel>('User', UserSchema);
