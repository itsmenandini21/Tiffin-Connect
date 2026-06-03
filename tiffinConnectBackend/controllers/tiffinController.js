import TiffinService from "../models/TiffinService.js";
import ProviderProfile from "../models/ProviderProfile.js";
import Subscription from "../models/Subscription.js";
const addMenu = async (req, res) => {
    try {
        const newMenu = await TiffinService.create({
            providerId: req.provider._id,
            title: req.body.title,
            description: req.body.description,
            shift: req.body.shift,
            foodType: req.body.foodType,
            pricePerMeal: req.body.pricePerMeal,
            weeklyMenu: req.body.weeklyMenu
        });
        
        // Always send a response back!
        res.status(201).json({ message: "Menu added successfully", menu: newMenu });
    } catch (err) {
        console.error("Error adding menu:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const getProviderServices = async (req,res) =>{
    try{
        const currHr = new Date().getHours();
        let priorityOrder = [];
        if(currHr >= 4 && currHr <= 10){
            priorityOrder = ["Breakfast","Lunch","Dinner","AllDay"]
        }
        else if(currHr >= 11 && currHr <= 16){
            priorityOrder =["Lunch","Dinner","Breakfast","AllDay"]
        }
        else{
            priorityOrder = ["Dinner","Breakfast","Lunch","AllDay"]
        }
        const menus = await TiffinService.find({providerId : req.provider._id});
        const menusId = menus.map(menu => menu._id);
        const subscribers = await Subscription.find({tiffinServiceId :{$in : menusId}}).populate("userId","name phoneNumber address email");
        const todayDate = new Date().toISOString().split('T')[0];
        const structuredMenus = menus.map(menu =>{
            const menuSub = subscribers.filter(sub => 
                sub.tiffinServiceId.toString() === menu._id.toString() && sub.status === "active"
            );
            let skippedCount = 0;
            let deliverCount = 0;
            const subscriberDetails = menuSub.map(sub =>{
                const isSkippedToday = sub.skippedDates.includes(todayDate);
                if(isSkippedToday) skippedCount++;
                else deliverCount++;
                return {
                    subscriptionId : sub._id,
                    planType : sub.planType,
                    specialInstruction : sub.specialInstruction || "",
                    status : sub.status,
                    customer:{
                        name : sub.userId ? sub.userId.name : "Customer",                      
                        phoneNumber : sub.userId ? sub.userId.phoneNumber : "N/A",
                        address: sub.userId?.address || {}
                    }
                }
            });
            return {
                _id : menu._id,
                title : menu.title,
                description : menu.description,
                shift : menu.shift,
                foodType: menu.foodType,
                pricePerMeal: menu.pricePerMeal,
                weeklyMenu: menu.weeklyMenu,
                isAvailable: menu.isAvailable,
                activeSubscribersCount: menuSub.length,
                skippedTodayCount: skippedCount,
                deliverTodayCount: deliverCount,
                subscribers: subscriberDetails
            }
        })
        structuredMenus.sort((a, b) => {
            return priorityOrder.indexOf(a.shift) - priorityOrder.indexOf(b.shift);
        });
        return res.status(200).json(structuredMenus);
    }
    catch(err){
        return res.status(500).json({message: "Internal Server Error"});
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

const getAllServices = async (req, res) => {
    try {
        const services = await TiffinService.find({ isAvailable: true })
            .populate("providerId", "name address phoneNumber");
            
        // Fetch ProviderProfile for each service provider and attach it
        const servicesWithProfile = await Promise.all(services.map(async (service) => {
            const serviceObj = service.toObject();
            if (service.providerId) {
                const profile = await ProviderProfile.findOne({ userId: service.providerId._id });
                serviceObj.providerProfile = profile ? {
                    businessName: profile.businessName,
                    kitchenGuidelines: profile.kitchenGuidelines || "Fresh daily home-cooked prep. Please cancel or pause at least 12 hours before the delivery slot."
                } : null;
            } else {
                serviceObj.providerProfile = null;
            }
            return serviceObj;
        }));

        res.status(200).json(servicesWithProfile);
    } catch (err) {
        console.error("Get all services error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export { addMenu, getProviderServices, updateMenu, deleteMenu, getAllServices };