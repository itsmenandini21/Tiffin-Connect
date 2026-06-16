import React, { useState, useEffect } from 'react';
import { MapPin, Phone, MessageSquare, Check, RotateCcw, ShoppingBag, Coffee, ChevronRight, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ActiveOrdersTab({ menus }) {
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [packedStates, setPackedStates] = useState({});
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (menus && menus.length > 0) {
      // Auto-select first menu if none selected yet
      if (!selectedMenuId || !menus.find(m => m._id === selectedMenuId)) {
        setSelectedMenuId(menus[0]._id);
      }
    }
  }, [menus, selectedMenuId]);

  // Find the currently selected menu object
  const activeMenu = menus.find(m => m._id === selectedMenuId);

  // Load persistent packed checklist states from localStorage on menu change
  useEffect(() => {
    if (activeMenu && activeMenu.subscribers) {
      const initialStates = {};
      activeMenu.subscribers.forEach(sub => {
        const key = `packed_${sub.subscriptionId}_${todayDate}`;
        const val = localStorage.getItem(key);
        initialStates[sub.subscriptionId] = val === 'true';
      });
      setPackedStates(initialStates);
    }
  }, [activeMenu, todayDate]);

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
    if (!activeMenu || !activeMenu.subscribers) return;
    if (window.confirm("Reset all packing checklist items for this menu today?")) {
      const nextStates = {};
      activeMenu.subscribers.forEach(sub => {
        const key = `packed_${sub.subscriptionId}_${todayDate}`;
        nextStates[sub.subscriptionId] = false;
        localStorage.removeItem(key);
      });
      setPackedStates(nextStates);
      toast.success("Checklist reset successfully!");
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
  const sectors = Object.keys(groupedSubscribers);

  // Total prepped count calculation
  const totalSubscribersCount = activeMenu?.subscribers?.length || 0;
  const totalPreppedCount = activeMenu?.subscribers
    ? activeMenu.subscribers.filter(sub => packedStates[sub.subscriptionId]).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Menu selector tab bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
          Select Tiffin Service Menu
        </label>
        <div className="flex flex-wrap gap-2">
          {menus.map((menu) => (
            <button
              key={menu._id}
              onClick={() => setSelectedMenuId(menu._id)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 border ${
                selectedMenuId === menu._id
                  ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-100'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{menu.title}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-lg ${
                selectedMenuId === menu._id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {menu.activeSubscribersCount || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeMenu && (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
          {/* Active Menu Header Info */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
                  {activeMenu.shift} Service 🍱
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {totalPreppedCount}/{totalSubscribersCount} Packed
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight mt-2">
                {activeMenu.title}
              </h2>
              <p className="text-xs font-bold text-gray-400 mt-0.5">
                Manage daily deliveries, special packaging, and check off meals as they get packed.
              </p>
            </div>

            {totalSubscribersCount > 0 && (
              <button
                onClick={resetAllPacked}
                className="px-4 py-2.5 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded-xl text-xs font-bold text-gray-600 hover:text-orange-600 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Daily Checklist</span>
              </button>
            )}
          </div>

          {/* Active Orders List */}
          {totalSubscribersCount === 0 ? (
            <div className="text-center py-16 space-y-3">
              <span className="text-4xl">🍲</span>
              <h4 className="text-base font-bold text-gray-800">No active subscribers yet</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                Once customers subscribe to this tiffin menu, their addresses, phone numbers, and packing checklist will be visible here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {sectors.map(sector => {
                const list = groupedSubscribers[sector];
                const sectorPackedCount = list.filter(sub => packedStates[sub.subscriptionId]).length;

                return (
                  <div key={sector} className="space-y-4">
                    {/* Sector Title Strip */}
                    <div className="flex justify-between items-center bg-slate-50/80 px-4 py-2 rounded-2xl border border-slate-100/50">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        {sector}
                      </span>
                      <span className="text-[10px] bg-orange-100 text-orange-700 font-extrabold px-2.5 py-0.5 rounded-full">
                        {sectorPackedCount}/{list.length} prepped
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
                                <div className="flex items-center gap-2 flex-wrap">
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
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
