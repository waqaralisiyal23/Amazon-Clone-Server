// IMPORTS FROM PACKAGES
const express = require('express');
const mongoose = require('mongoose');
// IMPORTS FROM OTHER FILES
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const productRouter = require('./routes/product');
const userRouter = require('./routes/user');

// INIT
const PORT = process.env.PORT || 3000;
const app = express();
const DB = 'mongodb://user:password@ac-xykbr8g-shard-00-00.9ccke5l.mongodb.net:27017,ac-xykbr8g-shard-00-01.9ccke5l.mongodb.net:27017,ac-xykbr8g-shard-00-02.9ccke5l.mongodb.net:27017/?ssl=true&replicaSet=atlas-2qe3y4-shard-0&authSource=admin&retryWrites=true&w=majority';

// middleware
app.use(express.json());
app.use(adminRouter);
app.use(authRouter);
app.use(productRouter);
app.use(userRouter);

// Connections
mongoose.connect(DB).then(() => {
    console.log('Connection Successfull');
}).catch((e) => {
    console.log(e);
});

// Added 0.0.0.0 to run server from local ip address
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Conneted at port ${PORT}`);
});