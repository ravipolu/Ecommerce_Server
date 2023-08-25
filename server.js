
const app = require("./app");
const dotenv=require("dotenv");
const connectDataBase= require("./configuration/database.js");
const cloudinary = require("cloudinary")
// const cors = require('cors');
// const corsOptions ={
//     origin:'https://mern-ecommerce-shopping.onrender.com',   // origin:'http://localhost:3000', 
//     credentials:true,            //access-control-allow-credentials:true
//     optionSuccessStatus:200
// }
// app.use(cors(corsOptions));

//handeling uncaught exception

process.on("uncaughtException",(err)=>{
    console.log(`Error : ${err.message}`);
    console.log("Shutting down the server due to uncaught Exception");
    process.exit(1);
})



// config
// dotenv.config({path:"Backend/configuration/config.env"});

if(process.env.NODE_ENV !== "PRODUCTION"){
    dotenv.config({path:"configuration/config.env"});
}

//connecting to database
connectDataBase();

// export const instance = new Razorpay({
//     key_id: process.env.RAZORPAY_API_KEY,
//     key_secret : process.env.RAZORPAY_API_SECRET,
//   })

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on  http://localhost:${process.env.PORT}`)
})


// unhandeled promise rejection

process.on("unhandledRejection",err=>{
    console.log(`Error : ${err.message}`);
    console.log(`shutting down the server due to unhandeled promise rejection`);

    server.close(()=>{
        process.exit(1);
    })
})
