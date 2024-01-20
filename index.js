const express = require('express');
const cors = require('cors');
require('./database/config');
const User = require('./database/users');
const Product = require('./database/products');
const Upload = require('./database/uploads');
const jwt = require('jsonwebtoken');    // install JWT package and import
const app = express();
const multer = require('multer'); // importing the module to uploade the file through API
const jwtKey = 'E-Commerce';     // creating a secreate jwt key


app.use(express.json());
app.use(cors());


const upload = multer({
    storage: multer.diskStorage({
        destination : function name(req, file, cb) {
            cb(null, "profilePicUpload")
        },
        filename : function name(req, file, cb) {
            cb(null, file.originalname + "-"+Date.now()+ ".jpg")
        }
    })
}).single("userProfile");






app.post('/uploadProfilePicture', (req, res) => {
    // Use the 'upload' middleware to handle the file upload
    upload(req, res, async (err)=>{
        if (err) {
            return res.status(500).send(err.message);
        }

              // Create a new document in the 'files' collection
              const newFile = new Upload({
                filename: req.file.filename,
                path: req.file.path,
                originalname: req.file.originalname
            });
    
            try {
                // Save the file details in MongoDB
                await newFile.save();
                return res.status(200).send('File uploaded and details saved successfully');
            } catch (error) {
                return res.status(500).send(error.message);
            }
        });
    });
app.get('/getProfilePic', async(request,response)=>{
    let result = await Upload.find();
    response.send(result);
})





 

app.post('/signup', async (request, response) => {
    const user = new User(request.body);
    let result = await user.save();
    result = result.toObject();
    delete  result.password
    // jwt.sign({result},jwtKey,{expiresIn:'2h'}, (error, token)=>{
        jwt.sign({result},jwtKey, (error, token)=>{
        if(error){
            response.send({result:"Somthing went Wrong"});
        }
        response.send({result,auth:token})       // sending both response and token in
    })
    // response.send(result);
});

app.post('/login', async (request, response) => {

    if (request.body.email && request.body.password) {
        let user = await User.findOne(request.body).select("-password");

        if (user) {                                                            //creating jwt token if user login
            jwt.sign({user},jwtKey, (error, token)=>{         // in the parameter 'token' jwt token will be stored
                if(error){
                    response.send({result:"Somthing went Wrong"});
                }
                response.send({user,auth: token})                   // token will be assign to the "auth" variable in response
            })
        }
        else {
            response.send({result: "User Not Found"});
        }
        // response.send(user);

    } else {
      response.send({result: "User Not Found"});
    }
});

app.post('/add-product',verifyToken, async(request, response)=>{
    const product = new Product(request.body);
    const result = await product.save();
    response.send(result);
});


app.get('/product',verifyToken, async(request, response)=>{
    let products = await Product.find();

    if(products.length>0)
    {
    response.send(products);
    }
    else{
        response.send({result:'No Record Found'});

    }

});
app.delete('/delete/:id',verifyToken, async(request, response)=>{
    const result = await Product.deleteOne({_id:request.params.id});
    response.send(result);
});

app.get('/product-edit/:id',verifyToken, async(request, response)=>{
    let result = await Product.findOne({_id:request.params.id});

    if(result){
        response.send(result);
    }else{
        response.send({result:'No Record Found'});
    }
});

app.put('/product-edit/:id',verifyToken, async (request, response)=>{
    let result = await Product.updateOne(
        {_id: request.params.id},{$set:request.body}
        );

    response.send(result);
});

app.get('/search/:key', verifyToken, async (request,response)=>{
    let result = await Product.find({
        "$or":[                                          //$or, using in order to search in more then one field
            {productName:{$regex:request.params.key}},
            {productCategory:{$regex:request.params.key}},
            {productCompany:{$regex:request.params.key}},
            {productPrice:{$regex:request.params.key}},
        ]
    })
    response.send(result);
});












function verifyToken(request, response, next){           // creating a function and will use it as middleware in API's
    let token = request.headers['authorization'];       // sending the token from postman and store it in variable "token"
    if(token){
        token= token.split(' ')[1];    // spliting the token fron the "space" (bearer bklsdjgfkjsfdlnh)
        jwt.verify(token, jwtKey, (err, valid)=>{
            if(err)
            {
                 response.status(401).send({result:"Token is not valid"});
            }
            else{
                next();
            }
        })
    } else {
        response.status(403).send({result:"Please add token with header"});
    }

}











app.listen(5000);
