const express = require('express')
const app=express();
const morgan = require('morgan');
const bodyParser= require('body-parser');
const mongoose=require('mongoose')

const productRoutes = require('./api/routes/products')
const ordersRoutes = require('./api/routes/orders')
const userRouts=require('./api/routes/user')


mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser:true,useUnifiedTopology:true})

mongoose.Promise=global.Promise;

app.use(morgan('dev'));
app.use('//uploads',express.static('uploads'))
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//CORS
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');//we can set'*' also
    if(req.method ==='OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({});
    }
    next();
});

//routes which should handle request
app.use('/products',productRoutes)
app.use('/orders',ordersRoutes)
app.use('/user',userRouts)

app.use((req,res,next)=>{
    const error=new Error('Not found');
    error.status= 404;
    next(error);
})

app.use((error,req,res,next)=>{
    res.status(error.status || 500)
    res.json({
        error:{
            message:error.message
        }
    })
});



module.exports = app;