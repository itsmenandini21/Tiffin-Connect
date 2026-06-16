import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    providerId : {
        type: mongoose.Schema.ObjectId,
        ref : "User"
    },
    tiffinServiceId : {
        type : mongoose.Schema.ObjectId,
        ref : "TiffinService"
    },
    question : {
        type : "String",
        required : true
    },
    isTemplate : {
        type : "Boolean",
        default : false
    },
    expiresAt : {
        type : Date,
        required : function() { return !this.isTemplate; } // Only required if not a template
    },
    intervalDays :{
        type : "Number",
        default : 0
    }
},{timestamps : true})

export default mongoose.model("Feedback",feedbackSchema);
