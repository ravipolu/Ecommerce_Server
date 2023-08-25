// baar baar jo hum log if else laga rahe hai check karne ke lye uss ko kam kare ga....

class ErrorHander extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this,this.constructor);
    }
}


module.exports = ErrorHander;



