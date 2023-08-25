const express = require("express");

const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getAllReviews, deleteReviews , getAdminProducts} = require("../controllers/productController.js");
const { isAuthenticatedUser, authorisedRoles } = require("../middleWare/auth.js");
// const upload = require("../middleWare/multer.js")

const router=express.Router();

router.route("/products").get( getAllProducts );
router.route("/admin/products").get( isAuthenticatedUser, authorisedRoles("admin"),getAdminProducts )
router.route("/admin/product/new").post(isAuthenticatedUser, authorisedRoles("admin"), createProduct);
router.route("/admin/product/:id").put( isAuthenticatedUser,authorisedRoles("admin"), updateProduct);
router.route("/admin/deleteProduct/:id").delete( isAuthenticatedUser,authorisedRoles("admin"), deleteProduct);

router.route("/product/:id").get(getProductDetails);
router.route("/reviews").put( isAuthenticatedUser, createProductReview );
router.route("/reviews").get( isAuthenticatedUser, getAllReviews );
router.route("/reviews").delete( isAuthenticatedUser, deleteReviews );

module.exports = router;






