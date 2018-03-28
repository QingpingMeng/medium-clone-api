import { Mongoose, connect } from 'mongoose';
let isConnected: boolean = false;

export const connectToDatabase = () => {
    if (isConnected) {
        return Promise.resolve();
    }

    const defaultDb = `mongodb://test_dev:adminpassword@ds135234.mlab.com:35234/medium-clone`;
    const dbUri: string = process.env.DB || defaultDb;
    console.log(dbUri);
    return connect(dbUri).then((db: Mongoose) => {
        isConnected = db.connection.readyState == 1; // 1 for connected
    }).catch(error => {
        console.log('db error:', error);
        return Promise.reject(error);
    });
};
