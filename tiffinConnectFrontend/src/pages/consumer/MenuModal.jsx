import React, { useState, useEffect } from 'react';
import { 
  X, 
  CalendarDays, 
  CheckCircle2, 
  ChevronRight, 
  Award, 
  Leaf,
  ShieldCheck,
  CreditCard,
  Wallet,
  Coins,
  ArrowLeft,
  Sparkles,
  Lock,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function MenuModal({ kitchen, initialMode, onClose }) {
  // ==========================================
  // JAVASCRIPT LOGIC & STATE
  // ==========================================
  
  // 1. Step Indicator State (1: Menu, 2: Checkout/Guidelines, 3: Simulated Payment, 4: Success)
  const [step, setStep] = useState(1);
  
  // 2. Menu selector & subscription details:
  const [activeDay, setActiveDay] = useState("Monday");
  const [subType, setSubType] = useState("weekly"); // 'weekly' or 'monthly'
  const [mode, setMode] = useState(initialMode || "menu"); // 'menu' or 'subscribe'
  const [submitting, setSubmitting] = useState(false);

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
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={step === 3 ? null : onClose} // Prevent closing during payment processing
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden z-10 flex flex-col border border-gray-100"
      >
        
        {/* Header (hidden in step 4 celebration) */}
        {step !== 4 && (
          <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-orange-50 to-amber-50/50">
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
                    className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-orange-600 bg-orange-100 hover:bg-orange-200 px-2.5 py-0.5 rounded-full transition-colors mr-1"
                  >
                    <ArrowLeft className="w-2.5 h-2.5" /> Back
                  </button>
                )}
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
                  {step === 1 
                    ? (mode === 'menu' ? (kitchen?.cuisineType || "Authentic Homestyle") : "Subscription Plans") 
                    : `Step ${step} of 3: Checkout`}
                </span>
                {kitchen?.isVeg && (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <Leaf className="w-2.5 h-2.5 fill-current" /> Veg Only
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">
                {kitchen?.serviceName || "Swad ki Rasoi"}
              </h2>
              <p className="text-xs text-gray-400 font-bold mt-1">
                🧑‍🍳 Managed by {kitchen?.providerId?.name || "Expert Home Chef"}
              </p>
            </div>
            
            {/* Close Button */}
            {step !== 3 && (
              <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-orange-50 hover:text-orange-600 text-gray-400 transition-colors shadow-sm focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Dynamic Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-grow">
          
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
                    {/* 7-Day tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-orange-200">
                      {days.map((day) => (
                        <button
                          key={day}
                          onClick={() => setActiveDay(day)}
                          className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold border whitespace-nowrap transition-all duration-300 shrink-0 ${
                            activeDay === day
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-orange-500 text-white shadow-md shadow-orange-100'
                              : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>

                    {/* Day menus */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Lunch */}
                      <div className="p-5 rounded-2xl border border-gray-100 bg-orange-50/20 space-y-3.5 relative overflow-hidden">
                        <div className="absolute right-0 top-0 text-4xl p-4 opacity-10 font-bold select-none pointer-events-none">☀️</div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600 bg-orange-100/60 px-3 py-1 rounded-full">
                            Lunch Menu ☀️
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">12:30 PM - 2:30 PM</span>
                        </div>
                        <h4 className="text-base font-extrabold text-gray-800">Premium Afternoon Thali</h4>
                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed font-semibold">
                          {lunchMenuText}
                        </p>
                      </div>

                      {/* Dinner */}
                      <div className="p-5 rounded-2xl border border-gray-100 bg-indigo-50/20 space-y-3.5 relative overflow-hidden">
                        <div className="absolute right-0 top-0 text-4xl p-4 opacity-10 font-bold select-none pointer-events-none">🌙</div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-100/60 px-3 py-1 rounded-full">
                            Dinner Menu 🌙
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">7:30 PM - 9:30 PM</span>
                        </div>
                        <h4 className="text-base font-extrabold text-gray-800">Light Homestyle Dinner</h4>
                        <p className="text-gray-600 text-xs md:text-sm leading-relaxed font-semibold">
                          {dinnerMenuText}
                        </p>
                      </div>
                    </div>

                    {/* Non-intrusive Subscription CTA Banner */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="text-sm font-extrabold text-orange-950 flex items-center gap-1.5 justify-center sm:justify-start">
                          <Sparkles className="w-4 h-4 text-orange-500 fill-current" /> Like this menu? Subscribe daily!
                        </h4>
                        <p className="text-[11px] text-gray-500 font-semibold">
                          Get fresh, hot home-cooked meals delivered daily. Pause or resume deliveries anytime.
                        </p>
                      </div>
                      <button
                        onClick={() => setMode('subscribe')}
                        className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md shadow-orange-100 hover:shadow-orange-500/20 transition-all duration-300 whitespace-nowrap"
                      >
                        Subscribe Now
                      </button>
                    </div>
                  </>
                ) : (
                  /* Dedicated Premium Plan Selector view */
                  <div className="space-y-6">
                    <div className="text-center max-w-md mx-auto space-y-1">
                      <h3 className="text-lg font-black text-gray-800 tracking-tight">Select Subscription Plan</h3>
                      <p className="text-xs text-gray-400 font-semibold">
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
                            ? 'border-orange-500 bg-orange-50/10 shadow-lg shadow-orange-500/5 ring-1 ring-orange-500/10'
                            : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-md'
                        }`}
                      >
                        {subType === 'weekly' && (
                          <div className="absolute right-4 top-4 bg-orange-500 text-white p-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                          </div>
                        )}
                        
                        <div>
                          <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center text-xl mb-4 shadow-inner select-none">
                            🥗
                          </div>
                          <h4 className="text-base font-black text-gray-800">Weekly Plan</h4>
                          <p className="text-xs text-gray-400 font-bold mt-1">7 Days of deliveries</p>
                        </div>

                        <div className="mt-4 border-t border-gray-100/60 pt-4 w-full">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-[11px] text-gray-400 font-bold">Price per meal</span>
                            <span className="text-xs font-black text-gray-800">₹{basePricePerMeal}</span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-[11px] text-gray-400 font-bold">Total (7 meals)</span>
                            <span className="text-lg font-black text-orange-600">₹{basePricePerMeal * 7}</span>
                          </div>
                        </div>
                      </button>

                      {/* Monthly Card */}
                      <button
                        onClick={() => setSubType("monthly")}
                        className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 flex flex-col justify-between relative overflow-hidden h-60 ${
                          subType === 'monthly'
                            ? 'border-orange-500 bg-orange-50/10 shadow-lg shadow-orange-500/5 ring-1 ring-orange-500/10'
                            : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-md'
                        }`}
                      >
                        <div className="absolute top-4 right-4 flex items-center gap-1.5">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm">
                            Best Value 🔥
                          </span>
                          {subType === 'monthly' && (
                            <div className="bg-orange-500 text-white p-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center text-xl mb-4 shadow-inner select-none">
                            🍲
                          </div>
                          <h4 className="text-base font-black text-gray-800">Monthly Plan</h4>
                          <p className="text-xs text-gray-400 font-bold mt-1">30 Days of deliveries</p>
                        </div>

                        <div className="mt-4 border-t border-gray-100/60 pt-4 w-full">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-[11px] text-gray-400 font-bold">Price per meal</span>
                            <span className="text-xs font-black text-gray-800">₹{basePricePerMeal}</span>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="text-[11px] text-gray-400 font-bold">Total (30 meals)</span>
                            <span className="text-lg font-black text-orange-600">₹{basePricePerMeal * 30}</span>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Guarantee Info Strip */}
                    <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-4 relative overflow-hidden border border-slate-800 shadow-sm">
                      <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
                      <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl shrink-0">
                        <Award className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-white">Tiffin Connect Guarantee</h5>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Pause/resume deliveries from your dashboard. Paused days extend plan validity automatically.
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setStep(2)}
                        className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
                      >
                        <span>Proceed to Checkout</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
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
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl space-y-4">
                    <h3 className="text-base font-black text-gray-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                      <span>🧾 Pricing Summary</span>
                      <span className="text-[10px] font-extrabold uppercase bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                        {subType} plan
                      </span>
                    </h3>

                    {/* Math breakdown */}
                    <div className="space-y-2.5 text-xs font-bold text-gray-500">
                      <div className="flex justify-between items-center">
                        <span>Base Fare ({basePricePerMeal} / meal $\times$ {planMultiplier} meals)</span>
                        <span className="text-gray-800">₹{basePrice}.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Platform Processing Fee</span>
                        <span className="text-gray-800">₹{platformFee}.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Platform GST (5%)</span>
                        <span className="text-gray-800">₹{gstTax}.00</span>
                      </div>
                      
                      <div className="border-t border-slate-200 my-2 pt-3 flex justify-between items-center text-sm font-black text-gray-800">
                        <span>Grand Total</span>
                        <span className="text-orange-600 text-base">₹{grandTotal}.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Platform Security badge */}
                  <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100/50 flex gap-3 text-xs font-semibold text-orange-800">
                    <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-orange-950">Secure Transactions Guaranteed</h4>
                      <p className="text-[10px] text-orange-700/80 mt-0.5">
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
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">1. Platform Subscription Terms</h4>
                      <ul className="text-[11px] font-semibold text-gray-500 space-y-1.5 pl-4 list-disc">
                        <li>You can pause or restart your active plan deliveries at any time from your Customer Dashboard.</li>
                        <li>Subscription pausing must be triggered before the meal prep cutoff window (typically 12 hrs).</li>
                        <li>No direct partial refunds are provided for active cycles; paused days are credited.</li>
                      </ul>
                    </div>

                    {/* Dynamic Chef Guidelines */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">2. Chef Guidelines & Kitchen Rules</h4>
                      <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100 text-[11px] font-bold text-amber-900 leading-relaxed">
                        🧑‍🍳 <span className="font-extrabold text-amber-950">{kitchen.providerProfile?.businessName || kitchen.serviceName}</span>:
                        <p className="mt-1.5 italic font-semibold text-gray-600">
                          "{kitchen.providerProfile?.kitchenGuidelines || "Homestyle packaging, hygienic prep. Deliveries operate within specific neighborhood slots. Contact home chef directly for food customization requirements."}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Agrements Checkbox + CTA */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-4.5 w-4.5"
                      />
                      <span className="text-xs font-bold text-gray-500 leading-normal">
                        I agree to the platform subscription policy and special chef guidelines.
                      </span>
                    </label>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 border border-gray-200 hover:bg-slate-50 text-gray-500 font-bold text-xs rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        disabled={!agreed}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
                    <Loader className="w-10 h-10 text-orange-500 animate-spin" />
                    <div className="space-y-1.5">
                      <h4 className="text-base font-black text-gray-800 animate-pulse">Processing Payment</h4>
                      <p className="text-xs text-gray-400 font-bold tracking-wide uppercase">{payProgressText}</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl max-w-xs text-[10px] text-gray-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Secured with SSL 256-Bit Sandbox Security</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Method Selector */}
                    <div className="text-center space-y-1.5">
                      <h3 className="text-lg font-black text-gray-800">Secure Payment Simulation</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase">Grand Total: <span className="text-orange-500">₹{grandTotal}.00</span></p>
                    </div>

                    {/* Options Grid */}
                    <div className="space-y-3">
                      {/* UPI Option */}
                      <button
                        onClick={() => setPayMethod("gpay")}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 ${
                          payMethod === "gpay" 
                            ? "border-orange-500 bg-orange-50/20 ring-2 ring-orange-500/10" 
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-2 bg-gradient-to-tr from-orange-100 to-amber-100 rounded-xl">
                            <Wallet className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-800">UPI Instant checkout</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Google Pay / PhonePe / Paytm</p>
                          </div>
                        </div>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          payMethod === "gpay" ? "border-orange-500 bg-orange-500" : "border-gray-300"
                        }`}>
                          {payMethod === "gpay" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </button>

                      {/* Card Option */}
                      <button
                        onClick={() => setPayMethod("card")}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 ${
                          payMethod === "card" 
                            ? "border-orange-500 bg-orange-50/20 ring-2 ring-orange-500/10" 
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-2 bg-gradient-to-tr from-orange-100 to-amber-100 rounded-xl">
                            <CreditCard className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-800">Credit / Debit Card</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Visa, Mastercard, RuPay supported</p>
                          </div>
                        </div>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          payMethod === "card" ? "border-orange-500 bg-orange-500" : "border-gray-300"
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
                        className="space-y-3.5 bg-slate-50 p-4 border border-slate-100 rounded-2xl"
                      >
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-gray-400">Card Number</label>
                          <input 
                            type="text" 
                            placeholder="4111 2222 3333 4444" 
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                            className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-400">Expiry (MM/YY)</label>
                            <input 
                              type="text" 
                              placeholder="12/28" 
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                              className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-orange-500 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-400">CVV</label>
                            <input 
                              type="password" 
                              placeholder="***" 
                              maxLength="3"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                              className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:border-orange-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Security note & buttons */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex gap-2 text-[10px] text-gray-400 font-bold justify-center items-center">
                        <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Secured by SSL Simulated Sandbox Integration</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setStep(2)}
                          className="flex-1 py-3 border border-gray-200 hover:bg-slate-50 text-gray-500 font-bold text-xs rounded-xl transition-colors"
                        >
                          Back to summary
                        </button>
                        <button
                          onClick={startPaymentSimulation}
                          className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all duration-300"
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
                  {[...Array(20)].map((_, i) => {
                    const colors = ["bg-orange-500", "bg-amber-400", "bg-emerald-400", "bg-indigo-400", "bg-pink-400"];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    const left = Math.random() * 100;
                    const delay = Math.random() * 2;
                    const duration = 2 + Math.random() * 2;
                    
                    return (
                      <div 
                        key={i}
                        className={`absolute w-2 h-3.5 ${randomColor} rounded opacity-80 animate-[ping_1.5s_infinite]`}
                        style={{
                          left: `${left}%`,
                          top: `-10px`,
                          animationDelay: `${delay}s`,
                          animationDuration: `${duration}s`,
                          transform: `rotate(${Math.random() * 360}deg)`
                        }}
                      />
                    );
                  })}
                </div>

                <div className="space-y-4">
                  {/* Big Check Circle */}
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 shadow-md shadow-emerald-50 animate-bounce">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight flex items-center justify-center gap-1.5">
                      Subscription Active! <Sparkles className="w-5 h-5 text-amber-400 fill-current" />
                    </h3>
                    <p className="text-xs text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full inline-block">
                      Simulated Transaction Successful
                    </p>
                  </div>
                </div>

                {/* Sub Summary display */}
                <div className="p-5 rounded-3xl bg-slate-900 text-white text-left space-y-3 relative overflow-hidden border border-slate-800 shadow-xl">
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
                  
                  <h4 className="text-xs uppercase tracking-wider text-orange-400 font-extrabold border-b border-slate-800 pb-2">Plan Details</h4>
                  <div className="space-y-2 text-xs font-semibold text-slate-400">
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
                      <span className="text-emerald-400 font-bold">Enabled</span>
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
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300"
                  >
                    Go to My Subscriptions
                  </button>
                  <p className="text-[10px] text-gray-400 font-bold">
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
