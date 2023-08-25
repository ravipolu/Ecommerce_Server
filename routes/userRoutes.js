
const express = require("express");

const router = express.Router();

const { registerUser, loginUser, logoutUser, forgetPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getSingleUserDetails, getAllUser, deleteProfile, updateProfileADMIN ,checkToken} = require("../controllers/userController.js");
const { isAuthenticatedUser, authorisedRoles } = require("../middleWare/auth.js");



router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forget").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/change/password").put(isAuthenticatedUser, updatePassword );
router.route("/update/profile").put(isAuthenticatedUser, updateProfile );
router.route("/admin/users").get(isAuthenticatedUser, authorisedRoles("admin"), getAllUser );
router.route("/admin/user/detail/:id").get(isAuthenticatedUser, authorisedRoles("admin"), getSingleUserDetails );

router.route("/admin/update/role/:id").put(isAuthenticatedUser, authorisedRoles("admin"), updateProfileADMIN );
router.route("/admin/delete/user/:id").delete(isAuthenticatedUser, authorisedRoles("admin"), deleteProfile );


module.exports = router;