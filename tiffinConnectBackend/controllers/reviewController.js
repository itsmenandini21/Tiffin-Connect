import Review from "../models/Review.js";

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
        return res.status(500).json({message : "Internal Server Error"});

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
        return res.status(500).json({ message: "Internal Server error" });
    }
}

export {createReview,getAllReviewsOfTS};