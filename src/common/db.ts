import { Mongoose, connect } from 'mongoose';
let isConnected: boolean = false;

export const connectToDatabase = () => {
    if (isConnected) {
        return Promise.resolve();
    }

    const defaultDb = process.env.db || 'mongodb://localhost/conduit';
    const dbUri: string = defaultDb;
    console.log(dbUri);
    return connect(dbUri).then((db: Mongoose) => {
        isConnected = db.connection.readyState == 1; // 1 for connected
    }).catch(error => {
        console.log('db error:', error);
        return Promise.reject(error);
    });
};
