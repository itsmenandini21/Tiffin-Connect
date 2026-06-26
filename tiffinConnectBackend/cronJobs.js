import cron from "node-cron";
import Subscription from "./models/Subscription.js";
import Notification from "./models/Notification.js";

// Run every day at midnight (00:00)
// For testing purposes, you can change this to '* * * * *' to run every minute
const runSubscriptionCronJobs = () => {
    cron.schedule("0 0 * * *", async () => {
        console.log("Running Daily Subscription Cron Job...");
        
        try {
            const today = new Date();
            
            // 1. Handle Expirations (Max Validity Passed OR Meals = 0)
            const expiringSubs = await Subscription.find({
                status: "active",
                $or: [
                    { mealsRemaining: { $lte: 0 } },
                    { maxValidityDate: { $lte: today } }
                ]
            }).populate("tiffinServiceId");

            for (let sub of expiringSubs) {
                // Mark as completed if they finished meals, expired if they ran out of time
                const newStatus = sub.mealsRemaining <= 0 ? "completed" : "expired";
                
                await Subscription.findByIdAndUpdate(sub._id, { status: newStatus });
                
                // Create Notification
                await Notification.create({
                    userId: sub.userId,
                    title: "Subscription Ended",
                    message: `Your ${sub.planType} plan from ${sub.tiffinServiceId?.title || "our Kitchen"} has ${newStatus}. Please renew to continue!`,
                    type: "warning",
                    relatedId: sub._id
                });
                
                // TODO: Send Email Notification
            }

            // 2. Handle Reminders (Exactly 3 meals remaining)
            const reminderSubs = await Subscription.find({
                status: "active",
                mealsRemaining: 3
            }).populate("tiffinServiceId");

            for (let sub of reminderSubs) {
                await Notification.create({
                    userId: sub.userId,
                    title: "Plan Expiring Soon",
                    message: `You have 3 meals remaining in your ${sub.planType} plan from ${sub.tiffinServiceId?.title || "our Kitchen"}. Renew soon!`,
                    type: "info",
                    relatedId: sub._id
                });
                
                // TODO: Send Email Reminder
            }

            console.log(`Cron Job finished. Expired: ${expiringSubs.length}, Reminders sent: ${reminderSubs.length}`);

        } catch (error) {
            console.error("Error running subscription cron job:", error);
        }
    });
};

export default runSubscriptionCronJobs;
