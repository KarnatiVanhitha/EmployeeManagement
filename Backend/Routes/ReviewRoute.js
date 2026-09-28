const express = require("express");

const router = express.Router();

const reviewController = require("../Controllers/ReviewController");

router.get("/", reviewController.getReviews);
router.get("/:id", reviewController.getReviewById);
router.get("/reviewee/:id", reviewController.getReviewsByReviewee);
router.get("/reviewer/:id", reviewController.getReviewsByReviewer);
router.post("/", reviewController.addReview);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
