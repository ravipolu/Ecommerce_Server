
const Product = require("../models/productModel.js");
const ErrorHander = require("../utils/errorHander.js");
const catchAsyncError = require("../middleWare/catchAsyncError.js");
const ApiFeatures = require("../utils/apifeature.js");
const cloudinary = require("cloudinary");
const { getDataUri } = require("../utils/dataURI.js");



// create Product -- by admin

exports.createProduct = catchAsyncError(async (req, res, next) => {

    let imageList = [];

    for(let j=0;j<req.body.images.length ; j++){
        imageList.push(req.body.images[j])
    }

    let imagesLinks = [];
        for (let i = 0; i < imageList.length; i++) {
            const result = await cloudinary.v2.uploader.upload_large(imageList[i], {
                folder: "products", 
                width: 300,
                crop: 'scale'
            })
            if(result){
            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            })}
        }

    req.body.user = req.user._id;
    req.body.images = imagesLinks;

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    })
})


//get all product

exports.getAllProducts = catchAsyncError(async (req, res, next) => {


    // return next(new ErrorHander("this is my temp error",500))

    const resultPerPage = 8;

    const productsCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        // .pagination(resultPerPage);

    

    //filtered paginaton matlab ki avi price filter lagane ke baad bhi pagination dhikaha raha hai jab ki product 5 he hai 

    let products = await apiFeature.query;

    let filteredProductsCount = products.length;
    
    apiFeature.pagination(resultPerPage);

    products = await apiFeature.query.clone();

    // const products = await Product.find();         //...... issko comment kye hai kyu ki upar ek baar call tho kar he dye hai de baar kare ge tho bhasar mach jaye ga
    // const productsCount = products.length;

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount
    })
})



// get All Productss (ADMIN)
exports.getAdminProducts = catchAsyncError(async (req, res, next) => {

    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    })
})



//update products -- only by admin

exports.updateProduct = catchAsyncError(async (req, res, next) => {


    let product = await Product.findById(req.params.id);
   

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }
    

    let imageList = [];

    // for(let j=0;j<req.body.images.length ; j++){
    //     imageList.push(req.body.images[j])
    // }

    if(typeof req.body.images === 'string'){
        imageList.push(req.body.images);
    }else{
        images = req.body.images;
    }

    
    if (imageList !== undefined) {
        for (let i = 0; i < product.images.length; i++) {
      
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }


        let imagesLinks = [];
        for (let i = 0; i < imageList.length; i++) {
         
            const result = await cloudinary.v2.uploader.upload(imageList[i], {
                folder: "products",
                width: 300,
                crop: 'scale'
            })

            if(result){
            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            })}
        }

        req.body.images = imagesLinks;

    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        product
    })
})




// Delete Product --Admin

exports.deleteProduct = catchAsyncError(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404))
    }

    //Deleting product image form cloudinary after gettimg image

    for (let i = 0; i < product.images.length; i++) {

        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    })
})


// get Product details 

exports.getProductDetails = catchAsyncError(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    //agar product na mile
    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    // agar product mil gya hai tho sidha send kardo
    res.status(200).json({
        success: true,
        product
    })
})


//create product review or update review

exports.createProductReview = catchAsyncError(async (req, res, next) => {


    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating,
        comment,

    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id.toString())
    if (isReviewed) {
        product.reviews.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment);
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    let avg = 0;
    product.reviews.forEach(rev => {
        avg = avg + rev.rating
    })

    product.ratings = avg / product.numOfReviews;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    })

})


// get all reviews of a Product

exports.getAllReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    })
})

// for delete reviews

exports.deleteReviews = catchAsyncError(async (req, res, next) => {

    const product = await Product.findById(req.query.productId); // product khoj lenge product id se

    if (!product) {
        return next(new ErrorHander("Product not found", 404));
    }

    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString()) // yaha pe review ka id hai ye fliter hai jo wo sare id pe loop lagaye ga jo false uss ko hata dega baki san ko rakh lega

    let avg = 0;
    reviews.forEach(rev => {
        avg = avg + rev.rating
    })

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    )

    res.status(200).json({
        success: true,
    })
})


