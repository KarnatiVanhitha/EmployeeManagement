const reviewModel = require("../Models/ReviewModel");

async function addReview(req, res) {
    try {
        const review = await reviewModel.addReview(req.body);
        res.status(201).json({
            message: "Review Added Successfully",
            review
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getReviews(req, res) {
    try {
        const reviews = await reviewModel.getReviews();
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getReviewById(req, res) {
    try {
        const reviewId = Number(req.params.id);
        const review = await reviewModel.getReviewById(reviewId);
        res.status(200).json(review);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getReviewsByReviewee(req, res) {
    try {
        const revieweeId = Number(req.params.id);
        const reviews = await reviewModel.getReviewsByReviewee(revieweeId);
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function getReviewsByReviewer(req, res) {
    try {
        const reviewerId = Number(req.params.id);
        const reviews = await reviewModel.getReviewsByReviewer(reviewerId);
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function updateReview(req, res) {
    try {
        const reviewId = Number(req.params.id);
        const review = await reviewModel.updateReview(reviewId, req.body);
        res.status(200).json({
            message: "Review Updated Successfully",
            review
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

async function deleteReview(req, res) {
    try {
        const reviewId = Number(req.params.id);
        await reviewModel.deleteReview(reviewId);
        res.status(200).json({
            message: "Review Deleted Successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

module.exports = {
    addReview,
    getReviews,
    getReviewById,
    getReviewsByReviewee,
    getReviewsByReviewer,
    updateReview,
    deleteReview
};
