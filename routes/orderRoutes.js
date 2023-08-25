const express = require("express");
const router = express.Router();

const { createNewOrder, getSingleOrder, myOrder, getAllOrders, updateOrder, deleteOrders } =require("../controllers/orderController.js");
const { isAuthenticatedUser , authorisedRoles } =require("../middleWare/auth.js")

router.route("/order/new").post( isAuthenticatedUser, createNewOrder);
router.route("/order/:id").get( isAuthenticatedUser, authorisedRoles("admin"), getSingleOrder); // iss me admin kisi user ka order dhekhe ga
router.route("/orders/me").get( isAuthenticatedUser, myOrder); // iss se lounda apne aap ka sara order dhekhe ga

router.route("/admin/orders").get( isAuthenticatedUser, authorisedRoles("admin"), getAllOrders );
router.route("/admin/update/:id").put( isAuthenticatedUser, authorisedRoles("admin"), updateOrder );
router.route("/admin/delete/orders/:id").delete( isAuthenticatedUser, authorisedRoles("admin"), deleteOrders );




module.exports = router;