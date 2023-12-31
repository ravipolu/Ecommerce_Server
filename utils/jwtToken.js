

const sendToken = (user, statusCode, res)=>{

    const token= user.getJwtToken();

    //option for cookies 

    const options={
        expires: new Date(Date.now() + process.env.COOKIES_EXPIRE  *24 * 60 *60 *1000),
        httpOnly: true,
        secure: true,
        sameSite:"none",        
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token,
    })
}

module.exports = sendToken;