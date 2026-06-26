import React, { useState } from 'react';
import { MapPin, Phone, MessageSquare, Check, RotateCcw, ShoppingBag, Coffee, ChevronRight, Inbox, Loader, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ActiveOrdersTab({ menus, onRefresh }) {
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [updatingBatch, setUpdatingBatch] = useState(false);

  if (menus.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200">
          <Inbox className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">No Active Menus</h3>
        <p className="text-gray-500 mt-2 max-w-sm">Create a menu in the dashboard to start receiving subscriber orders.</p>
      </div>
    );
  }

  const activeMenu = menus.find(m => m._id === selectedMenuId);

  // If no menu is selected, show the list of services (The drill-down root)
  if (!selectedMenuId || !activeMenu) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Select a Service</h2>
          <p className="text-gray-500 mb-6 text-sm">Choose a kitchen service below to view and manage its active orders.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map(menu => (
              <div 
                key={menu._id}
                onClick={() => setSelectedMenuId(menu._id)}
                className="p-6 bg-white border border-gray-200 rounded-3xl cursor-pointer hover:border-orange-500 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                      {menu.shift}
                    </span>
                    <div className="bg-gray-50 border border-gray-100 text-gray-700 px-3 py-1.5 rounded-xl text-center shadow-sm">
                      <span className="block text-xl font-black leading-none">{menu.deliverTodayCount || 0}</span>
                      <span className="block text-[8px] uppercase font-bold text-gray-400 mt-1">Orders</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-orange-500 transition-colors leading-tight">
                    {menu.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
                  <Coffee className="w-4 h-4 text-orange-400" />
                  <span className="font-bold text-xs">{(menu.startTime && menu.endTime) ? `${menu.startTime} - ${menu.endTime}` : "Timings not set"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Functions for the selected menu view ---

  const toggleDeliveryStatus = async (subId, currentStatus) => {
    let nextStatus = "pending";
    if (currentStatus === "pending") {
      nextStatus = "dispatched";
    } else if (currentStatus === "dispatched") {
      nextStatus = "delivered";
    }
    const loadingToast = toast.loading(`Updating order status to ${nextStatus}...`);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/subscription/updateSingleDeliveryStatus/${subId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update status");
      toast.success(`Status updated to ${nextStatus}!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Single update error:", err);
      toast.error(err.message || "Could not update status.");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const updateAllStatuses = async (status) => {
    if (!activeMenu) return;
    setUpdatingBatch(true);
    const loadingToast = toast.loading(`Updating all subscriber statuses to ${status}...`);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/subscription/updateDeliveryStatusAll/${activeMenu._id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update batch status");
      toast.success(`Batch successfully updated to ${status}!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Batch update error:", err);
      toast.error(err.message || "Failed to update batch status.");
    } finally {
      toast.dismiss(loadingToast);
      setUpdatingBatch(false);
    }
  };

  const resetAllPacked = async () => {
    if (!activeMenu || !activeMenu.subscribers) return;
    if (window.confirm("Reset all packing and delivery statuses for this menu today?")) {
      await updateAllStatuses("pending");
    }
  };

  // Group subscribers by Area/Sector
  const groupSubscribersByArea = () => {
    if (!activeMenu) return {};
    const grouped = {};
    const subs = activeMenu.subscribers || [];
    
    subs.forEach(sub => {
      const street = sub.customer?.address?.street || "Sector Area";
      const sector = street.split(',')[0].trim() || "Main Area";
      
      if (!grouped[sector]) {
        grouped[sector] = [];
      }
      grouped[sector].push(sub);
    });
    
    return grouped;
  };

  const groupedSubscribers = groupSubscribersByArea();
  
  // Filter grouped subscribers to only show undelivered ones
  const filteredGroupedSubscribers = {};
  Object.keys(groupedSubscribers).forEach(sector => {
    const list = groupedSubscribers[sector].filter(sub => sub.deliveryStatus !== 'delivered');
    if (list.length > 0) {
      filteredGroupedSubscribers[sector] = list;
    }
  });

  const sectors = Object.keys(filteredGroupedSubscribers);

  // Status counts
  const totalSubscribersCount = activeMenu?.subscribers?.length || 0;
  const totalPreppedCount = activeMenu?.subscribers
    ? activeMenu.subscribers.filter(sub => sub.deliveryStatus === "dispatched" || sub.deliveryStatus === "delivered").length
    : 0;

  const undeliveredCount = activeMenu?.subscribers
    ? activeMenu.subscribers.filter(sub => sub.deliveryStatus !== "delivered").length
    : 0;

  return (
    <div className="space-y-6">
      
      <button 
        onClick={() => setSelectedMenuId(null)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-500 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Services
      </button>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
        {/* Active Menu Header Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
                {activeMenu.shift} Service 🍱
              </span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {totalPreppedCount}/{totalSubscribersCount} Processed
              </span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Coffee className="w-3 h-3" /> {(activeMenu.startTime && activeMenu.endTime) ? `${activeMenu.startTime} - ${activeMenu.endTime}` : "Timings not set"}
              </span>
            </div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight mt-2">
              {activeMenu.title}
            </h2>
            <p className="text-xs font-bold text-gray-400 mt-0.5">
              Manage daily delivery stages, dispatch whole sectors at once, and view receipt confirmations in real-time.
            </p>
          </div>

          {totalSubscribersCount > 0 && (
            <button
              onClick={resetAllPacked}
              disabled={updatingBatch}
              className="px-4 py-2.5 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded-xl text-xs font-bold text-gray-600 hover:text-orange-600 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Daily Checklist</span>
            </button>
          )}
        </div>

        {/* Master Batch Status Controller Panel */}
        {totalSubscribersCount > 0 && (
          <div className="bg-orange-50/35 border border-orange-100/50 p-4.5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-inner">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-xs font-black text-orange-950 flex items-center gap-1.5 justify-center sm:justify-start">
                🚀 Batch Delivery Controller
              </h4>
              <p className="text-[10px] text-orange-900/70 font-semibold leading-normal">
                Update statuses for all active subscribers of this menu in a single click.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center shrink-0">
              <button
                onClick={() => updateAllStatuses("pending")}
                disabled={updatingBatch}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-gray-200 text-gray-700 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
              >
                🍳 Start Prep
              </button>
              <button
                onClick={() => updateAllStatuses("dispatched")}
                disabled={updatingBatch}
                className="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-500/10 flex items-center gap-1 disabled:opacity-50"
              >
                🛵 Dispatch All
              </button>
            </div>
          </div>
        )}

        {/* Active Orders List */}
        {totalSubscribersCount === 0 ? (
          <div className="text-center py-16 space-y-3">
            <span className="text-4xl">🍲</span>
            <h4 className="text-base font-bold text-gray-800">No active subscribers yet</h4>
            <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
              Once customers subscribe to this tiffin menu, their addresses, phone numbers, and packing checklist will be visible here.
            </p>
          </div>
        ) : undeliveredCount === 0 ? (
          <div className="bg-emerald-50/30 border border-dashed border-emerald-200 p-12 rounded-[2rem] text-center space-y-4 my-6">
            <div className="w-20 h-20 bg-emerald-100/60 rounded-full flex items-center justify-center mx-auto border border-emerald-200 animate-bounce">
              <span className="text-4xl">🎉</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-emerald-950 tracking-tight">All Orders Delivered!</h3>
              <p className="text-xs text-emerald-700/80 font-bold max-w-sm mx-auto leading-relaxed">
                Sabhi active subscribers ko unka tiffin deliver ho gaya hai. Aap daily checklist reset karne ke liye "Reset Daily Checklist" use kar sakte hain.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sectors.map(sector => {
              const list = filteredGroupedSubscribers[sector];
              const originalList = groupedSubscribers[sector];
              const sectorPackedCount = originalList.filter(sub => sub.deliveryStatus === "dispatched" || sub.deliveryStatus === "delivered").length;

              return (
                <div key={sector} className="space-y-4">
                  {/* Sector Title Strip */}
                  <div className="flex justify-between items-center bg-slate-50/80 px-4 py-2 rounded-2xl border border-slate-100/50">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      {sector}
                    </span>
                    <span className="text-[10px] bg-orange-100 text-orange-700 font-extrabold px-2.5 py-0.5 rounded-full">
                      {sectorPackedCount}/{originalList.length} prepped
                    </span>
                  </div>

                  {/* Subscribers of this Sector */}
                  <div className="space-y-3">
                    {list.map(sub => {
                      const isPacked = sub.deliveryStatus === 'dispatched' || sub.deliveryStatus === 'delivered';
                      const isSkipped = sub.isSkippedToday;
                      const isPaused = sub.status === 'paused';
                      
                      let cardClass = "bg-white border border-gray-100 hover:shadow-md hover:border-gray-200";
                      if (sub.deliveryStatus === 'delivered') {
                        cardClass = "bg-emerald-50/40 border-2 border-emerald-500/20";
                      } else if (sub.deliveryStatus === 'dispatched') {
                        cardClass = "bg-orange-50/15 border-2 border-orange-500/20";
                      } else if (isSkipped) {
                        cardClass = "bg-red-50/20 border border-red-100 opacity-75";
                      } else if (isPaused) {
                        cardClass = "bg-amber-50/20 border border-amber-100 opacity-75";
                      }

                      return (
                        <div 
                          key={sub.subscriptionId}
                          className={`p-4 rounded-2xl transition-all duration-300 flex flex-col justify-between gap-3 ${cardClass}`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-gray-800">
                                  {sub.customer?.name}
                                </h4>
                                
                                {/* Status badges */}
                                {isSkipped && (
                                  <span className="text-[9px] font-extrabold text-red-700 bg-red-100/50 px-2 py-0.2 rounded border border-red-200 shrink-0">
                                    Skipped today 🚫
                                  </span>
                                )}
                                {isPaused && (
                                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100/50 px-2 py-0.2 rounded border border-amber-200 shrink-0">
                                    Paused ⏸️
                                  </span>
                                )}
                                {!isSkipped && !isPaused && sub.deliveryStatus === 'pending' && (
                                  <span className="text-[9px] font-extrabold text-gray-600 bg-gray-100 px-2 py-0.2 rounded border border-gray-200 shrink-0 animate-pulse">
                                    Preparing 🍳
                                  </span>
                                )}
                                {!isSkipped && !isPaused && sub.deliveryStatus === 'dispatched' && (
                                  <span className="text-[9px] font-extrabold text-orange-700 bg-orange-100/60 px-2 py-0.2 rounded border border-orange-200 shrink-0">
                                    Dispatched 🛵
                                  </span>
                                )}
                                {!isSkipped && !isPaused && sub.deliveryStatus === 'delivered' && (
                                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/60 px-2 py-0.2 rounded border border-emerald-200 shrink-0">
                                    Delivered 💚
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                                <Phone className="w-3 h-3 text-gray-400" /> {sub.customer?.phoneNumber}
                              </p>
                              
                              <p className="text-xs text-gray-400 leading-normal font-medium mt-1">
                                {sub.customer?.address?.street || "No street"}, {sub.customer?.address?.city || "No City"}
                              </p>
                            </div>

                            {/* Checklist checkbox */}
                            {!isSkipped && !isPaused && (
                              <button
                                onClick={() => toggleDeliveryStatus(sub.subscriptionId, sub.deliveryStatus)}
                                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                                  isPacked 
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200' 
                                    : 'border-gray-200 bg-white hover:border-orange-300 text-transparent hover:text-orange-500'
                                }`}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Chef Special instruction bubble */}
                          {sub.specialInstruction && (
                            <div className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-100/50 flex gap-2 items-start">
                              <MessageSquare className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                              <p className="text-[11px] font-bold text-orange-950 leading-relaxed">
                                {sub.specialInstruction}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
