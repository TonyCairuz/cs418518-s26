import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import users from './route/user.js';
import advising from './route/advising.js';
const app = express();
const port = process.env.PORT || 3000;


const myLogger = function (req, res, next) {
    console.log('middleware logged');
    next()
}

// Clickjacking prevention
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    next();
});


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
app.use('/advising', advising);


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
