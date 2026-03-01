import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import users from './route/user.js';
const app = express();
const port = 3000;


const myLogger = function (req, res, next) {
    console.log('middleware logged');
    next()
}


app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
})

app.use(
    cors({
        origin: process.env.FE_ORIGIN,
        //
        //////////// Optional
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);


//to parse json body
app.use(express.json());


app.use(myLogger);
app.use('/user', users);


app.get('/', (req, res) => {
    res.send('Hello World!');
})


// ALL API

app.all('/test', (req, res) => {
    res.send('Response from all api');
})


// Post API

app.post('/', (req, res) => {
    res.send('Hello World! from post api');
})

export default app;
