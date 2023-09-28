const express = require("express");
const tourController = require("./../controllers/tourController");
const authController = require("./../controllers/authController");
<<<<<<< HEAD
const reviewController = require("./../controllers/reviewController");
const reviewRouter = require('./reviewRoutes');
=======
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6

const router = express.Router();

// router.param("id", tourController.checkID);

<<<<<<< HEAD
router.use("/:tourId/reviews", reviewRouter);

=======
>>>>>>> cdd3cff3df3b8a456f524b376b96248a125fd9f6
// Aliasing
router
  .route("/top-5-cheapest")
  .get(tourController.aliasTopCheapestTour, tourController.getAllTours);

router.route("/tour-stats").get(tourController.getTourStats);

router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);

router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictedTo("admin", "tour-guide"),
    tourController.deleteTour
  );

module.exports = router;
