import Subscription from "../models/Subscription.js"
import user from "../models/user.js"
import TiffinService from "../models/TiffinService.js"

const getMySubscriptions = async (req,res) =>{
    try{
        const subscriptions = await Subscription.find({userId:req.user._id}).populate("tiffinServiceId");
        return res.status(200).json(subscriptions);
    }
    catch(err){
        return res.status(500).json({message : "Internal Server Error"});
    }
}

const createSubscription = async(req,res)=>{
    try{
        const existingSubscription= await Subscription.findOne({userId:req.user._id,tiffinServiceId:req.body.tiffinServiceId});
        if(existingSubscription){
            return res.status(400).json({message:"Cannot subscribe"});
        }
        const plan = req.body.planType;
        const stDate = new Date();
        const daysToAdd = plan == "weekly" ? 7 : (plan == "yearly") ? 365 : 30;
        const originalEndDt = new Date(stDate);
        originalEndDt.setDate(originalEndDt.getDate() + daysToAdd);
        const newSubscription = await Subscription.create({
            userId:req.user._id,
            tiffinServiceId:req.body.tiffinServiceId,
            planType:req.body.planType,
            startDate:stDate,
            originalEndDate:originalEndDt
        })
        return res.status(200).json(newSubscription);
    }
     catch(err){
        return res.status(500).json({message:"Internal Server error"});
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
        return res.status(500).json({message:"Internal Server Error"});
    }
}

const cancelSubscription = async (req,res)=>{
    try{
        const subscriptionId=req.params.id;
        const deleteSubscription = await Subscription.findByIdAndDelete(subscriptionId);
        return res.status(200).json({message:"Successfully deleted",deleteSubscription});
    }
    catch(err){
        return res.status(500).json({message:"Internal server error"});
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
        return res.status(500).json({message :"Internal server error"});
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
        return res.status(500).json({message:"Internal Server Error"});
    }
}

export {getMySubscriptions,createSubscription,pauseSubscription,cancelSubscription,toggleSubscripton,updateInstruction};




