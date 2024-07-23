const ErrorHander = require("../utils/errorHander.js");
const catchAsyncError =require("../middleWare/catchAsyncError.js");
const User = require("../models/userModels.js");
const sendToken = require("../utils/jwtToken.js");
const sendEmail = require("../utils/sendEmail.js")
const crypto = require("crypto");
const cloudinary = require("cloudinary");

// register a user

exports.registerUser = catchAsyncError(async (req,res,next)=>{

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    })

    

    const {name, email, password} = (req.body);

    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    })

    sendToken(user,201,res);

})


// login user

exports.loginUser = catchAsyncError(async (req,res,next)=>{
    
    const { email, password } = req.body;

    // checking email or password

    if(!email || !password){
        return next(new ErrorHander("Please enter Email or Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");  // yaha pe select me password daale hai kyu ki upar me password ko select false kar dye the or ab password ko match karna hai email ke sath mei iss lye hum password ko select karte hai taaki match kar sake

    if(!user){
        return next(new ErrorHander("Invalid Email or Password",401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHander("Invalid Email or Password",401))
    }

    sendToken(user,200,res);   
})

// logout user

exports.logoutUser = catchAsyncError(async(req,res,next)=>{

    res.cookie("token", "" , {   
        expires: new Date(1),
        httpOnly: true,
        secure: true,
        sameSite:"none",
    })

    res.status(200).json({
        success: true,
        message: "Logged Out"
    })

})

// forget password

exports.forgetPassword = catchAsyncError( async(req,res,next)=>{

    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHander("User not found",404));
    }

    //get resetPasswordToken
    const resetToken = user.getResetPasswordToken();  // avi tho call hua hai or token save thori na hua hai avi tho bana he hai tho pahale save kare ge iss ko

    await user.save({ validateBeforeSave: false});


    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;


    const message = `your password reset token temp is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, Please ignore it`;

    try{

        await sendEmail({
            email:user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        })

        res.status(200).json({
            success:true,
            message: `Email sent ${user.email} successfully`,
        })

    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false});

        return next(new ErrorHander(error.message,500));

    }
})

//reset Password

exports.resetPassword = catchAsyncError(async(req,res,next)=>{


    // creating token hash
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    })  
    
    if(!user){
        return next(new ErrorHander("Reset password token is invalid or has been expired", 400));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHander("Password does not matched", 400));
    }

    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();

    sendToken(user,200,res);

})

/// get user detail


exports.getUserDetails = catchAsyncError( async (req,res,next)=>{

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })

})

// update Password jo login rahe ga

exports.updatePassword = catchAsyncError( async (req,res,next)=>{

    const user = await User.findById(req.user.id).select("+password"); 

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHander("Old password is incorrect",400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHander("Password is not matched",400))
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);

})


// update profile jo login rahe ga

exports.updateProfile = catchAsyncError( async (req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    }

    //cloudinary se image upload ho ga
    if(req.body.avatar !== "" ){
        // console.log("ham hai re")
        const user = await User.findById(req.user.id);
        const imageId=user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            height: 150,
            crop: "scale",
        })

        newUserData.avatar = {
            public_id : myCloud.public_id,
            url : myCloud.secure_url,
        }

    }
    // console.log(newUserData)
    const user = await User.findByIdAndUpdate(req.user.id,newUserData, {
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success:true,
    })

})


//get all users(admin)

exports.getAllUser = catchAsyncError( async (req,res,next)=>{
    const users = await User.find(); //ye pura array dega

    res.status(200).json({
        success:true,
        users,
    })
})

//get single user detail (... ADMIN ...)

exports.getSingleUserDetails = catchAsyncError( async (req,res,next)=>{
    const user = await User.findById(req.params.id); //ye pura array dega

    if(!user){
        return next(new ErrorHander(`User does not exist with this id ${req.params.id}`))
    }

    res.status(200).json({
        success:true,
        user,
    })
})


// update profile (...admin....) jo login rahe ga

exports.updateProfileADMIN = catchAsyncError( async (req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id,newUserData, {
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success:true,
    })

})

// deleteuser BY admin (...ADMIN...)

exports.deleteProfile = catchAsyncError( async (req,res,next)=>{

    const user = await User.findById(req.params.id)

    if(!user){
        return next(new ErrorHander(`user does not exist with id ${req.params.id}`,400))
    }

    const imageId=user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    await user.deleteOne();
 
    res.status(200).json({
        success:true,
        message: "User Deleted Successfully",
    })

})

