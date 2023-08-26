const express = require("express");
const errors = require("./middleWare/errors.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload")
const dotenv = require("dotenv");

const ErrorMiddleWare = require("./middleWare/errors.js");

// dotenv.config({path:"Backend/configuration/config.env"});

if(process.env.NODE_ENV !== "PRODUCTION"){
  dotenv.config({path:"configuration/config.env"});
}

const app = express();
const path = require("path");


app.use(express.json());
app.use(cookieParser());
app.use("*",cors({
    origin:true,
    credentials: true,
}));
// app.use((req, res, next) => {
//     // res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
//     res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//     next();
//   })
app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(fileUpload());
app.use(express.json())

// app.use(express.static(path.join(__dirname,"../frontend/build")));




// Routes Import

const product = require("./routes/productRoute.js");
const user = require("./routes/userRoutes.js");
const order = require("./routes/orderRoutes.js");
const payment = require("./routes/paymentRoutes.js");

app.use("/api/v1",product);  // ye wo string hai jo hamesa add ho ga product link se pahale
app.use("/api/v1",user);
app.use("/api/v1",order);
app.use("/api/v1",payment);



// app.get("*",(req,res)=>{
//   res.sendFile(path.resolve(__dirname,"../frontend/build/index.html"));
// })

//middle ware for error

app.use(ErrorMiddleWare);


module.exports = app;


