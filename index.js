const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
//helpers
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');


// routers
const categoriesRouter = require('./routes/categories');
const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');



require('dotenv/config');
const api = process.env.API_URL;

const app = express();
const port = 3000;

app.use(cors());
app.options('*',cors());

// middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(morgan('tiny'))
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);



app.use(`${api}/categories`,categoriesRouter);
app.use(`${api}/products`,productsRouter);
app.use(`${api}/users`,usersRouter);
app.use(`${api}/orders`,ordersRouter);






mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
})
.then(()=>{
    console.log('Database Connection is ready... ')
})
.catch((err)=>{
    console.log(err);
    console.log("---> Database Connection is not ready <---")
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    console.log(`Server listening on port ${port}`)
});
