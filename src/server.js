import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import { withDB } from './db';
import path from 'path';

const port = 8000;
// fake data
const articlesInfo = {
    'learn-react': { upvotes: 0, comments: [] },
    'learn-node': { upvotes: 0, comments: [] },
    'my-thoughts-on-resumes': { upvotes: 0, comments: [] },
};

const app = express();

app.use(express.static(path.join(__dirname, '/build')));
// le dice al express server que sirva archivos estaticos desde el directorio build

app.use(bodyParser.json());

app.get('/api/articles/:name', async (req, res) => {

    const articleName = req.params.name;
    await withDB(async db => {
        const articleInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(articleInfo);
    });


});

app.post('/api/articles/:name/upvote', async (req, res) => {
    try {
        const articleName = req.params.name;
        const client = await MongoClient.connect(
            'mongodb://localhost:27017',
            { useNewUrlParser: true, useUnifiedTopology: true }
        );

        const db = client.db('react-blog-db');

        const articleInfo = await db.collection('articles')
            .findOne({ name: articleName });

        if (articleInfo) {

            await db.collection('articles').updateOne({ name: articleName }, { '$set': { upvotes: articleInfo.upvotes + 1 } });

            const updatedArticleInfo = await db.collection('articles')
                .findOne({ name: articleName });

            res.status(200).json(updatedArticleInfo);

        } else {
            const msg = "ArticleNotFoundError";
            res.status(404).send({ name: msg });
        }

        client.close();
    } catch (error) {
        res.status(500).json(error);
    } finally {

    }

});

/*
 {
    "comment": {
        "postedBy": "Luis Medinelli",
        "text": "nice Article"
    }
}
*/

app.post('/api/articles/:name/comment', async (req, res) => {

    try {
        const articleName = req.params.name;
        const { comment } = req.body;
        const client = await MongoClient.connect(
            'mongodb://localhost:27017',
            { useNewUrlParser: true, useUnifiedTopology: true }
        );

        const db = client.db('react-blog-db');

        const articleInfo = await db.collection('articles')
            .findOne({ name: articleName });

        if (articleInfo) {

            await db.collection('articles').updateOne({ name: articleName }, { '$set': { comments: articleInfo.comments.concat(comment) } });

            const updatedArticleInfo = await db.collection('articles')
                .findOne({ name: articleName });

            res.status(200).json(updatedArticleInfo);

        } else {
            const msg = "ArticleNotFoundError";
            res.status(404).send({ name: msg });
        }

        client.close();
    } catch (error) {
        res.status(500).json(error);
    } finally {

    }

});

/* reference of the services to test express and nodejs

app.get('/hello', (req, res) => {

    res.send('Hello!!!')
});

app.get('/hello/:name', (req, res) => {
    const { name } = req.params;
    res.send('Hello!!! ' + name)
});

app.post("/hello", (req, res) => {
    const { name } = req.body;
    res.send(`hello ${name}`);
});
*/

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/build/index.html'));
})

app.listen(port, () => console.log(`Server is listening in port ${port}`));