const Order = require("../models/orderModel.js")
const Product = require("../models/productModel.js");
const ErrorHander   = require("../utils/errorHander.js");
const catchAsyncError = require("../middleWare/catchAsyncError.js");



exports.createNewOrder = catchAsyncError(async(req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    orderItems.forEach(async(item)=>{
        const  product = await Product.findById(item.product);
        product.stock -= item.quantity;
        await product.save({validateBeforeSave: false});
    })

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user:req.user._id,
    });

    res.status(200).json({
        success:true,
        order,
    })
})

// get single order

exports.getSingleOrder = catchAsyncError(async (req,res,next)=>{

    const order = await Order.findById(req.params.id).populate("user","name email");  //populate se kya ho ga .... ye user id uthaye ga order me se fir uss id se User data me search kar ke name or email nikal lega

    if(!order){
        return next(new ErrorHander("Order not found",400));
    }

    res.status(200).json({
        success:true,
        order
    })

})

// get logged in user detail

exports.myOrder = catchAsyncError(async(req,res,next)=>{

    const orders = await Order.find({ user : req.user._id })  //data frame me sare order ko dhunde ga jo iss user ke id se match kare ga

    res.status(200).json({
        success:true,
        orders,
    })
})


//get all order (...ADMIN....)
exports.getAllOrders = catchAsyncError( async(req,res,next)=>{

    const orders= await Order.find();

    totalAmount = 0;

    orders.forEach((order)=>{
        totalAmount = totalAmount + order.totalPrice;
    })

    res.status(200).json({
        success:true,
        totalAmount,
        orders
    })

})


//update order (...ADMIN....)
exports.updateOrder = catchAsyncError( async(req,res,next)=>{

    console.log(req.params.id)
    
    const order = await Order.findById(req.params.id );  // yaha pe order ka array aye ga
    
    if(!order){
        return next(new ErrorHander("Order not found with this ID"),404)
    }


    if(order.orderStatus === "Delivered"){
        return next(new ErrorHander("You have already delivered order"),400);
    }

    if(req.body.status === "Shipped"){
        order.orderItems.forEach(async(o)=>{
            // console.log(o)
            await updateStock(o.product , o.quantity)
        })
    }

    // console.log("orderShipped")

    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now()
    }

await order.save({validateBforeSave: false})

    res.status(200).json({
        success:true,
    })

})

async function updateStock(id,quantity){
    const product = await Product.findById(id);

    product.stock=product.stock - quantity;
    product.save({validateBeforeSave:false})
}


//delete order (...ADMIN....)
exports.deleteOrders = catchAsyncError( async(req,res,next)=>{

    const order= await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHander("Order not found with this ID"),404)
    }

    order.deleteOne();

    res.status(200).json({
        success:true,
    })

})




