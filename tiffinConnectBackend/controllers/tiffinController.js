import TiffinService from "../models/TiffinService.js";
import ProviderProfile from "../models/ProviderProfile.js";
import Subscription from "../models/Subscription.js";
import Review from "../models/Review.js";
import User from "../models/user.js";
const addMenu = async (req, res) => {
    try {
        const newMenu = await TiffinService.create({
            providerId: req.provider._id,
            title: req.body.title,
            description: req.body.description,
            shift: req.body.shift,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            foodType: req.body.foodType,
            pricePerMeal: req.body.pricePerMeal,
            coverImage: req.body.coverImage || "",
            menuImages: req.body.menuImages || [],
            weeklyMenu: req.body.weeklyMenu
        });
        
        // Always send a response back!
        res.status(201).json({ message: "Menu added successfully", menu: newMenu });
    } catch (err) {
        console.error("Error adding menu:", err);
        res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
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
            let subscriberDetails = [];
            menuSub.forEach(sub =>{
                const isSkippedToday = sub.skippedDates.includes(todayDate);
                if(isSkippedToday) {
                    skippedCount++;
                } else {
                    deliverCount++;
                    subscriberDetails.push({
                        subscriptionId : sub._id,
                        planType : sub.planType,
                        specialInstruction : sub.specialInstruction || "",
                        status : sub.status,
                        deliveryStatus : sub.deliveryStatus || "pending",
                        deliveryStatusUpdatedAt : sub.deliveryStatusUpdatedAt || null,
                        customer:{
                            _id: sub.userId ? sub.userId._id : null,
                            name : sub.userId ? sub.userId.name : "Customer",                      
                            phoneNumber : sub.userId ? sub.userId.phoneNumber : "N/A",
                            address: sub.userId?.address || {}
                        }
                    });
                }
            });
            return {
                _id : menu._id,
                title : menu.title,
                description : menu.description,
                shift : menu.shift,
                startTime: menu.startTime,
                endTime: menu.endTime,
                foodType: menu.foodType,
                pricePerMeal: menu.pricePerMeal,
                coverImage: menu.coverImage,
                menuImages: menu.menuImages,
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
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
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
        
        // Prevent provider from bypassing admin status controls or changing ownership
        delete req.body.isActive;
        delete req.body.providerId;

        // 2. Use findByIdAndUpdate to apply changes and get the updated document back
        const updatedMenu = await TiffinService.findByIdAndUpdate(
            menuId,
            { $set: req.body },
            { new: true } // Returns the modified document
        );
        
        res.status(200).json({ message: "Menu updated successfully", updatedMenu });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
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
        
        // Automatically remove all subscriptions tied to this deleted menu
        await Subscription.deleteMany({ tiffinServiceId: menuId });
        
        return res.status(200).json({ message: "Menu deleted successfully" });
    } catch (err) {
        console.error("Delete error:", err);
        return res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}

const getAllServices = async (req, res) => {
    try {
        const userCity = req.user?.address?.city;

        // Fetch verified provider profiles
        const verifiedProfiles = await ProviderProfile.find({ isVerified: true }).select("userId");
        let verifiedProviderIds = verifiedProfiles.map(p => p.userId.toString());

        // Filter providers by the user's city
        if (userCity) {
            const cityRegex = new RegExp(`^${userCity}$`, 'i');
            const cityProviders = await User.find({
                _id: { $in: verifiedProviderIds },
                "address.city": cityRegex
            }).select("_id");
            
            verifiedProviderIds = cityProviders.map(p => p._id.toString());
        }

        const services = await TiffinService.find({ 
            isAvailable: { $ne: false }, 
            isActive: { $ne: false },
            providerId: { $in: verifiedProviderIds }
        }).populate("providerId", "name address phoneNumber");
            
        // Fetch ProviderProfile for each service provider and attach it
        const servicesWithProfile = await Promise.all(services.map(async (service) => {
            const serviceObj = service.toObject();
            
            // Calculate real average rating from the reviews database
            const reviews = await Review.find({ tiffinServiceId: service._id });
            const avgRating = reviews.length > 0
                ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
                : 0; // default to 0 for fresh kitchens
            
            // Calculate real orders count from active/paused subscriptions
            const ordersCount = await Subscription.countDocuments({ tiffinServiceId: service._id });
            
            serviceObj.rating = avgRating;
            serviceObj.ordersCount = ordersCount;

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
        res.status(500).json({ message: "We are experiencing technical difficulties. Please try again later." });
    }
}

export { addMenu, getProviderServices, updateMenu, deleteMenu, getAllServices };