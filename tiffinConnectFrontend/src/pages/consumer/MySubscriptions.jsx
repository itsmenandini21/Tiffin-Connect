import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  CalendarDays, 
  Play, 
  Trash2, 
  Clock, 
  ArrowLeft, 
  AlertTriangle,
  RefreshCw,
  Plus,
  Edit2,
  Check,
  X,
  MessageSquare
} from 'lucide-react';
import ConsumerNavbar from '../../components/ConsumerNavbar';

export default function MySubscriptions() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Cancel Confirmation States
  const [selectedSubForCancel, setSelectedSubForCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Calendar Skip Modal States
  const [selectedSubForCalendar, setSelectedSubForCalendar] = useState(null);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [togglingSkip, setTogglingSkip] = useState(false);

  // Special Note States
  const [editInstructionId, setEditInstructionId] = useState(null);
  const [instructionText, setInstructionText] = useState("");
  const [savingInstruction, setSavingInstruction] = useState(false);

  // Fetch subscriptions from the live API
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Please log in to view your subscriptions.");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/subscription`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const data = await response.json();
      setSubscriptions(data);
    } catch (err) {
      console.error("Fetch subscriptions error:", err);
      toast.error("Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubscriptions();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);



  // Update Chef Instruction Note handler
  const handleUpdateInstruction = async (subId) => {
    if (savingInstruction) return;
    setSavingInstruction(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/subscription/updateInstruction/${subId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          specialInstruction: instructionText
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update instructions");
      }

      toast.success(data.message || "Instructions updated successfully!");
      setEditInstructionId(null);
      fetchSubscriptions(); // Refresh UI to show updated note
    } catch (err) {
      console.error("Update instruction error:", err);
      toast.error(err.message || "Failed to update instructions.");
    } finally {
      setSavingInstruction(false);
    }
  };

  // Resume subscription handler
  const handleResumeSubscription = async (subId) => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/subscription/update/${subId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "active"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resume subscription");
      }

      toast.success(data.message || "Subscription resumed successfully!");
      fetchSubscriptions(); // Refresh UI
    } catch (err) {
      console.error("Resume subscription error:", err);
      toast.error(err.message || "Failed to resume subscription.");
    }
  };

  // Cancel subscription handler (permanent deletion)
  const handleCancelSubscription = async () => {
    if (!selectedSubForCancel) return;
    setCancelling(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/subscription/delete/${selectedSubForCancel._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel subscription");
      }

      toast.success(data.message || "Subscription deleted successfully!");
      setSelectedSubForCancel(null);
      fetchSubscriptions(); // Refresh UI
    } catch (err) {
      console.error("Cancel subscription error:", err);
      toast.error(err.message || "Failed to cancel subscription.");
    } finally {
      setCancelling(false);
    }
  };

  // Toggle skip date handler
  const handleToggleSkip = async (dateStr) => {
    if (!selectedSubForCalendar || togglingSkip) return;
    setTogglingSkip(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/subscription/toggle/${selectedSubForCalendar._id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ date: dateStr })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update date status");
      }

      toast.success(data.message || "Schedule updated successfully!");
      
      // Update local modal state dynamically so it toggles instantly in real-time!
      setSelectedSubForCalendar(data.subscription || data.updatedSubscription);
      
      // Refresh the main subscriptions list
      fetchSubscriptions();
    } catch (err) {
      console.error("Toggle skip error:", err);
      toast.error(err.message || "Failed to update date status.");
    } finally {
      setTogglingSkip(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-[#FFF4EC] pb-20 relative font-sans">
      
      {/* Background container with overflow-hidden to contain blur shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Premium Photographic Texture */}
        <div 
          className="absolute inset-0 opacity-[0.08] mix-blend-multiply" 
          style={{ 
            backgroundImage: "url('/bg-pattern.png')", 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }} 
        />
        
        {/* Warm Peach/Apricot Gradient Overlay (Removes the harsh white) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF4EC]/95 via-[#FFE8D6]/80 to-[#FFF0E6]/95 backdrop-blur-[1px]" />

        {/* Decorative Glow sphere background - Richer colors for a painted background effect */}
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-gradient-to-tr from-[#FF7A00]/15 to-amber-400/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[-15%] w-[700px] h-[700px] bg-rose-400/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-[#FF7A00]/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar component */}
      <ConsumerNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        
        {/* Back navigation header */}
        <div className="mb-6 flex items-center gap-4">
          <Link 
            to="/consumer-dashboard"
            className="p-2.5 rounded-xl bg-white border border-[#FF7A00]/10 hover:border-[#FF7A00]/30 hover:bg-[#FFF8F1] hover:text-[#FF7A00] text-[#6B7280] transition-all duration-300 shadow-[0_4px_20px_rgba(255,122,0,0.02)] flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#FF7A00] bg-[#FF7A00]/10 px-2.5 py-0.5 rounded-full border border-[#FF7A00]/15">
              Manage Plans
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-[#2D2D2D] tracking-tight mt-1 flex items-center gap-2 font-sans">
              My Subscriptions <CalendarDays className="w-7 h-7 text-[#FF7A00]" />
            </h1>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <RefreshCw className="w-10 h-10 text-[#FF7A00] animate-spin" />
            <p className="text-sm font-bold text-[#6B7280]">Loading your healthy homestyle plans...</p>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {subscriptions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/60 shadow-[0_8px_30px_rgba(255,122,0,0.04)] max-w-xl mx-auto mt-8 relative overflow-hidden ring-1 ring-white/50"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A00]/5 rounded-full blur-3xl pointer-events-none" />
                <span className="text-5xl">🍲</span>
                <h3 className="text-xl font-bold text-[#2D2D2D] mt-5">No Active Subscriptions</h3>
                <p className="text-sm text-[#6B7280] mt-2 font-medium max-w-md mx-auto leading-relaxed">
                  You haven't subscribed to any home kitchen plans yet. Explore Noida's finest home chefs and start eating healthy homestyle meals daily!
                </p>
                <Link 
                  to="/consumer-dashboard"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#FF7A00]/20 hover:shadow-[#FF7A00]/40 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  Explore Kitchens
                </Link>
              </motion.div>
            ) : (
              /* Active Subscriptions Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {subscriptions.map((sub) => {
                  const kitchen = sub.tiffinServiceId || {};
                  const isPaused = sub.status === 'paused';
                  
                  return (
                    <motion.div
                      key={sub._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(255,122,0,0.04)] overflow-hidden flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(255,122,0,0.12)] hover:border-[#FF7A00]/30 hover:bg-white/95 transition-all duration-300 relative group"
                    >
                      {/* Top Accent Gradient Border */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${isPaused ? 'from-amber-400 to-[#FF7A00]' : 'from-[#22C55E] to-emerald-400'}`} />
                      
                      <div className="p-6 space-y-4 flex-grow">
                        {/* Header Details */}
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#FF7A00] bg-[#FF7A00]/10 px-2.5 py-0.5 rounded-full border border-[#FF7A00]/15">
                              {kitchen.foodType || "Homestyle Kitchen"}
                            </span>
                            <h3 className="text-lg font-bold text-[#2D2D2D] mt-2.5 line-clamp-1">
                              {kitchen.title || "Swad ki Rasoi"}
                            </h3>
                            <p className="text-xs text-[#6B7280] font-bold mt-0.5">
                              Plan Type: <span className="text-[#FF7A00] uppercase">{sub.planType}</span>
                            </p>
                          </div>

                          {/* Status Badge */}
                          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border shadow-sm ${
                            sub.status === 'paused' 
                              ? 'bg-amber-50 border-amber-200 text-amber-700' 
                              : sub.status === 'completed' || sub.status === 'expired'
                              ? 'bg-gray-100 border-gray-300 text-gray-600'
                              : 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]'
                          }`}>
                            {sub.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2">
                          {kitchen.description || "Freshly cooked homestyle food prepared with seasonal, clean ingredients."}
                        </p>

                        {/* Cost detail */}
                        <div className="flex justify-between items-center bg-[#FFF8F1] p-3 rounded-2xl border border-[#FF7A00]/10">
                          <div>
                            <p className="text-[10px] text-[#6B7280] font-bold uppercase">Estimated Price</p>
                            <p className="text-sm font-black text-[#2D2D2D] mt-0.5">
                              ₹{kitchen.pricePerMeal || 120} <span className="text-[10px] font-semibold text-[#6B7280]">/ meal</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-[#6B7280] font-bold uppercase">Meals Left</p>
                            <p className="text-xs font-bold text-[#2D2D2D] mt-0.5">
                              {sub.status === 'completed' || sub.status === 'expired' 
                                ? '0' 
                                : sub.mealsRemaining || (sub.planType === 'weekly' ? 7 : 30)} / {sub.totalMeals || (sub.planType === 'weekly' ? 7 : 30)}
                            </p>
                          </div>
                        </div>

                        {/* Chef Special Instructions note section */}
                        <div className="bg-[#FF7A00]/5 border border-[#FF7A00]/10 rounded-2xl p-4.5 space-y-3 relative overflow-hidden transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#FF7A00] bg-[#FF7A00]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-[#FF7A00] shrink-0" />
                              Note for Chef
                            </span>
                            {editInstructionId !== sub._id && (
                              <button
                                onClick={() => {
                                  setEditInstructionId(sub._id);
                                  setInstructionText(sub.specialInstruction || "");
                                }}
                                className="text-[10px] font-black text-[#FF7A00] hover:text-[#E56700] flex items-center gap-1 hover:underline select-none transition-colors"
                              >
                                <Edit2 className="w-3 h-3" />
                                {sub.specialInstruction ? "Edit" : "Add Note"}
                              </button>
                            )}
                          </div>

                          {editInstructionId === sub._id ? (
                            <div className="space-y-2 mt-1 transition-all duration-300">
                              <textarea
                                value={instructionText}
                                onChange={(e) => setInstructionText(e.target.value)}
                                placeholder="e.g. Please make it medium spicy, deliver before 1:30 PM..."
                                rows="2"
                                className="w-full bg-white px-3 py-2 rounded-xl border border-[#FF7A00]/20 text-xs font-semibold focus:border-[#FF7A00] focus:outline-none focus:ring-1 focus:ring-[#FF7A00] resize-none transition-all text-[#2D2D2D]"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditInstructionId(null)}
                                  disabled={savingInstruction}
                                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-[#FFF8F1] text-[#6B7280] hover:text-[#2D2D2D] transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateInstruction(sub._id)}
                                  disabled={savingInstruction}
                                  className="p-1.5 bg-gradient-to-r from-[#FF7A00] to-[#E56700] text-white rounded-lg hover:shadow-md hover:shadow-[#FF7A00]/10 transition-all flex items-center justify-center disabled:opacity-50"
                                >
                                  {savingInstruction ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className={`text-xs leading-relaxed font-semibold ${sub.specialInstruction ? 'text-[#2D2D2D]' : 'text-[#6B7280] italic'}`}>
                              {sub.specialInstruction || "No special instructions added. Tap Add Note to send specific requests to your chef."}
                            </p>
                          )}
                        </div>

                        {/* Paused Resume Info Banner */}
                        {isPaused && (
                          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-[11px] font-bold text-amber-800 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Automatically restarts on {formatDate(sub.resumeDate)}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions Panel */}
                      <div className="p-6 pt-0 border-t border-[#FF7A00]/5 bg-[#FFF8F1]/50 flex items-center justify-between gap-3">
                        {isPaused ? (
                          /* Resume Button for Paused Plans */
                          <button
                            onClick={() => handleResumeSubscription(sub._id)}
                            className="flex-grow py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-250 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Resume Subscription</span>
                          </button>
                        ) : (
                          /* Manage Skips Calendar Button for Active Plans */
                          <button
                            onClick={() => {
                              setSelectedSubForCalendar(sub);
                              setCalendarYear(new Date().getFullYear());
                              setCalendarMonth(new Date().getMonth());
                            }}
                            className="flex-grow py-2.5 px-4 bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#FF7A00]/10 hover:shadow-[#FF7A00]/25 transition-all duration-300 flex items-center justify-center gap-1.5 shrink-0"
                            title="Manage Skip Days"
                          >
                            <CalendarDays className="w-4 h-4" />
                            <span>Manage Skip Days</span>
                          </button>
                        )}

                        {/* Cancel Button */}
                        <button
                          onClick={() => setSelectedSubForCancel(sub)}
                          className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-100 hover:border-red-300 transition-all duration-300 flex items-center justify-center shrink-0"
                          title="Cancel Subscription"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* 2. Cancel Confirmation Modal */}
      <AnimatePresence>
        {selectedSubForCancel && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSelectedSubForCancel(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full border border-[#FF7A00]/10 z-10 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-[#2D2D2D]">Cancel Subscription?</h3>
                <p className="text-xs text-[#6B7280] font-medium leading-relaxed">
                  Are you sure you want to permanently delete your subscription to <span className="font-extrabold text-[#2D2D2D]">{selectedSubForCancel.tiffinServiceId?.title || "this kitchen"}</span>? This action is permanent and cannot be undone.
                </p>
              </div>

              {/* Warning box */}
              <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100/50 text-[11px] text-red-800 font-semibold text-center">
                ⚠️ Your daily deliveries will stop immediately.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedSubForCancel(null)}
                  className="flex-1 py-3 px-4 border border-[#FF7A00]/20 hover:bg-[#FF7A00]/5 text-[#6B7280] font-bold text-xs rounded-xl transition-colors"
                >
                  No, Keep it
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? "Deleting..." : "Yes, Cancel Plan"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Manage Skip Days Calendar Modal */}
      <AnimatePresence>
        {selectedSubForCalendar && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setSelectedSubForCalendar(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full border border-[#FF7A00]/10 z-10 space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#FF7A00] bg-[#FF7A00]/10 px-2.5 py-0.5 rounded-full border border-[#FF7A00]/15">
                    Meal Scheduler 🗓️
                  </span>
                  <h3 className="text-lg font-black text-[#2D2D2D] mt-1">
                    Manage Skip Days
                  </h3>
                  <p className="text-xs text-[#6B7280] font-bold mt-0.5">
                    🍱 {selectedSubForCalendar.tiffinServiceId?.title || "Your Home Kitchen"}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedSubForCalendar(null)}
                  className="p-1.5 rounded-xl border border-[#FF7A00]/20 hover:bg-[#FFF8F1] hover:text-[#FF7A00] text-[#6B7280] transition-colors shadow-sm focus:outline-none"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              {/* Legend Strip */}
              <div className="grid grid-cols-3 gap-2 p-2 bg-[#FFF8F1] border border-[#FF7A00]/10 rounded-2xl text-[10px] font-bold text-center">
                <div className="flex items-center gap-1 justify-center text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Delivery 🍱</span>
                </div>
                <div className="flex items-center gap-1 justify-center text-rose-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Skipped 🚫</span>
                </div>
                <div className="flex items-center gap-1 justify-center text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  <span>Empty 💤</span>
                </div>
              </div>

              {/* Skip Instructions Banner */}
              <div className="p-3.5 rounded-2xl bg-[#FF7A00]/5 border border-[#FF7A00]/10 text-center space-y-1">
                <p className="text-xs font-black text-[#FF7A00]">
                  Select dates if you want to skip deliveries 🗓️
                </p>
                <p className="text-[10px] text-[#6B7280] font-semibold leading-normal">
                  Tap any scheduled delivery day (🍱) to skip. Skipped dates will automatically extend your plan.
                </p>
              </div>

              {/* Calendar Control Area */}
              <div className="space-y-4">
                {/* Month Name & Change Toggles */}
                <div className="flex justify-between items-center bg-[#FFF8F1] p-2 rounded-2xl border border-[#FF7A00]/10">
                  <button 
                    onClick={() => {
                      if (calendarMonth === 0) {
                        setCalendarMonth(11);
                        setCalendarYear(calendarYear - 1);
                      } else {
                        setCalendarMonth(calendarMonth - 1);
                      }
                    }}
                    className="p-1.5 bg-white rounded-xl border border-[#FF7A00]/10 hover:border-[#FF7A00]/30 text-[#6B7280] hover:text-[#FF7A00] transition-all font-bold focus:outline-none"
                  >
                    ◀
                  </button>
                  <span className="text-xs font-black text-[#2D2D2D]">
                    {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => {
                      if (calendarMonth === 11) {
                        setCalendarMonth(0);
                        setCalendarYear(calendarYear + 1);
                      } else {
                        setCalendarMonth(calendarMonth + 1);
                      }
                    }}
                    className="p-1.5 bg-white rounded-xl border border-[#FF7A00]/10 hover:border-[#FF7A00]/30 text-[#6B7280] hover:text-[#FF7A00] transition-all font-bold focus:outline-none"
                  >
                    ▶
                  </button>
                </div>

                {/* Week Day Labels */}
                <div className="grid grid-cols-7 text-center text-[10px] uppercase tracking-wider font-extrabold text-[#6B7280]">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="py-0.5">{day}</div>
                  ))}
                </div>

                {/* Calendar Days Matrix */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Calendar starting day offsets */}
                  {[...Array(new Date(calendarYear, calendarMonth, 1).getDay())].map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Monthly grid render */}
                  {[...Array(new Date(calendarYear, calendarMonth + 1, 0).getDate())].map((_, i) => {
                    const dayVal = i + 1;
                    
                    // Safe local format mapping YYYY-MM-DD
                    const yearStr = calendarYear;
                    const monthStr = String(calendarMonth + 1).padStart(2, '0');
                    const dayStr = String(dayVal).padStart(2, '0');
                    const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
                    
                    const targetDate = new Date(calendarYear, calendarMonth, dayVal);
                    targetDate.setHours(0,0,0,0);
                    
                    const startDt = new Date(selectedSubForCalendar.startDate);
                    startDt.setHours(0,0,0,0);
                    
                    const endDt = new Date(selectedSubForCalendar.extendedEndDate || selectedSubForCalendar.originalEndDate);
                    endDt.setHours(0,0,0,0);
                    
                    const today = new Date();
                    today.setHours(0,0,0,0);

                    const isPast = targetDate < today;
                    const isInPlan = targetDate >= startDt && targetDate <= endDt;
                    const isSkipped = selectedSubForCalendar.skippedDates?.includes(dateStr);

                    let btnClass = "bg-slate-50 border border-slate-100 text-slate-350 cursor-not-allowed";
                    let isClickable = false;

                    if (isInPlan) {
                      isClickable = !isPast; // Block past date selection
                      if (isSkipped) {
                        btnClass = isPast 
                          ? "bg-slate-100 border border-slate-200 text-rose-300 line-through"
                          : "bg-rose-50 border-2 border-rose-500 text-rose-750 font-extrabold shadow-sm hover:bg-rose-100/50";
                      } else {
                        btnClass = isPast
                          ? "bg-slate-100 border border-slate-200 text-emerald-300"
                          : "bg-emerald-50 border-2 border-emerald-500 text-emerald-750 font-extrabold shadow-sm hover:bg-emerald-100/50";
                      }
                    }

                    return (
                      <button
                        key={dayVal}
                        disabled={!isClickable || togglingSkip}
                        onClick={() => handleToggleSkip(dateStr)}
                        className={`aspect-square rounded-xl text-xs flex flex-col items-center justify-center transition-all duration-300 relative select-none focus:outline-none ${btnClass}`}
                      >
                        <span>{dayVal}</span>
                        {isInPlan && !isSkipped && (
                          <span className="text-[9px] mt-0.5 filter drop-shadow-sm pointer-events-none">🍱</span>
                        )}
                        {isInPlan && isSkipped && (
                          <span className="text-[9px] mt-0.5 filter drop-shadow-sm pointer-events-none">🚫</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status details summaries footer card */}
              <div className="p-4 rounded-2xl bg-[#2D2D2D] text-white flex flex-col gap-1.5 relative overflow-hidden border border-[#FF7A00]/10 shadow-lg">
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex justify-between items-center text-xs font-black text-[#FF7A00] border-b border-[#FF7A00]/10 pb-2">
                  <span>Plan Expiry Adjuster</span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                    Auto-Extend Active
                  </span>
                </div>
                <div className="space-y-1 text-[10px] font-bold text-gray-300">
                  <div className="flex justify-between">
                    <span>Skipped Deliveries:</span>
                    <span className="text-white font-extrabold">{selectedSubForCalendar.skippedDates?.length || 0} meals</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Original Expiry Date:</span>
                    <span className="text-slate-300 font-semibold">{formatDate(selectedSubForCalendar.originalEndDate)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#FF7A00]/10 pt-1.5 text-xs text-white font-extrabold">
                    <span>Adjusted Expiry Date:</span>
                    <span className="text-[#FF7A00] font-black">{formatDate(selectedSubForCalendar.extendedEndDate || selectedSubForCalendar.originalEndDate)}</span>
                  </div>
                </div>
              </div>

              {/* Back to actions */}
              <div className="flex justify-end pt-2 border-t border-[#FF7A00]/10">
                <button
                  onClick={() => setSelectedSubForCalendar(null)}
                  className="w-full py-3.5 bg-gradient-to-r from-[#FF7A00] to-[#E56700] hover:from-[#E56700] hover:to-[#FF7A00] text-white font-extrabold text-xs rounded-xl shadow-md transition-all duration-300"
                >
                  Save Schedule & Return
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
