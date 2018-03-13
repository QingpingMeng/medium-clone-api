import { Mongoose, connect } from 'mongoose';
let isConnected: boolean = false;

export const connectToDatabase = () => {
    if (isConnected) {
        return Promise.resolve();
    }

    const dbUri: string = process.env.DB || 'string';
    return connect(dbUri).then((db: Mongoose) => {
        isConnected = db.connection.readyState == 1; // 1 for connected
    });
};
