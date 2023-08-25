const catchAsyncError = require("../middleWare/catchAsyncError");

const stripe = require('stripe')('sk_test_51MxqL0SCpqzVJH9npyPqZLHdq5Fo7AajUYkcuQ3pimCFkVZUHf0ImidhpG9dZmzt7SGGQ1eofQDOCZq77XjE4PBB00Jmjetj5Z');

exports.processPayment = catchAsyncError(async (req, res, next) => {
    
  
    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      metadata: {
        company: "Ecommerce",
      },
    });


    res
      .status(200)
      .json({ success: true, client_Secret: myPayment.client_secret });
  });


exports.sendStripeApiKey = catchAsyncError(async(req,res,next)=> {
    res.status(200).json({
        stripeApiKey: process.env.STRIPE_API_KEY
    })
})




