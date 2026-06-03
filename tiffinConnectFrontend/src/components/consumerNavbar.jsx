import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, User, LogOut, Settings, CalendarDays, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConsumerNavbar() {
  const navigate = useNavigate();

  // Dropdown visibility state:
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch actual logged-in user from localStorage:
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const user = {
    name: storedUser.name || "Nandini Mehrotra",
    email: storedUser.email || "nandini@tiffinconnect.com",
    profilePic: storedUser.profilePic || ""
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
      className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <Link to="/consumer-dashboard" className="flex items-center gap-2 group">
            <div className="p-2 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
              <Utensils className="w-6 h-6 text-orange-600" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Tiffin<span className="text-orange-600">Connect</span>
              <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-semibold border border-orange-100">
                Customer
              </span>
            </span>
          </Link>

          {/* Right Side: Profile & Actions */}
          <div className="flex items-center gap-4">
            
            {/* View Subscriptions Shortcut Button */}
            <Link 
              to="/my-subscriptions" 
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-orange-600 font-semibold border border-orange-200 hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-300"
            >
              <CalendarDays className="w-4 h-4" />
              <span>My Subscriptions</span>
            </Link>

            {/* Profile Dropdown Container */}
            <div className="relative">
              
              {/* Profile Trigger Button */}
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50/20 transition-all duration-300 focus:outline-none"
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
                <span className="hidden md:inline text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                  {user.name.split(" ")[0]}
                </span>
                
                {/* Chevron icon */}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-orange-500' : ''}`} />
              </button>

              {/* Glassmorphic Dropdown List */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    {/* Backdrop to close when clicking outside */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl z-20 py-2.5 overflow-hidden"
                    >
                      {/* User Summary Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>

                      {/* Dropdown Options */}
                      <div className="p-1.5 space-y-1">
                        
                        <Link 
                          to="/my-subscriptions"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-orange-600 hover:bg-orange-50/50 transition-all duration-200"
                        >
                          <CalendarDays className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                          <span>My Subscriptions</span>
                        </Link>

                        <Link 
                          to="/settings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-orange-600 hover:bg-orange-50/50 transition-all duration-200"
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
                          className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>

                    </motion.div>
                  </>
                )}
              </AnimatePresence>

            </div>

          </div>
          
        </div>
      </div>
    </motion.nav>
  );
}
