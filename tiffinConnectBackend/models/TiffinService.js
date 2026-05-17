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
    foodType: {
        type: String,
        enum: ["Veg", "Non-Veg", "Vegan", "Jain"],
        required: true
    },
    pricePerMeal: {
        type: Number,
        required: true
    },
    monthlyPrice: {
        type: Number,
        required: true
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
    }
}, { timestamps: true });

export default mongoose.model("TiffinService", tiffinServiceSchema);
