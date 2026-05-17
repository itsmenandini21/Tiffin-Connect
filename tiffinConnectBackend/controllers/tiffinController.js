import TiffinService from "../models/TiffinService.js";
import ProviderProfile from "../models/ProviderProfile.js";
const addMenu = async (req, res) => {
    try {
        const newMenu = await TiffinService.create({
            providerId: req.provider._id,
            title: req.body.title,
            description: req.body.description,
            shift: req.body.shift,
            foodType: req.body.foodType,
            pricePerMeal: req.body.pricePerMeal,
            monthlyPrice: req.body.monthlyPrice,
            weeklyMenu: req.body.weeklyMenu
        });
        
        // Always send a response back!
        res.status(201).json({ message: "Menu added successfully", menu: newMenu });
    } catch (err) {
        console.error("Error adding menu:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const getMenu = async (req, res) => {
    try {
        const menu = await TiffinService.find({ providerId: req.provider._id });
        res.status(200).json(menu);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const updateMenu = async (req, res) => {
    try {
        const menuId = req.params.id;
        
        // 1. Find the menu using providerId (not provider_id)
        const menu = await TiffinService.findOne({ _id: menuId, providerId: req.provider._id });
        
        if (!menu) {
            // Fixed typo: res.json instead of res.josn
            return res.status(404).json({ message: "Menu not found or unauthorized" });
        }
        
        // 2. Use findByIdAndUpdate to apply changes and get the updated document back
        const updatedMenu = await TiffinService.findByIdAndUpdate(
            menuId,
            { $set: req.body },
            { new: true } // Returns the modified document
        );
        
        res.status(200).json({ message: "Menu updated successfully", updatedMenu });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteMenu = async (req, res) => {
    try {
        const menuId = req.params.id;
        
        // Use findOneAndDelete to ensure the menu belongs to the provider before deleting
        const deletedMenu = await TiffinService.findOneAndDelete({ 
            _id: menuId, 
            providerId: req.provider._id 
        });
        
        if (!deletedMenu) {
            return res.status(404).json({ message: "Menu not found or unauthorized to delete" });
        }
        
        return res.status(200).json({ message: "Menu deleted successfully" });
    } catch (err) {
        console.error("Delete error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export { addMenu, getMenu, updateMenu, deleteMenu };