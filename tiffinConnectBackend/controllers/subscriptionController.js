import Subscription from "../models/Subscription.js"
import user from "../models/user.js"
import TiffinService from "../models/TiffinService.js"

const getMySubscriptions = async (req,res) =>{
    try{
        const subscriptions = await Subscription.find({userId:req.user._id}).populate("tiffinServiceId");
        
        // Filter out subscriptions where the associated tiffin service was deleted
        const validSubscriptions = subscriptions.filter(sub => sub.tiffinServiceId !== null);
        
        return res.status(200).json(validSubscriptions);
    }
    catch(err){
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}

const createSubscription = async(req,res)=>{
    try{
        const existingSubscription = await Subscription.findOne({ 
            userId: req.user._id, 
            tiffinServiceId: req.body.tiffinServiceId,
            status: { $in: ["active", "paused"] }
        });
        if (existingSubscription) {
            return res.status(400).json({ message: "Cannot subscribe - already have an active subscription" });
        }
        const plan = req.body.planType;
        let stDate = new Date();
        
        // Check service timings to see if we missed today's cutoff
        const service = await TiffinService.findById(req.body.tiffinServiceId);
        if (service && service.startTime) {
            const [startHour, startMinute] = service.startTime.split(':').map(Number);
            const currentHour = stDate.getHours();
            const currentMinute = stDate.getMinutes();
            
            // If current time is past the start time of the service, start subscription from tomorrow
            if (currentHour > startHour || (currentHour === startHour && currentMinute >= startMinute)) {
                stDate.setDate(stDate.getDate() + 1);
            }
        }
        
        // Reset time to start of day for clean calendar rendering
        stDate.setHours(0, 0, 0, 0);
        
        // New Validity Rules
        let totalMeals = 0;
        let validityDays = 0;
        if (plan === "weekly") {
            totalMeals = 7;
            validityDays = 10;
        } else if (plan === "monthly") {
            totalMeals = 30;
            validityDays = 40;
        } else if (plan === "yearly") {
            totalMeals = 365;
            validityDays = 400;
        }

        const maxValidityDt = new Date(stDate);
        maxValidityDt.setDate(maxValidityDt.getDate() + validityDays);

        // Legacy dates (kept for backward compatibility with older UI)
        const daysToAdd = plan == "weekly" ? 7 : (plan == "yearly") ? 365 : 30;
        const originalEndDt = new Date(stDate);
        originalEndDt.setDate(originalEndDt.getDate() + daysToAdd);
        
        const newSubscription = await Subscription.create({
            userId:req.user._id,
            tiffinServiceId:req.body.tiffinServiceId,
            planType:req.body.planType,
            startDate:stDate,
            originalEndDate:originalEndDt,
            totalMeals: totalMeals,
            mealsRemaining: totalMeals,
            maxValidityDate: maxValidityDt
        })
        return res.status(200).json(newSubscription);
    }
     catch(err){
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
     }
}

//PATCH request
const pauseSubscription =async(req,res)=>{
    try{
        const subscriptionId=req.params.id;
        const reStartDate = new Date(Date.now() + (req.body.pauseDurationDays || 7) * 24 * 60 * 60 * 1000)

        const updatedSubscription=await Subscription.findByIdAndUpdate(subscriptionId,{
            $set:{
                status:"paused",
                resumeDate:reStartDate
            }
        },{new : true});
        return res.status(200).json({message:"Subscription updated",updatedSubscription});
    }
    catch(err){
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}

const cancelSubscription = async (req,res)=>{
    try{
        const subscriptionId=req.params.id;
        const deleteSubscription = await Subscription.findByIdAndDelete(subscriptionId);
        return res.status(200).json({message:"Successfully deleted",deleteSubscription});
    }
    catch(err){
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}

const toggleSubscripton = async(req,res) =>{
    try{
        const subscription = await Subscription.findById(req.params.id);
        if(!subscription){
           return res.status(400).json({message : "Subscription doesn't exists"});
        }
        const date = req.body.date;
        if(subscription.skippedDates.includes(date)){
           subscription.skippedDates = subscription.skippedDates.filter(item => item !== date );
        }
        else{
           subscription.skippedDates.push(date);
        }
        const extendEndDt = new Date(subscription.originalEndDate);
        extendEndDt.setDate(extendEndDt.getDate() + subscription.skippedDates.length);
        subscription.extendedEndDate = extendEndDt;
        await subscription.save();
        return res.status(200).json({message : "Updated successfully",subscription});
    }
    catch(err){
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}

const updateInstruction = async (req,res) =>{
    try{
        const subscriptionId = req.params.id;
        const noteText = req.body.specialInstruction;
        const subscription = await Subscription.findById(subscriptionId);
        if(!subscription) return res.status(400).json({message:"No subscription found"});
        subscription.specialInstruction = noteText;
        await subscription.save();
        return res.status(200).json({message:"Updated successfully",subscription});

    }
    catch(err){
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}
const updateSingleDeliveryStatus = async (req,res) =>{
    try{
        const subscriptionId = req.params.id;
        const status = req.body.status;
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        subscription.deliveryStatus = status;
        subscription.deliveryStatusUpdatedAt = new Date();
        await subscription.save();
        return res.status(200).json({message : "Status updated", subscription});
    }
    catch(err){
        console.error("updateSingleDeliveryStatus error:", err);
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}

const updateStatusOfAll = async (req,res) =>{
    try{
        const tiffinServiceId = req.params.id;
        const status = req.body.status;
        
        const query = { tiffinServiceId: tiffinServiceId, status: "active" };
        if (status === "dispatched") {
            query.deliveryStatus = "pending";
        }
        
        await Subscription.updateMany(
            query,
            { 
                $set: { 
                    deliveryStatus: status,
                    deliveryStatusUpdatedAt: new Date()
                } 
            }
        );
        return res.status(200).json({message : "updated successfully"});
    }
    catch(err){
        console.error("updateStatusOfAll error:", err);
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}

const getTodayStats = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0,0,0,0);
        const end = new Date();
        end.setHours(23,59,59,999);
        
        const services = await TiffinService.find({ providerId: req.provider._id });
        const stats = await Promise.all(services.map(async svc => {
            const count = await Subscription.countDocuments({
                tiffinServiceId: svc._id,
                createdAt: { $gte: start, $lte: end }
            });
            return { serviceId: svc._id, title: svc.title, subscribedTodayCount: count };
        }));
        
        return res.status(200).json(stats);
    } catch (err) {
        console.error("getTodayStats error:", err);
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
};

const confirmDelivery = async (req, res) => {
    try {
        const subscriptionId = req.params.id;
        const subscription = await Subscription.findById(subscriptionId);
        
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }
        
        // Ensure user owns this subscription
        if (subscription.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        subscription.deliveryStatus = "delivered";
        subscription.deliveryStatusUpdatedAt = new Date();
        await subscription.save();
        
        return res.status(200).json({ message: "Delivery confirmed", subscription });
    } catch (err) {
        console.error("confirmDelivery error:", err);
        return res.status(500).json({ message: "Failed to confirm delivery" });
    }
};

export {
    getMySubscriptions,
    createSubscription,
    pauseSubscription,
    cancelSubscription,
    toggleSubscripton,
    updateInstruction,
    updateSingleDeliveryStatus,
    updateStatusOfAll,
    getTodayStats,
    confirmDelivery
};




