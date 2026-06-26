import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, User, LogOut, Settings, CalendarDays, ChevronDown, Bell, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConsumerNavbar() {
  const navigate = useNavigate();
  const navRef = React.useRef(null);

  // Dropdown visibility state:
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch actual logged-in user from localStorage:
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const user = {
    name: storedUser.name || "Nandini Mehrotra",
    email: storedUser.email || "nandini@tiffinconnect.com",
    profilePic: storedUser.profilePic || ""
  };

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch(`${API_URL}/notifications`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        }
    } catch (err) {
        console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
      fetchNotifications();
      // Polling every 1 minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/notifications/read/${id}`, {
            method: 'PUT',
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            fetchNotifications();
        }
    } catch (err) {
        console.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            fetchNotifications();
        }
    } catch (err) {
        console.error("Failed to mark all as read");
    }
  };

  const handleConfirmDelivery = async (notifId, subscriptionId) => {
    const token = localStorage.getItem('token');
    try {
        // 1. Confirm delivery
        const res = await fetch(`${API_URL}/subscription/confirmDelivery/${subscriptionId}`, {
            method: 'PUT',
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
            toast.success("Delivery Confirmed! Enjoy your meal 💚", {
                icon: '🍲',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            // 2. Mark notification as read
            await markAsRead(notifId);
        } else {
            toast.error("Failed to confirm delivery");
        }
    } catch (err) {
        console.error("Confirm delivery error:", err);
        toast.error("An error occurred");
    }
  };

  // Logout function:
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Logged out successfully!");
    navigate('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b border-gray-200/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <Link to="/consumer-dashboard" className="flex items-center gap-2 group">
            <div className="p-2 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
              <Utensils className="w-6 h-6 text-orange-500" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Tiffin<span className="text-orange-500">Connect</span>
              <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 font-bold border border-orange-500/20">
                Customer
              </span>
            </span>
          </Link>

          {/* Right Side: Profile & Actions */}
          <div className="flex items-center gap-4" ref={navRef}>
            
            {/* View Subscriptions Shortcut Button */}
            <Link 
              to="/my-subscriptions" 
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 font-bold border border-gray-200 hover:border-orange-500 hover:bg-orange-500/10 hover:text-orange-500 transition-all duration-300 shadow-sm bg-white"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="text-sm">My Subscriptions</span>
            </Link>

            {/* Notification Bell Container */}
            <div className="relative">
              <button 
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); }}
                className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-gray-700 font-bold border border-gray-200 hover:border-orange-500 hover:bg-orange-500/10 hover:text-orange-500 transition-all duration-300 shadow-sm bg-white"
              >
                <div className="relative flex items-center">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 border border-white"></span>
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="hidden sm:inline-flex items-center justify-center bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden flex flex-col max-h-[400px]"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white/50">
                        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-[10px] font-bold text-orange-500 hover:text-orange-600 hover:underline flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6">
                            <span className="text-3xl opacity-50">🔔</span>
                            <p className="text-xs font-semibold text-gray-400 mt-2">No new notifications</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif._id} 
                              onClick={() => !notif.isRead && markAsRead(notif._id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 ${notif.isRead ? 'bg-transparent border-transparent opacity-60' : 'bg-orange-50/50 border-orange-500/20 hover:bg-orange-50'}`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]'}`} />
                              <div>
                                <h4 className={`text-xs font-bold ${notif.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{notif.title}</h4>
                                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                
                                {notif.actionType === 'CONFIRM_DELIVERY' && !notif.isRead && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleConfirmDelivery(notif._id, notif.subscriptionId || notif.relatedId);
                                    }}
                                    className="mt-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                  >
                                    <Check className="w-3 h-3" /> Yes, I Received It
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown Container */}
            <div className="relative">
              
              {/* Profile Trigger Button */}
              <button 
                onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-200 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all duration-300 focus:outline-none bg-white/50 shadow-sm"
              >
                {/* User Avatar */}
                {user.profilePic ? (
                  <img 
                    src={user.profilePic} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </div>
                )}
                
                {/* User Name (hidden on small screens) */}
                <span className="hidden md:inline text-sm font-bold text-gray-800 max-w-[120px] truncate">
                  {user.name.split(" ")[0]}
                </span>
                
                {/* Chevron icon */}
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-orange-500' : ''}`} />
              </button>

              {/* Glassmorphic Dropdown List */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl z-20 py-2.5 overflow-hidden"
                    >
                      {/* User Summary Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      {/* Dropdown Options */}
                      <div className="p-1.5 space-y-1">
                        <Link 
                          to="/settings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:text-orange-600 hover:bg-orange-500/10 transition-all duration-200"
                        >
                          <Settings className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                          <span>Settings</span>
                        </Link>
                        
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-100 my-1" />

                      {/* Logout Action Button */}
                      <div className="p-1.5">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>

                    </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>
          
        </div>
      </div>
    </motion.nav>
  );
}
