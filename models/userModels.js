const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");  // built in package hai...


const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,"please enter your name"],
        maxLength:[30,"Name cannot exceed 30 character"],
        minLength:[4,"Name should have more than 4 character"]
    },
    email:{
        type:String,
        required:[true,"Please enter your mail Id"],
        unique:true,
        validate:[validator.isEmail,"please enter a valid email"]
    },
    password:{
        type:String,
        required:[true,"Please enter your password"],
        minLength:[8,"Password should must be greater than 8 character"],
        select:false  // isska matlab hai ki hum User.find() lagaye ge tho hum ko sab detail de ga par password nahi dega ....
    },
    avatar:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:"user"
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },

    resetPasswordToken: String,

    resetPasswordExpire: Date,

})

// pahale ek function banye ge jo pahale kaam ho ga save hone se....

// yaha pr arrow function nahi use kare ge kyu ki hum arrow function me "this" nahi use kar sakte "()=>"

userSchema.pre("save", async function(next){

    if(!this.isModified("password")){
        next();
    }
    
    this.password = await bcrypt.hash(this.password, 10) // password jo user dale ga usko salting kare 10 level se 

})

// JWT token .....>>>> iss se token generate kare ge or cookies me store kare ge jis se ki pata rahe ga ye aadmi login hai pahale se or ye routes ko access kar sakte hai

userSchema.methods.getJwtToken = function(){
    return jwt.sign({id: this._id }, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    })
}

// comapre passsword

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

// generate password (I forget my password)

userSchema.methods.getResetPasswordToken = function (){

    const resetToken = crypto.randomBytes(20).toString("hex");  // crypto.randomBytes(20)==== ye koi buffer value de ga is ko String me change kare ge tho random sa kuch bhi deta hai fie HEX me toString kare ge tho ek token mile ga
                                                                // crypto.createHash("sha256").update(token).digest("hex");

    // hassing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
        .createHash("sha256")  //md5, sha1, sha512
        .update(resetToken)
        .digest("hex");


    this.resetPasswordExpire = Date.now() + 1000*60*15;

    return resetToken;

}

module.exports = mongoose.model("User", userSchema);
 