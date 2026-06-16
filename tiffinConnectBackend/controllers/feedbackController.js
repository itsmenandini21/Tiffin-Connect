import Feedback from "../models/Feedback.js";
import Review from "../models/Review.js";
import Subscription from "../models/Subscription.js";
 const createFeedback = async (req, res) =>{
    try{
        const newFeedback = await Feedback.create({
            providerId : req.provider._id, // Fixed: use req.provider instead of req.user
            tiffinServiceId : req.body.tiffinServiceId, // Corrected spelling
            question: req.body.question,
            expiresAt : req.body.expiresAt,
            isTemplate : req.body.isTemplate,
            intervalDays: req.body.intervalDays || 0 // Added intervalDays
        });
        if(! newFeedback) return res.status(400).json({message : "Can't create feedback"});
        return res.status(200).json({message : "Feedback created successfully",newFeedback});

    }
    catch(err){
        console.error("Error in createFeedback:", err);
        return res.status(500).json({message : "Internal Server Error"});
    }
 }


 const getFeedbackTemplates = async (req,res) =>{
     try{
         // Fixed: only fetch templates belonging to the logged-in provider
         const templates = await Feedback.find({ providerId: req.provider._id, isTemplate: true });
         res.status(200).json(templates);
     }
     catch(err){
         console.error("Error in getFeedbackTemplates:", err);
         res.status(500).json({message :"Internal Server Error"})
     }
 }

 const deleteTemplates = async (req,res) =>{
    try{
        const id = req.params.id;
        // Scope deletion to the logged-in provider's ID to prevent unauthorized deletes
        const deletedTemplate = await Feedback.findOneAndDelete({ _id: id, providerId: req.provider._id });
        if(!deletedTemplate) return res.status(404).json({message : "Template not found"});
        return res.status(200).json({message: "Template deleted successfully", deletedTemplate});

    }
    catch(err){
        console.error("Error in deleteTemplates:", err);
        return res.status(500).json({message : "Internal Server Error"});
    }
 }

 const getActiveFeedBackForUser = async (req, res) => {
    try {
        // 1. Fetch user's active subscriptions
        const subscriptions = await Subscription.find({ userId: req.user._id, status: "active" });
        if (subscriptions.length === 0) {
            return res.status(200).json([]);
        }

        // 2. Extract tiffin service IDs
        const tiffinServiceIds = subscriptions.map(item => item.tiffinServiceId);

        // 3. Find all active feedback campaigns for these services (that haven't expired)
        const activeFeedbacks = await Feedback.find({
            tiffinServiceId: { $in: tiffinServiceIds },
            expiresAt: { $gt: new Date() }
        });

        if (activeFeedbacks.length === 0) {
            return res.status(200).json([]);
        }

        // 4. Fetch the user's reviews for these active campaigns
        const feedbackIds = activeFeedbacks.map(f => f._id);
        const userReviews = await Review.find({
            userId: req.user._id,
            feedbackId: { $in: feedbackIds }
        }).sort({ createdAt: -1 }); // Sorted by latest review first

        // 5. Filter campaigns based on whether they need to pop up
        const feedbacksToShow = [];

        for (const feedback of activeFeedbacks) {
            // Find all reviews submitted by this user for this specific campaign
            const reviewsForCampaign = userReviews.filter(
                r => r.feedbackId.toString() === feedback._id.toString()
            );

            if (reviewsForCampaign.length === 0) {
                // Case A: User has never responded to this campaign -> Show it!
                feedbacksToShow.push(feedback);
            } else {
                // Case B: User has responded before -> Check if it is recurring
                if (feedback.intervalDays > 0) {
                    const latestReview = reviewsForCampaign[0]; // Most recent review
                    const intervalMs = feedback.intervalDays * 24 * 60 * 60 * 1000; // Days to ms
                    const timeSinceLastReview = Date.now() - new Date(latestReview.createdAt).getTime();

                    // If the time elapsed since the last review is greater than or equal to the interval
                    if (timeSinceLastReview >= intervalMs) {
                        feedbacksToShow.push(feedback);
                    }
                }
            }
        }

        return res.status(200).json(feedbacksToShow);
    }
    catch (err) {
        console.error("Error in getActiveFeedBackForUser:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export { createFeedback, getFeedbackTemplates, getActiveFeedBackForUser, deleteTemplates };