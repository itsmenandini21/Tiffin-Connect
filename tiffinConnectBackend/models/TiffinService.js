import mongoose from "mongoose";
const tiffinServiceSchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Links this service back to the provider who created it
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    shift: {
        type: String,
        enum: ["Lunch", "Dinner", "Breakfast", "All Day"],
        required: true
    },
    startTime: {
        type: String,
        required: true,
        default: "12:00"
    },
    endTime: {
        type: String,
        required: true,
        default: "14:00"
    },
    foodType: {
        type: String,
        enum: ["Veg", "Non-Veg", "Vegan", "Jain"],
        required: true
    },
    pricePerMeal: {
        type: Number,
        required: true
    },
    coverImage: {
        type: String,
        default: ""
    },
    menuImages: {
        type: [String],
        default: []
    },
    weeklyMenu: {
        monday: { type: String, default: "" },
        tuesday: { type: String, default: "" },
        wednesday: { type: String, default: "" },
        thursday: { type: String, default: "" },
        friday: { type: String, default: "" },
        saturday: { type: String, default: "" },
        sunday: { type: String, default: "" }
    },
    isAvailable: {
        type: Boolean,
        default: true // Provider can toggle this to stop accepting new orders for this specific service
    },
    isActive: {
        type: Boolean,
        default: true // Admin can toggle this to suspend the service for violating guidelines
    }
}, { timestamps: true });

export default mongoose.model("TiffinService", tiffinServiceSchema);
