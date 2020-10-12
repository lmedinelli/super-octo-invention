import { MongoClient } from 'mongodb'
export const withDB = async operations => {
    try {
        const url = 'mongodb://localhost:27017';
        const client = await MongoClient.connect(url, { poolSize: 5, useNewUrlParser: true, useUnifiedTopology: true });
        /*
        const client = MongoClient.connect(url, {
            poolSize: 10,
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function (err, db) {
            //assert.equal(null, err);
            // mongodb = db;
        }
        );*/
        const db = client.db('react-blog-db');

        await operations(db);

        client.close();
    } catch (err) {
        res.status(500).send({ message: 'Database Error', err });
    } finally {


    }

}

/*
// Create the database connection
MongoClient.connect(url, {
  poolSize: 10
  // other options can go here
},function(err, db) {
    assert.equal(null, err);
    mongodb=db;
    }
);
*/