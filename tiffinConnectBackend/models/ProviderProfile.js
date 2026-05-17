import mongoose from "mongoose";

const providerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    fssaiCertificate: {
        type: String, // Will store the Cloudinary image URL
        required: true
    },
    kitchenPhotos: [{
        type: String // Array of Cloudinary image URLs
    }],
    isVerified: {
        type: Boolean,
        default: false // Set to false by default, Admin turns it to true
    },
    bankDetails: {
        accountNumber: { type: String },
        ifscCode: { type: String }
    }
}, { timestamps: true });

export default mongoose.model("ProviderProfile", providerProfileSchema);
