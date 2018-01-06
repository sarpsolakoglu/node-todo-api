// const MongoClient = require('mongodb').MongoClient;

const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017', (err, database) => {
    if (err) {
       return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');

    const db = database.db('TodoApp');

    // db.collection('Todos').find({
    //     _id: new ObjectID('5a50ee3acca177645dc17f2c')
    // }).toArray().then((docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });

    // db.collection('Todos').find().count().then((count) => {
    //     console.log(`Todos count: ${count}`);
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });

    db.collection('Users').find({name: 'Sarp'}).count().then((count) => {
        console.log(`Todos count: ${count}`);
    }, (err) => {
        console.log('Unable to fetch todos', err);
    });

    database.close();
});

