import { Mongoose, connect } from 'mongoose';
let isConnected: boolean = false;

export const connectToDatabase = () => {
    if (isConnected) {
        return Promise.resolve();
    }

    const defaultDb = `mongodb://test_dev:adminpassword@medium-clone-db-shard-00-00-efkts.mongodb.net:27017,medium-clone-db-shard-00-01-efkts.mongodb.net:27017,medium-clone-db-shard-00-02-efkts.mongodb.net:27017/test?ssl=true&replicaSet=medium-clone-db-shard-0&authSource=admin`;
    const dbUri: string = process.env.DB || defaultDb;
    return connect(dbUri).then((db: Mongoose) => {
        isConnected = db.connection.readyState == 1; // 1 for connected
    });
};
