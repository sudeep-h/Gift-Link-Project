require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

let url = `${process.env.MONGO_URL}`;

let dbInstance = null;
const dbName = "giftdb";

async function connectToDatabase() {
    if (dbInstance){
        return dbInstance
    };

    const client = new MongoClient(url);      

    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    return dbInstance;
}

module.exports = connectToDatabase;
