import Review from "../models/Review.js";
import TiffinService from "../models/TiffinService.js";

const createReview = async (req,res) =>{
    try{
        const newReview = await Review.create({
            userId : req.user._id,
            feedbackId : req.body.feedbackId,
            tiffinServiceId: req.body.tiffinServiceId,
            comment:req.body.comment,
            rating:req.body.rating

        })
        if(! newReview) return res.status(400).json({message : "Can't create review"});
        return res.status(200).json({message : "Review created successfully",newReview});


    }
    catch(err){
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });

    }
}

const getAllReviewsOfTS = async (req, res) => {
    try {
        const tiffinServiceId = req.params.id; 
        const allReviews = await Review.find({ tiffinServiceId })
            .populate("feedbackId", "question createdAt") 
            .populate("userId", "name") 
            .sort({ createdAt: -1 }); 

        const grouped = allReviews.reduce((acc, review) => {
            const campaign = review.feedbackId;
            if (!campaign) return acc; 
            const campaignId = campaign._id.toString();

            if (!acc[campaignId]) {
                acc[campaignId] = {
                    campaignId: campaignId,
                    question: campaign.question,
                    campaignDate: campaign.createdAt,
                    reviews: []
                };
            }

            acc[campaignId].reviews.push({
                reviewId: review._id,
                userName: review.userId?.name || "Anonymous User",
                rating: review.rating,
                comment: review.comment || "",
                date: review.createdAt
            });

            return acc;
        }, {});
        const responseData = Object.values(grouped);

        return res.status(200).json(responseData);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}

const getPublicReviewsOfTS = async (req, res) => {
    try {
        const tiffinServiceId = req.params.id; 
        const allReviews = await Review.find({ tiffinServiceId })
            .populate("feedbackId", "question") 
            .populate("userId", "name") 
            .sort({ createdAt: -1 }); 

        const formattedReviews = allReviews.map(review => ({
            reviewId: review._id,
            userName: review.userId?.name || "Anonymous User",
            rating: review.rating,
            comment: review.comment || "",
            question: review.feedbackId?.question || "General Feedback",
            date: review.createdAt
        }));

        return res.status(200).json(formattedReviews);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}

const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId).populate("tiffinServiceId");
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        
        if (!review.tiffinServiceId) {
            return res.status(400).json({ message: "Review is not associated with a tiffin service" });
        }
        
        if (review.tiffinServiceId.providerId.toString() !== req.provider._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this review" });
        }
        
        await Review.findByIdAndDelete(reviewId);
        return res.status(200).json({ message: "Review deleted successfully" });
    } catch (err) {
        console.error("Delete review error:", err);
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}

export { createReview, getAllReviewsOfTS, getPublicReviewsOfTS, deleteReview };