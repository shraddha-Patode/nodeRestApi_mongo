const express = require('express')
const router=express.Router();
const mongoose=require('mongoose');
const Product= require('../models/product')  //Product is a module
const multer=require('multer');

 const storage=multer.diskStorage({
     destination:function (req,file,cb) {
         cb(null, './uploads');
     },
     filename:function (req,file,cb) {
         cb(null, new Date().getTime()+'-' + file.originalname)
     }
 })
 const fileFilter=(req,file,cb)=>{
     //reject a file
    //  if(file.mimetype==='image/jpeg'){
    //     cb(null,false)
    //  }
    //  else{
    //      cb(null,false);
    //  }
     
 }

const upload=multer({
    storage:storage,
    limits:{
        fileSize:1024*1024*5
    }
    //fileFilter:fileFilter
});




router.get('/',(req,res,next)=>{
    // res.status(200).json({
    //     message:'Handling Get request to /products'
    // })
    Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs=>{
        const response={
            count:docs.length,
            Allproducts:docs.map(doc=>{
                return{
                    name:doc.name,
                    price:doc.price,
                    _id:doc._id,
                    productImage:doc.productImage,
                    request:{
                        type:'GET',
                        url: 'http://localhost:3000/products/'+doc._id
                    }
                }
            })
        }
        res.status(200).json(response)
    })
    
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    })
})

router.post('/',upload.single('productImage'),(req,res,next)=>{
    console.log(req.file)
    //before db for testing we write name,price
    // const product={
    //     name:req.body.name,
    //     price:req.body.price
    // }
    const product=new Product({
        _id:new mongoose.Types.ObjectId(),
        name:req.body.name,
        price:req.body.price,
        productImage:req.file.path
    });
    product.save()
    .then(result=>{
        console.log(result);
        res.status(201).json({
            message:'Created product successfuly',
            createdProduct:{
                name:result.name,
                price:result.price,
                _id:result._id,
                request:{
                    type:'GET',
                    url:'http://localhost:3000/products/'+ result._id
                }
            }
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({error:err})
    })
        
   
})

router.get('/:productId',(req,res,next)=>{
     const id=req.params.productId
Product.findById(id)
.select('name price _id productImage')
.exec()
.then(doc=>{
    console.log('From database',doc);
    if(doc){
        res.status(200).json({
            product:doc,
            request:{
                type:'GET',
                url:'http://localhost:3000/products/'
            }
        })
    }
    else{
        res.status(404).json({message:"No valid entry found for provided Id"});
    }
    
})
.catch(err=>{
    console.log(err),
    res.status(500).json({error:err})  
})


})
//this is the format to pas in postman for patch
//[
    //{ "propName":"name","value":"harrypoter2" }
//]                for name property

// for price propery
//[
   // { "propName":"price","value":"1" }
//]



router.patch('/:productId',(req,res,next)=>{
    const id=req.params.productId
    const updeteOps={};
    for(const ops of req.body){
        updeteOps[ops.propName]=ops.value;
    }
    Product.update({_id:id},{$set:updeteOps })
.exec()
.then(result=>{
    res.status(200).json({
        message:'Product updated',
        request:{
            type:'GET',
            rl:'http://localhost:3000/products/'+id
        }
    })
})
.catch(err=>{
    console.log(err)
    res.status(500).json({
        error:err
    });
})
})


router.delete('/:productId',(req,res,next)=>{
    // res.status(200).json({
    //     message:'deleted product'
    // })
    const id=req.params.productId;
    Product.remove({_id:id})
    .exec()
    .then(result=>{
        res.status(200).json({
            message:'product deleted',
            request:{
                type:'POST',
                url:'http://localhost:3000/products/',
                body:{name:'String',price:'Number'}
            }
        })
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    })
})


module.exports=router;