import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    tiffinServiceId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"TiffinService",
        required:true
    },
    planType:{
        type:String,
        required:true,
        enum:["weekly","monthly","yearly"]
    },
    status:{
        type:String,
        enum:["active","cancelled","paused","completed","expired"],
        default:"active"
    },
    deliveryStatus:{
        type:String,
        enum:["pending","dispatched","delivered"],
        default:"pending"
    },
    deliveryStatusUpdatedAt:{
        type:Date,
        default:Date.now
    },
    startDate:{
        type:Date,
        default:null
    },
    originalEndDate:{
        type:Date,
        default:null
    },
    extendedEndDate:{
        type:Date,
        default:null
    },
    totalMeals: {
        type: Number,
        default: 0
    },
    mealsRemaining: {
        type: Number,
        default: 0
    },
    maxValidityDate: {
        type: Date,
        default: null
    },
    skippedDates:{
        type: [String],
        default:[]
    },
    specialInstruction:{
        type:String,
        default:""
    }
},{timestamps:true})

export default mongoose.model("Subscription",subscriptionSchema);
