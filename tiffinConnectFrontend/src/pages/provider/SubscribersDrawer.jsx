import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Phone, MessageSquare, Check, RotateCcw } from 'lucide-react';

export default function SubscribersDrawer({ menu, onClose }) {
  const [packedStates, setPackedStates] = useState({});
  const todayDate = new Date().toISOString().split('T')[0];

  // Load persistent packed checklist states from localStorage on mount
  useEffect(() => {
    if (menu && menu.subscribers) {
      const initialStates = {};
      menu.subscribers.forEach(sub => {
        const key = `packed_${sub.subscriptionId}_${todayDate}`;
        const val = localStorage.getItem(key);
        initialStates[sub.subscriptionId] = val === 'true';
      });
      setPackedStates(initialStates);
    }
  }, [menu, todayDate]);

  if (!menu) return null;

  const togglePacked = (subId) => {
    const key = `packed_${subId}_${todayDate}`;
    const nextState = !packedStates[subId];
    setPackedStates(prev => ({
      ...prev,
      [subId]: nextState
    }));
    localStorage.setItem(key, String(nextState));
  };

  const resetAllPacked = () => {
    if (window.confirm("Reset all packing checklist items for this menu today?")) {
      const nextStates = {};
      menu.subscribers.forEach(sub => {
        const key = `packed_${sub.subscriptionId}_${todayDate}`;
        nextStates[sub.subscriptionId] = false;
        localStorage.removeItem(key);
      });
      setPackedStates(nextStates);
    }
  };

  // Group subscribers by Area/Sector
  const groupSubscribersByArea = () => {
    const grouped = {};
    const subs = menu.subscribers || [];
    
    subs.forEach(sub => {
      // Extract sector name from address (default to street name, or Noida)
      const street = sub.customer?.address?.street || "Sector Area";
      // Normalize a bit to group same sectors
      const sector = street.split(',')[0].trim() || "Main Area";
      
      if (!grouped[sector]) {
        grouped[sector] = [];
      }
      grouped[sector].push(sub);
    });
    
    return grouped;
  };

  const groupedSubscribers = groupSubscribersByArea();
  const sectors = Object.keys(groupedSubscribers);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Sliding Drawer Container */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-white h-screen shadow-2xl flex flex-col z-10"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50/50 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
              {menu.shift} Service 🍱
            </span>
            <h2 className="text-xl font-black text-gray-800 tracking-tight mt-1">
              {menu.title}
            </h2>
            <p className="text-xs font-bold text-gray-400 mt-0.5">
              Active Subscribers: <span className="text-orange-500 font-extrabold">{menu.activeSubscribersCount}</span>
            </p>
          </div>

          <div className="flex gap-2">
            {menu.subscribers?.length > 0 && (
              <button 
                onClick={resetAllPacked}
                title="Reset daily checklist"
                className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-orange-50 hover:text-orange-600 text-gray-400 transition-colors shadow-sm focus:outline-none"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-orange-50 hover:text-orange-600 text-gray-400 transition-colors shadow-sm focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          
          {menu.subscribers?.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <span className="text-4xl">🍲</span>
              <h4 className="text-sm font-bold text-gray-800">No active subscribers yet</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Once customers subscribe to this menu option daily, they will appear here grouped by sector area.
              </p>
            </div>
          ) : (
            sectors.map(sector => {
              const list = groupedSubscribers[sector];
              const packedCount = list.filter(sub => packedStates[sub.subscriptionId]).length;
              
              return (
                <div key={sector} className="space-y-3">
                  {/* Sector Title Strip */}
                  <div className="flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      {sector}
                    </span>
                    <span className="text-[10px] bg-orange-100 text-orange-700 font-extrabold px-2.5 py-0.5 rounded-full">
                      {packedCount}/{list.length} prepped
                    </span>
                  </div>

                  {/* Subscribers of this Sector */}
                  <div className="space-y-3">
                    {list.map(sub => {
                      const isPacked = packedStates[sub.subscriptionId] || false;
                      const isSkipped = sub.isSkippedToday;
                      const isPaused = sub.status === 'paused';
                      
                      let cardClass = "bg-white border border-gray-100 hover:shadow-md hover:border-gray-200";
                      if (isPacked) {
                        cardClass = "bg-slate-50/70 border border-slate-200/50 opacity-60";
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
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm font-bold text-gray-800 ${isPacked ? 'line-through text-gray-400' : ''}`}>
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
                                {isPacked && (
                                  <span className="text-[9px] font-extrabold text-orange-700 bg-orange-100/50 px-2 py-0.2 rounded border border-orange-200 shrink-0">
                                    Prepped 🧡
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                                <Phone className="w-3 h-3 text-gray-400" /> {sub.customer?.phoneNumber}
                              </p>
                              
                              <p className="text-xs text-gray-400 leading-normal font-medium mt-1">
                                {sub.customer?.address?.street}, {sub.customer?.address?.city}
                              </p>
                            </div>

                            {/* Checklist checkbox (Only for active & not skipped orders) */}
                            {!isSkipped && !isPaused && (
                              <button
                                onClick={() => togglePacked(sub.subscriptionId)}
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
            })
          )}

        </div>
      </motion.div>
    </div>
  );
}
