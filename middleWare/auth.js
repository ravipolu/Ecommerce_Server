const userModels = require("../models/userModels");
const ErrorHander = require("../utils/errorHander");
const catchAsyncError = require("./catchAsyncError");
const jwt =require("jsonwebtoken");
const User = require("../models/userModels.js");


exports.isAuthenticatedUser = catchAsyncError(async (req,res,next)=>{
    
    const { token } = await req.cookies;  // login karte samaye ham token ko cookie mai store kar lete hai
    if(!token){
        return next(new ErrorHander("Please login to access this resource",401));
    }

    const decodedData = jwt.verify(token,process.env.JWT_SECRET);
    //returns a decode object that we stored the token...
    req.user = await User.findById(decodedData.id);

    next();
})

exports.authorisedRoles = (...roles) =>{
    return (req,res,next) =>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHander(
                `Role: ${req.user.role} is not allowed to access this resource`,
                403
                ));
        }

        next();
    }
}