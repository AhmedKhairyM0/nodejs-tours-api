const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
<<<<<<< HEAD
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch("/updateMyPassword", authController.protect, authController.updateMyPassword);
router.patch("/updateMe", authController.protect, userController.updateMe);
router.delete("/deleteMe", authController.protect, userController.deleteMe);
=======
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6

// For Admin
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser)
  .delete(userController.deleteAllUser); // how to backup

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
<<<<<<< HEAD
  .delete(authController.protect, authController.restrictedTo("admin"), userController.deleteUser);
=======
  .delete(userController.deleteUser);
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6

module.exports = router;
