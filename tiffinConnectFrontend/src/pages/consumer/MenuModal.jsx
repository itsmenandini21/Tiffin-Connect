import { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ChevronRight, 
  Award, 
  Leaf,
  ShieldCheck,
  CreditCard,
  Wallet,
  ArrowLeft,
  Sparkles,
  Lock,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CONFETTI_PARTICLES = [
  { color: "bg-[#FF7A00]", left: 5, delay: 0.1, duration: 2.2, rotate: 45 },
  { color: "bg-amber-400", left: 12, delay: 0.5, duration: 3.1, rotate: 90 },
  { color: "bg-[#22C55E]", left: 18, delay: 1.2, duration: 2.8, rotate: 120 },
  { color: "bg-indigo-400", left: 25, delay: 0.3, duration: 3.5, rotate: 15 },
  { color: "bg-pink-400", left: 32, delay: 0.8, duration: 2.4, rotate: 220 },
  { color: "bg-[#FF7A00]", left: 40, delay: 1.5, duration: 3.8, rotate: 60 },
  { color: "bg-amber-400", left: 45, delay: 0.2, duration: 2.9, rotate: 135 },
  { color: "bg-[#22C55E]", left: 52, delay: 1.1, duration: 3.3, rotate: 300 },
  { color: "bg-indigo-400", left: 58, delay: 0.7, duration: 2.7, rotate: 80 },
  { color: "bg-pink-400", left: 65, delay: 1.4, duration: 3.6, rotate: 160 },
  { color: "bg-[#FF7A00]", left: 72, delay: 0.4, duration: 2.1, rotate: 25 },
  { color: "bg-amber-400", left: 78, delay: 1.0, duration: 3.4, rotate: 110 },
  { color: "bg-[#22C55E]", left: 85, delay: 0.6, duration: 2.6, rotate: 190 },
  { color: "bg-indigo-400", left: 90, delay: 1.3, duration: 3.7, rotate: 40 },
  { color: "bg-pink-400", left: 95, delay: 0.9, duration: 2.3, rotate: 280 },
  { color: "bg-[#FF7A00]", left: 2, delay: 1.6, duration: 3.0, rotate: 310 },
  { color: "bg-amber-400", left: 38, delay: 0.5, duration: 2.5, rotate: 150 },
  { color: "bg-[#22C55E]", left: 60, delay: 1.0, duration: 3.2, rotate: 75 },
  { color: "bg-indigo-400", left: 82, delay: 0.3, duration: 2.8, rotate: 18 },
  { color: "bg-pink-400", left: 88, delay: 1.7, duration: 3.9, rotate: 240 }
];

export default function MenuModal({ kitchen, initialMode, onClose, isSubscribed }) {
  const navigate = useNavigate();

  // ==========================================
  // JAVASCRIPT LOGIC & STATE
  // ==========================================
  
  // 1. Step Indicator State (1: Menu, 2: Checkout/Guidelines, 3: Simulated Payment, 4: Success)
  const [step, setStep] = useState(1);
  
  // 2. Menu selector & subscription details:
  const [activeDay, setActiveDay] = useState("Monday");
  const [subType, setSubType] = useState("weekly"); // 'weekly' or 'monthly'
  const [mode, setMode] = useState(initialMode || "menu"); // 'menu' or 'subscribe'
  const [, setSubmitting] = useState(false);

  // 3. Agreement Checklist
  const [agreed, setAgreed] = useState(false);

  // 4. Payment Simulation States
  const [payMethod, setPayMethod] = useState("gpay"); // gpay, phonepe, card
  const [payProgressText, setPayProgressText] = useState("");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });

  const menuData = kitchen?.menu || {
    Monday: { lunch: "Tandoori Roti (4), Shahi Paneer, Jeera Rice, Tadka Dal, Green Salad", dinner: "Phulka Roti (4), Seasonal Green Vegetable, Veg Khichdi, Kadhi" },
    Tuesday: { lunch: "Plain Paratha (3), Chana Masala, Veg Pulav, Boondi Raita, Onion Salad", dinner: "Phulka Roti (4), Aloo Jeera dry, Moong Dal, Steamed Rice" },
    Wednesday: { lunch: "Missi Roti (2), Dum Aloo, Veg Biryani, Cucumber Raita, Pickle", dinner: "Phulka Roti (4), Bhindi Fry, Toor Dal Tadka, Steamed Rice" },
    Thursday: { lunch: "Butter Roti (4), Mix Veg Sabzi, Peas Pulav, Dal Makhani, Papad", dinner: "Phulka Roti (4), Lauki Kofta Curry, Moong Dal Khichdi" },
    Friday: { lunch: "Plain Paratha (3), Rajma Masala, Steamed Basmati Rice, Onion Salad", dinner: "Phulka Roti (4), Methi Matar Malai, Masoor Dal, Rice" },
    Saturday: { lunch: "Special Laccha Paratha (2), Kadai Paneer, Veg Fried Rice, Raita", dinner: "Phulka Roti (4), Aloo Gobi Matar, Yellow Dal, Rice" },
    Sunday: { lunch: "Butter Naan (2), Dal Makhani, Veg Biryani, Mixed Veg Raita, Sweet Kheer", dinner: "Light Phulka (3), Seasonal Veg, Tomato Soup, Khichdi" }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const getDayMenu = (dayName) => {
    const dayData = menuData[dayName] || menuData[dayName.toLowerCase()];
    if (!dayData) return null;
    if (typeof dayData === 'string') {
      return { lunch: dayData, dinner: dayData };
    }
    if (typeof dayData === 'object') {
      return { lunch: dayData.lunch || "", dinner: dayData.dinner || "" };
    }
    return null;
  };

  const activeDayMenu = getDayMenu(activeDay);
  const lunchMenuText = activeDayMenu?.lunch || "Standard homestyle lunch with seasonal sabzi, dal, rice, and fresh rotis.";
  const dinnerMenuText = activeDayMenu?.dinner || "Light homestyle dinner with seasonal gravy, toor/moong dal, rice, and hot phulkas.";

  // Dynamic Price Calculations (Producer-based)
  const basePricePerMeal = kitchen?.price || 120;
  const planMultiplier = subType === "weekly" ? 7 : 30;
  const basePrice = basePricePerMeal * planMultiplier;
  const platformFee = 15;
  const gstTax = Math.round(basePrice * 0.05); // 5% GST
  const grandTotal = basePrice + platformFee + gstTax;

  // Handle Payment Initiation & Simulation (Step 3)
  const startPaymentSimulation = () => {
    // Basic validation for card
    if (payMethod === "card" && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      toast.error("Please enter complete card details.");
      return;
    }
    setStep(3);
    
    // Sequence of animated gateway loading messages
    const messages = [
      "Securing connection with bank server...",
      "Routing payment request to gateway...",
      "Verifying secure bank authorization...",
      "Completing secure transaction..."
    ];

    let currentMsgIdx = 0;
    setPayProgressText(messages[0]);

    const interval = setInterval(() => {
      currentMsgIdx++;
      if (currentMsgIdx < messages.length) {
        setPayProgressText(messages[currentMsgIdx]);
      } else {
        clearInterval(interval);
        // Call backend API and go to Step 4 (celebration)
        handleSubscriptionCreation();
      }
    }, 1200);
  };

  // Live Subscription Database Trigger on payment success
  const handleSubscriptionCreation = async () => {
    setSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in to subscribe.");
        setStep(2);
        return;
      }

      const response = await fetch(`${API_URL}/subscription/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tiffinServiceId: kitchen._id,
          planType: subType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Subscription registration failed");
      }

      // Transition to Step 4 (Success celebrations)
      setStep(4);
      toast.success(data.message || `Subscribed to ${kitchen?.serviceName || "Kitchen"} successfully!`);
    } catch (err) {
      console.error("Subscription create error:", err);
      toast.error(err.message || "Failed to finalize subscription in database.");
      setStep(2); // Fall back to checkout to retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      
      {/* Backdrop blur layer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={step === 3 ? null : onClose} // Prevent closing during payment processing
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden z-10 flex flex-col border border-[#FF7A00]/10"
      >
        
        {/* Header (hidden in step 4 celebration) */}
        {step !== 4 && (
          <div className="p-6 border-b border-[#FF7A00]/10 flex justify-between items-start bg-[#FFF8F1]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {(step > 1 || (step === 1 && mode === 'subscribe' && initialMode === 'menu')) && (
                  <button 
                    onClick={() => {
                      if (step > 1) {
                        setStep(step - 1);
                      } else {
                        setMode('menu');
                      }
                    }}
                    className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-[#FF7A00] bg-[#FF7A00]/10 hover:bg-[#FF7A00]/20 px-2.5 py-0.5 rounded-full transition-colors mr-1"
                  >
                    <ArrowLeft className="w-2.5 h-2.5" /> Back
                  </button>
                )}
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#FF7A00] bg-[#FF7A00]/10 px-2.5 py-0.5 rounded-full border border-[#FF7A00]/15">
                  {step === 1 
                    ? (mode === 'menu' ? (kitchen?.cuisineType || "Authentic Homestyle") : "Subscription Plans") 
                    : `Step ${step} of 3: Checkout`}
                </span>
                {kitchen?.isVeg && (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full border border-[#22C55E]/20">
                    <Leaf className="w-2.5 h-2.5 fill-current" /> Veg Only
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-[#2D2D2D] tracking-tight">
                {kitchen?.serviceName || "Swad ki Rasoi"}
              </h2>
              <p className="text-xs text-[#6B7280] font-bold mt-1">
                🧑‍🍳 Managed by {kitchen?.providerId?.name || "Expert Home Chef"}
              </p>
            </div>
            
            {/* Close Button */}
            {step !== 3 && (
              <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-white border border-[#FF7A00]/10 hover:bg-[#FFF8F1] hover:text-[#FF7A00] text-[#6B7280] transition-colors shadow-sm focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Dynamic Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-grow bg-white">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CONDITIONAL MENU OR PLAN SELECTOR VIEW */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {mode === 'menu' ? (
                  /* Standard Weekly Menu view */
                  <>
                    {/* Photo Gallery (Shopping App Style) */}
                    {kitchen?.menuImages && kitchen.menuImages.length > 0 && (
                      <div className="mb-6 -mx-2">
                        <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x">
                          {kitchen.menuImages.map((imgUrl, index) => (
                            <div key={index} className="flex-shrink-0 w-64 h-40 rounded-2xl overflow-hidden shadow-sm snap-center border border-gray-100 relative group">
                              <img src={imgUrl} alt={`Menu image ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 7-Day tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-orange-200">
                      {days.map((day) => (
                        <button
                          key={day}
                          onClick={() => setActiveDay(day)}
                          className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold border whitespace-nowrap transition-all duration-300 shrink-0 ${
                            activeDay === day
                              ? 'bg-gradient-to-r from-[#FF7A00] to-[#E56700] border-[#FF7A00] text-white shadow-md shadow-[#FF7A00]/10'
                              : 'bg-white border-[#FF7A00]/10 text-[#6B7280] hover:border-[#FF7A00]/30 hover:text-[#FF7A00]'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>

                    {/* Day menus */}
                    <div className="grid grid-cols-1 gap-6">
                      <div className="p-5 rounded-2xl border border-[#FF7A00]/10 bg-[#FF7A00]/5 space-y-3.5 relative overflow-hidden">
                        <div className="absolute right-0 top-0 text-4xl p-4 opacity-10 font-bold select-none pointer-events-none">
                          {kitchen?.shift === 'Dinner' ? '🌙' : '☀️'}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF7A00] bg-[#FF7A00]/10 px-3 py-1 rounded-full border border-[#FF7A00]/15">
                            {kitchen?.shift || 'Daily'} Menu {kitchen?.shift === 'Dinner' ? '🌙' : '☀️'}
                          </span>
                          <span className="text-[10px] font-bold text-[#6B7280]">
                            {(kitchen?.startTime && kitchen?.endTime) ? `${kitchen.startTime} - ${kitchen.endTime}` : "Timings not set"}
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-[#2D2D2D]">Today's Special</h4>
                        <p className="text-[#2D2D2D] text-xs md:text-sm leading-relaxed font-semibold">
                          {lunchMenuText}
                        </p>
                      </div>
                    </div>

                    {/* Non-intrusive Subscription CTA Banner */}
                    <div className="p-5 rounded-2xl bg-[#FFF8F1] border border-[#FF7A00]/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="text-sm font-extrabold text-[#2D2D2D] flex items-center gap-1.5 justify-center sm:justify-start">
                          {isSubscribed ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> You are subscribed!
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-[#FF7A00] fill-current" /> Like this menu? Subscribe daily!
                            </>
                          )}
                        </h4>
                        <p className="text-[11px] text-[#6B7280] font-semibold">
                          {isSubscribed 
                            ? "You have an active subscription for this kitchen's delicious home-cooked meals." 
                            : "Get fresh, hot home-cooked meals delivered daily. Pause or resume deliveries anytime."}
                        </p>
                      </div>
                      {isSubscribed ? (
                        <button
                          onClick={() => {
                            onClose();
                            navigate("/my-subscriptions");
                          }}
                          className="px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#1ea14d] text-white font-extrabold text-xs shadow-md shadow-[#22C55E]/10 hover:shadow-[#22C55E]/20 transition-all duration-300 whitespace-nowrap"
                        >
                          Manage Subscription
                        </button>
                      ) : (
                        <button
                          onClick={() => setMode('subscribe')}
                          className="px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#E56700] text-white font-extrabold text-xs shadow-md shadow-[#FF7A00]/10 hover:shadow-[#FF7A00]/20 transition-all duration-300 whitespace-nowrap"
                        >
                          Subscribe Now
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  /* Dedicated Premium Plan Selector view */
                  isSubscribed ? (
                    <div className="text-center max-w-md mx-auto py-8 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl mx-auto shadow-inner select-none animate-bounce">
                        🎉
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-[#2D2D2D] tracking-tight">Already Subscribed!</h3>
                        <p className="text-xs text-[#6B7280] font-semibold">
                          You are already subscribed to {kitchen?.serviceName || "this kitchen"}! You can manage your subscriptions, pause/resume deliveries, or set special instructions from your dashboard.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-6 py-2.5 rounded-xl border border-gray-300 text-[#6B7280] hover:bg-[#FFF8F1] hover:text-[#FF7A00] font-bold text-xs transition-colors"
                        >
                          Close Modal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            navigate("/my-subscriptions");
                          }}
                          className="px-6 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#1ea14d] text-white font-bold text-xs shadow-md shadow-[#22C55E]/10 hover:shadow-[#22C55E]/20 transition-all duration-300"
                        >
                          Manage Subscriptions
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center max-w-md mx-auto space-y-1">
                        <h3 className="text-lg font-black text-[#2D2D2D] tracking-tight">Select Subscription Plan</h3>
                        <p className="text-xs text-[#6B7280] font-semibold">
                          Choose a flexible plan that fits your schedule. Pause or resume deliveries with one click.
                        </p>
                      </div>

                      {/* Plan Selector Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Weekly Card */}
                        <button
                          onClick={() => setSubType("weekly")}
                          className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 flex flex-col justify-between relative overflow-hidden h-60 ${
                            subType === 'weekly'
                              ? 'border-[#FF7A00] bg-[#FF7A00]/5 shadow-lg shadow-[#FF7A00]/5 ring-1 ring-[#FF7A00]/10'
                              : 'border-[#FF7A00]/10 bg-white hover:border-[#FF7A00]/30 hover:shadow-md'
                          }`}
                        >
                          {subType === 'weekly' && (
                            <div className="absolute right-4 top-4 bg-[#FF7A00] text-white p-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                            </div>
                          )}
                          
                          <div>
                            <div className="w-11 h-11 rounded-2xl bg-[#FF7A00]/10 flex items-center justify-center text-xl mb-4 shadow-inner select-none">
                              🥗
                            </div>
                            <h4 className="text-base font-black text-[#2D2D2D]">Weekly Plan</h4>
                            <p className="text-xs text-[#6B7280] font-bold mt-1">7 Days of deliveries</p>
                          </div>

                          <div className="mt-4 border-t border-[#FF7A00]/10 pt-4 w-full">
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="text-[11px] text-[#6B7280] font-bold">Price per meal</span>
                              <span className="text-xs font-black text-[#2D2D2D]">₹{basePricePerMeal}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                              <span className="text-[11px] text-[#6B7280] font-bold">Total (7 meals)</span>
                              <span className="text-lg font-black text-[#FF7A00]">₹{basePricePerMeal * 7}</span>
                            </div>
                          </div>
                        </button>

                        {/* Monthly Card */}
                        <button
                          onClick={() => setSubType("monthly")}
                          className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 flex flex-col justify-between relative overflow-hidden h-60 ${
                            subType === 'monthly'
                              ? 'border-[#FF7A00] bg-[#FF7A00]/5 shadow-lg shadow-[#FF7A00]/5 ring-1 ring-[#FF7A00]/10'
                              : 'border-[#FF7A00]/10 bg-white hover:border-[#FF7A00]/30 hover:shadow-md'
                          }`}
                        >
                          <div className="absolute top-4 right-4 flex items-center gap-1.5">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full border border-[#22C55E]/20 shadow-sm">
                              Best Value 🔥
                            </span>
                            {subType === 'monthly' && (
                              <div className="bg-[#FF7A00] text-white p-1 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="w-11 h-11 rounded-2xl bg-[#FF7A00]/10 flex items-center justify-center text-xl mb-4 shadow-inner select-none">
                              🍲
                            </div>
                            <h4 className="text-base font-black text-[#2D2D2D]">Monthly Plan</h4>
                            <p className="text-xs text-[#6B7280] font-bold mt-1">30 Days of deliveries</p>
                          </div>

                          <div className="mt-4 border-t border-[#FF7A00]/10 pt-4 w-full">
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="text-[11px] text-[#6B7280] font-bold">Price per meal</span>
                              <span className="text-xs font-black text-[#2D2D2D]">₹{basePricePerMeal}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                              <span className="text-[11px] text-[#6B7280] font-bold">Total (30 meals)</span>
                              <span className="text-lg font-black text-[#FF7A00]">₹{basePricePerMeal * 30}</span>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Guarantee Info Strip */}
                      <div className="p-4 rounded-2xl bg-[#2D2D2D] text-white flex items-center gap-4 relative overflow-hidden border border-[#FF7A00]/10 shadow-sm">
                        <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
                        <div className="p-2.5 bg-neutral-800 border border-neutral-700 rounded-xl shrink-0">
                          <Award className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-white">Tiffin Connect Guarantee</h5>
                          <p className="text-[10px] text-gray-305 font-medium mt-0.5">
                            Pause/resume deliveries from your dashboard. Paused days extend plan validity automatically.
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setStep(2)}
                          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all duration-300 shadow-lg shadow-[#FF7A00]/10 hover:shadow-[#FF7A00]/25"
                        >
                          <span>Proceed to Checkout</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </motion.div>
            )}

            {/* STEP 2: PRICING DETAILS & T&C SUMMARY VIEW */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Left Side: Dynamic Bill Calculation */}
                <div className="space-y-4">
                  <div className="bg-[#FFF8F1] border border-[#FF7A00]/10 p-5 rounded-3xl space-y-4">
                    <h3 className="text-base font-black text-[#2D2D2D] flex items-center gap-2 border-b border-[#FF7A00]/10 pb-3">
                      <span>🧾 Pricing Summary</span>
                      <span className="text-[10px] font-extrabold uppercase bg-[#FF7A00]/10 text-[#FF7A00] px-2 py-0.5 rounded">
                        {subType} plan
                      </span>
                    </h3>

                    {/* Math breakdown */}
                    <div className="space-y-2.5 text-xs font-bold text-[#6B7280]">
                      <div className="flex justify-between items-center">
                        <span>Base Fare ({basePricePerMeal} / meal $\times$ {planMultiplier} meals)</span>
                        <span className="text-[#2D2D2D]">₹{basePrice}.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Platform Processing Fee</span>
                        <span className="text-[#2D2D2D]">₹{platformFee}.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Platform GST (5%)</span>
                        <span className="text-[#2D2D2D]">₹{gstTax}.00</span>
                      </div>
                      
                      <div className="border-t border-[#FF7A00]/10 my-2 pt-3 flex justify-between items-center text-sm font-black text-[#2D2D2D]">
                        <span>Grand Total</span>
                        <span className="text-[#FF7A00] text-base font-black">₹{grandTotal}.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Platform Security badge */}
                  <div className="p-4 rounded-2xl bg-[#FF7A00]/5 border border-[#FF7A00]/10 flex gap-3 text-xs font-semibold text-[#FF7A00]">
                    <ShieldCheck className="w-5 h-5 text-[#FF7A00] shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-[#FF7A00]">Secure Transactions Guaranteed</h4>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">
                        Payments are secured and paused funds are dynamically adjusted. Pauses extend plan lengths automatically.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Terms of Use & Dynamic guidelines */}
                <div className="space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Platform Terms */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#6B7280]">1. Platform Subscription Terms</h4>
                      <ul className="text-[11px] font-semibold text-[#6B7280] space-y-1.5 pl-4 list-disc">
                        <li>You can pause or restart your active plan deliveries at any time from your Customer Dashboard.</li>
                        <li>Subscription pausing must be triggered before the meal prep cutoff window (typically 12 hrs).</li>
                        <li>No direct partial refunds are provided for active cycles; paused days are credited.</li>
                      </ul>
                    </div>

                    {/* Dynamic Chef Guidelines */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#6B7280]">2. Chef Guidelines & Kitchen Rules</h4>
                      <div className="p-4 rounded-2xl bg-amber-50/10 border border-amber-100 text-[11px] font-bold text-amber-800 leading-relaxed">
                        🧑‍🍳 <span className="font-extrabold text-amber-950">{kitchen.providerProfile?.businessName || kitchen.serviceName}</span>:
                        <p className="mt-1.5 italic font-semibold text-[#2D2D2D]">
                          "{kitchen.providerProfile?.kitchenGuidelines || "Homestyle packaging, hygienic prep. Deliveries operate within specific neighborhood slots. Contact home chef directly for food customization requirements."}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Agreements Checkbox + CTA */}
                  <div className="space-y-4 pt-4 border-t border-[#FF7A00]/10">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 rounded border-[#FF7A00]/20 text-[#FF7A00] focus:ring-[#FF7A00] h-4.5 w-4.5"
                      />
                      <span className="text-xs font-bold text-[#6B7280] leading-normal">
                        I agree to the platform subscription policy and special chef guidelines.
                      </span>
                    </label>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 border border-[#FF7A00]/20 hover:bg-[#FF7A00]/5 text-[#6B7280] font-bold text-xs rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        disabled={!agreed}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#FF7A00]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SIMULATED PAYMENT GATEWAY VIEW */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto space-y-6 py-6"
              >
                {/* Active Loader Screen */}
                {payProgressText ? (
                  <div className="text-center py-10 space-y-5 flex flex-col items-center">
                    <Loader className="w-10 h-10 text-[#FF7A00] animate-spin" />
                    <div className="space-y-1.5">
                      <h4 className="text-base font-black text-[#2D2D2D] animate-pulse">Processing Payment</h4>
                      <p className="text-xs text-[#6B7280] font-bold tracking-wide uppercase">{payProgressText}</p>
                    </div>
                    <div className="p-3 bg-[#FFF8F1] border border-[#FF7A00]/10 rounded-xl max-w-xs text-[10px] text-[#6B7280] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                      <span>Secured with SSL Simulated Sandbox Integration</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Method Selector */}
                    <div className="text-center space-y-1.5">
                      <h3 className="text-lg font-black text-[#2D2D2D]">Secure Payment Simulation</h3>
                      <p className="text-xs text-[#6B7280] font-bold uppercase">Grand Total: <span className="text-[#FF7A00]">₹{grandTotal}.00</span></p>
                    </div>

                    {/* Options Grid */}
                    <div className="space-y-3">
                      {/* UPI Option */}
                      <button
                        onClick={() => setPayMethod("gpay")}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 ${
                          payMethod === "gpay" 
                            ? "border-[#FF7A00] bg-[#FF7A00]/5 ring-2 ring-[#FF7A00]/10" 
                            : "border-[#FF7A00]/10 hover:border-[#FF7A00]/30"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-2 bg-[#FF7A00]/10 rounded-xl">
                            <Wallet className="w-5 h-5 text-[#FF7A00]" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#2D2D2D]">UPI Instant checkout</p>
                            <p className="text-[10px] text-[#6B7280] font-semibold mt-0.5">Google Pay / PhonePe / Paytm</p>
                          </div>
                        </div>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          payMethod === "gpay" ? "border-[#FF7A00] bg-[#FF7A00]" : "border-gray-300"
                        }`}>
                          {payMethod === "gpay" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </button>

                      {/* Card Option */}
                      <button
                        onClick={() => setPayMethod("card")}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 ${
                          payMethod === "card" 
                            ? "border-[#FF7A00] bg-[#FF7A00]/5 ring-2 ring-[#FF7A00]/10" 
                            : "border-[#FF7A00]/10 hover:border-[#FF7A00]/30"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-2 bg-[#FF7A00]/10 rounded-xl">
                            <CreditCard className="w-5 h-5 text-[#FF7A00]" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-[#2D2D2D]">Credit / Debit Card</p>
                            <p className="text-[10px] text-[#6B7280] font-semibold mt-0.5">Visa, Mastercard, RuPay supported</p>
                          </div>
                        </div>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          payMethod === "card" ? "border-[#FF7A00] bg-[#FF7A00]" : "border-gray-300"
                        }`}>
                          {payMethod === "card" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </button>
                    </div>

                    {/* Card input forms */}
                    {payMethod === "card" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3.5 bg-[#FFF8F1] p-4 border border-[#FF7A00]/10 rounded-2xl"
                      >
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-[#6B7280]">Card Number</label>
                          <input 
                            type="text" 
                            placeholder="4111 2222 3333 4444" 
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                            className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-[#FF7A00]/20 text-xs font-bold focus:border-[#FF7A00] focus:outline-none focus:ring-1 focus:ring-[#FF7A00] text-[#2D2D2D]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-[#6B7280]">Expiry (MM/YY)</label>
                            <input 
                              type="text" 
                              placeholder="12/28" 
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                              className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-[#FF7A00]/20 text-xs font-bold focus:border-[#FF7A00] focus:outline-none focus:ring-1 focus:ring-[#FF7A00] text-[#2D2D2D]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-[#6B7280]">CVV</label>
                            <input 
                              type="password" 
                              placeholder="***" 
                              maxLength="3"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                              className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-[#FF7A00]/20 text-xs font-bold focus:border-[#FF7A00] focus:outline-none focus:ring-1 focus:ring-[#FF7A00] text-[#2D2D2D]"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Security note & buttons */}
                    <div className="space-y-3 pt-4 border-t border-[#FF7A00]/10">
                      <div className="flex gap-2 text-[10px] text-[#6B7280] font-bold justify-center items-center">
                        <Lock className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                        <span>Secured by SSL Simulated Sandbox Integration</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setStep(2)}
                          className="flex-1 py-3 border border-[#FF7A00]/20 hover:bg-[#FF7A00]/5 text-[#6B7280] font-bold text-xs rounded-xl transition-colors"
                        >
                          Back to summary
                        </button>
                        <button
                          onClick={startPaymentSimulation}
                          className="flex-1 py-3 px-4 bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#FF7A00]/10 transition-all duration-300"
                        >
                          Confirm & Pay ₹{grandTotal}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 4: CELEBRATION CONFETTI SUCCESS VIEW */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 max-w-md mx-auto space-y-6 relative overflow-hidden"
              >
                
                {/* CSS CONFETTI FLOATING PARTICLES */}
                <div className="absolute inset-0 pointer-events-none select-none">
                  {CONFETTI_PARTICLES.map((particle, i) => (
                    <div 
                      key={i}
                      className={`absolute w-2 h-3.5 ${particle.color} rounded opacity-80 animate-[ping_1.5s_infinite]`}
                      style={{
                        left: `${particle.left}%`,
                        top: `-10px`,
                        animationDelay: `${particle.delay}s`,
                        animationDuration: `${particle.duration}s`,
                        transform: `rotate(${particle.rotate}deg)`
                      }}
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  {/* Big Check Circle */}
                  <div className="w-20 h-20 bg-[#22C55E]/10 text-[#22C55E] rounded-3xl flex items-center justify-center mx-auto border border-[#22C55E]/20 shadow-md shadow-[#22C55E]/5 animate-bounce">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-black text-[#2D2D2D] tracking-tight flex items-center justify-center gap-1.5">
                      Subscription Active! <Sparkles className="w-5 h-5 text-amber-400 fill-current" />
                    </h3>
                    <p className="text-xs text-[#22C55E] font-extrabold bg-[#22C55E]/10 border border-[#22C55E]/20 px-3 py-1 rounded-full inline-block">
                      Simulated Transaction Successful
                    </p>
                  </div>
                </div>

                {/* Sub Summary display */}
                <div className="p-5 rounded-3xl bg-[#2D2D2D] text-white text-left space-y-3 relative overflow-hidden border border-[#FF7A00]/10 shadow-xl">
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
                  
                  <h4 className="text-xs uppercase tracking-wider text-[#FF7A00] font-extrabold border-b border-[#FF7A00]/10 pb-2">Plan Details</h4>
                  <div className="space-y-2 text-xs font-semibold text-gray-300">
                    <div className="flex justify-between">
                      <span>Kitchen Name</span>
                      <span className="text-white font-bold">{kitchen.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plan Type</span>
                      <span className="text-white font-bold uppercase">{subType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-Resume Pauses</span>
                      <span className="text-[#22C55E] font-bold">Enabled</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivering To</span>
                      <span className="text-white font-bold truncate max-w-[180px]">{kitchen.providerId?.address || "Registered Address"}</span>
                    </div>
                  </div>
                </div>

                {/* Confirm redirect button */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      navigate("/my-subscriptions");
                    }}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#FF7A00]/10 hover:shadow-[#FF7A00]/25 transition-all duration-300"
                  >
                    Go to My Subscriptions
                  </button>
                  <p className="text-[10px] text-[#6B7280] font-bold">
                    You can manage, pause, or pause/resume your subscription cycles anytime.
                  </p>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </motion.div>
    </div>
  );
}
