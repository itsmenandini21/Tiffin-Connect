import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.ObjectId,
        ref: "User"
    },
    feedbackId : {
        type : mongoose.Schema.ObjectId,
        ref : "Feedback"
    },
    rating : {
        type : "Number",
        required : true
    },
    comment :{
        type : "String",
    },
    tiffinServiceId : {
        type : mongoose.Schema.ObjectId,
        ref : "TiffinService"
    }
},{timestamps : true})

export default mongoose.model("Review",reviewSchema);