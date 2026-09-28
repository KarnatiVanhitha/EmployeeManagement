const { sql } = require("../config/db");

async function addReview(review) {
    const result = await new sql.Request()
        .input("RevieweeID", sql.Int, review.RevieweeID)
        .input("ReviewerID", sql.Int, review.ReviewerID)
        .input("ReviewType", sql.NVarChar(100), review.ReviewType)
        .input("ReviewBeginOn", sql.Date, review.ReviewBeginOn)
        .input("ReviewCompletionOn", sql.Date, review.ReviewCompletionOn)
        .input("Achievements", sql.NVarChar(sql.MAX), review.Achievements)
        .input("Skills", sql.NVarChar(sql.MAX), review.Skills)
        .input("Goals", sql.NVarChar(sql.MAX), review.Goals)
        .input("Comments", sql.NVarChar(sql.MAX), review.Comments)
        .input("Rating", sql.Int, review.Rating || 0)
        .input("Status", sql.NVarChar(50), review.Status || "Pending")
        .input("CreatedDate", sql.DateTime, new Date())
        .query(`
            INSERT INTO Reviews
            (
                RevieweeID,
                ReviewerID,
                ReviewType,
                ReviewBeginOn,
                ReviewCompletionOn,
                Achievements,
                Skills,
                Goals,
                Comments,
                Rating,
                Status,
                CreatedDate
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @RevieweeID,
                @ReviewerID,
                @ReviewType,
                @ReviewBeginOn,
                @ReviewCompletionOn,
                @Achievements,
                @Skills,
                @Goals,
                @Comments,
                @Rating,
                @Status,
                @CreatedDate
            )
        `);

    return result.recordset[0];
}

async function getReviews() {
    const result = await sql.query`
        SELECT
            ReviewID AS reviewId,
            RevieweeID AS revieweeId,
            ReviewerID AS reviewerId,
            ReviewType AS reviewType,
            ReviewBeginOn AS reviewBeginOn,
            ReviewCompletionOn AS reviewCompletionOn,
            Achievements AS achievements,
            Skills AS skills,
            Goals AS goals,
            Comments AS comments,
            Rating AS rating,
            Status AS status,
            CreatedDate AS createdDate
        FROM Reviews
        ORDER BY ReviewID DESC
    `;

    return result.recordset;
}

async function getReviewById(reviewId) {
    const result = await new sql.Request()
        .input("ReviewID", sql.Int, reviewId)
        .query(`
            SELECT
                ReviewID AS reviewId,
                RevieweeID AS revieweeId,
                ReviewerID AS reviewerId,
                ReviewType AS reviewType,
                ReviewBeginOn AS reviewBeginOn,
                ReviewCompletionOn AS reviewCompletionOn,
                Achievements AS achievements,
                Skills AS skills,
                Goals AS goals,
                Comments AS comments,
                Rating AS rating,
                Status AS status,
                CreatedDate AS createdDate
            FROM Reviews
            WHERE ReviewID = @ReviewID
        `);

    return result.recordset[0];
}

async function getReviewsByReviewee(revieweeId) {
    const result = await new sql.Request()
        .input("RevieweeID", sql.Int, revieweeId)
        .query(`
            SELECT
                ReviewID AS reviewId,
                RevieweeID AS revieweeId,
                ReviewerID AS reviewerId,
                ReviewType AS reviewType,
                ReviewBeginOn AS reviewBeginOn,
                ReviewCompletionOn AS reviewCompletionOn,
                Achievements AS achievements,
                Skills AS skills,
                Goals AS goals,
                Comments AS comments,
                Rating AS rating,
                Status AS status,
                CreatedDate AS createdDate
            FROM Reviews
            WHERE RevieweeID = @RevieweeID
            ORDER BY ReviewID DESC
        `);

    return result.recordset;
}

async function getReviewsByReviewer(reviewerId) {
    const result = await new sql.Request()
        .input("ReviewerID", sql.Int, reviewerId)
        .query(`
            SELECT
                ReviewID AS reviewId,
                RevieweeID AS revieweeId,
                ReviewerID AS reviewerId,
                ReviewType AS reviewType,
                ReviewBeginOn AS reviewBeginOn,
                ReviewCompletionOn AS reviewCompletionOn,
                Achievements AS achievements,
                Skills AS skills,
                Goals AS goals,
                Comments AS comments,
                Rating AS rating,
                Status AS status,
                CreatedDate AS createdDate
            FROM Reviews
            WHERE ReviewerID = @ReviewerID
            ORDER BY ReviewID DESC
        `);

    return result.recordset;
}

async function updateReview(reviewId, review) {
    const result = await new sql.Request()
        .input("ReviewID", sql.Int, reviewId)
        .input("ReviewType", sql.NVarChar(100), review.ReviewType)
        .input("ReviewBeginOn", sql.Date, review.ReviewBeginOn)
        .input("ReviewCompletionOn", sql.Date, review.ReviewCompletionOn)
        .input("Achievements", sql.NVarChar(sql.MAX), review.Achievements)
        .input("Skills", sql.NVarChar(sql.MAX), review.Skills)
        .input("Goals", sql.NVarChar(sql.MAX), review.Goals)
        .input("Comments", sql.NVarChar(sql.MAX), review.Comments)
        .input("Rating", sql.Int, review.Rating)
        .input("Status", sql.NVarChar(50), review.Status)
        .query(`
            UPDATE Reviews
            SET
                ReviewType = @ReviewType,
                ReviewBeginOn = @ReviewBeginOn,
                ReviewCompletionOn = @ReviewCompletionOn,
                Achievements = @Achievements,
                Skills = @Skills,
                Goals = @Goals,
                Comments = @Comments,
                Rating = @Rating,
                Status = @Status
            WHERE ReviewID = @ReviewID
            SELECT * FROM Reviews WHERE ReviewID = @ReviewID
        `);

    return result.recordset[0];
}

async function deleteReview(reviewId) {
    const result = await new sql.Request()
        .input("ReviewID", sql.Int, reviewId)
        .query(`
            DELETE FROM Reviews WHERE ReviewID = @ReviewID
        `);

    return result;
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
