const sql = require("mssql");
const { getDatabaseConfig, getConnectionPool } = require("../../serverless/database");

const reviewSelect = `
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
`;

module.exports = async function reviewsHandler(req, res) {
    const path = String(req.query?.path || "").replace(/^\/+|\/+$/g, "");
    const method = String(req.method || "GET").toUpperCase();
    const revieweeMatch = path.match(/^reviewee\/(\d+)$/);
    const reviewerMatch = path.match(/^reviewer\/(\d+)$/);
    const idMatch = path.match(/^(\d+)$/);

    if (path && !revieweeMatch && !reviewerMatch && !idMatch) {
        return res.status(404).json({ message: "Review endpoint not found" });
    }

    const supported = (!path && ["GET", "POST"].includes(method)) ||
        (idMatch && ["GET", "PUT", "DELETE"].includes(method)) ||
        ((revieweeMatch || reviewerMatch) && method === "GET");
    if (!supported) {
        res.setHeader("Allow", path ? "GET, PUT, DELETE" : "GET, POST");
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    const config = getDatabaseConfig();
    if (!config) {
        return res.status(503).json({ success: false, message: "Database is not configured" });
    }

    try {
        const pool = await getConnectionPool(config);
        if (method === "GET" && !path) {
            const result = await pool.request().query(`${reviewSelect} ORDER BY ReviewID DESC`);
            return res.status(200).json(result.recordset);
        }

        if (revieweeMatch || reviewerMatch) {
            const field = revieweeMatch ? "RevieweeID" : "ReviewerID";
            const id = Number((revieweeMatch || reviewerMatch)[1]);
            const result = await pool.request()
                .input(field, sql.Int, id)
                .query(`${reviewSelect} WHERE ${field} = @${field} ORDER BY ReviewID DESC`);
            return res.status(200).json(result.recordset);
        }

        if (!path && method === "POST") {
            const review = req.body || {};
            const result = await pool.request()
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
                        RevieweeID, ReviewerID, ReviewType, ReviewBeginOn, ReviewCompletionOn,
                        Achievements, Skills, Goals, Comments, Rating, Status, CreatedDate
                    )
                    OUTPUT INSERTED.*
                    VALUES
                    (
                        @RevieweeID, @ReviewerID, @ReviewType, @ReviewBeginOn, @ReviewCompletionOn,
                        @Achievements, @Skills, @Goals, @Comments, @Rating, @Status, @CreatedDate
                    )
                `);
            return res.status(201).json({
                message: "Review Added Successfully",
                review: result.recordset[0]
            });
        }

        const reviewId = Number(idMatch[1]);
        if (method === "GET") {
            const result = await pool.request()
                .input("ReviewID", sql.Int, reviewId)
                .query(`${reviewSelect} WHERE ReviewID = @ReviewID`);
            return res.status(200).json(result.recordset[0]);
        }

        if (method === "PUT") {
            const review = req.body || {};
            const result = await pool.request()
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
                    SET ReviewType = @ReviewType,
                        ReviewBeginOn = @ReviewBeginOn,
                        ReviewCompletionOn = @ReviewCompletionOn,
                        Achievements = @Achievements,
                        Skills = @Skills,
                        Goals = @Goals,
                        Comments = @Comments,
                        Rating = @Rating,
                        Status = @Status
                    WHERE ReviewID = @ReviewID;
                    ${reviewSelect} WHERE ReviewID = @ReviewID
                `);
            return res.status(200).json({
                message: "Review Updated Successfully",
                review: result.recordset[0]
            });
        }

        await pool.request()
            .input("ReviewID", sql.Int, reviewId)
            .query("DELETE FROM Reviews WHERE ReviewID = @ReviewID");
        return res.status(200).json({ message: "Review Deleted Successfully" });
    } catch (error) {
        console.error("Reviews API failed:", error);
        return res.status(500).json({ message: error.message });
    }
};