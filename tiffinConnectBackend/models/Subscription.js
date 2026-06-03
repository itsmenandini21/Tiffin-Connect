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
        enum:["active","cancelled","paused"],
        default:"active"
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
