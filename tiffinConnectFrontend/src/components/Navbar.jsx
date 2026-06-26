import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';

export default function Navbar() {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  let user = null;
  if (token && storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (e) {
      console.error(e);
    }
  }

  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  
  // If on login page, check if we are in register mode or login mode
  // If not on login page, default to Sign Up being the primary button
  const isRegisterActive = isLoginPage ? (location.state?.isRegister === true) : true;
  const isLoginActive = isLoginPage ? (!location.state?.isRegister) : false;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin-dashboard";
    if (user.role === "provider") return "/provider-dashboard";
    return "/consumer-dashboard";
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
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
              <Utensils className="w-6 h-6 text-orange-600" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Tiffin<span className="text-orange-600">Connect</span>
            </span>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-orange-600 font-medium transition-colors hidden md:block mr-2">Home</Link>
            {user ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="inline-flex px-5 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-200 transition-all duration-300"
                >
                  Go to Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="inline-flex px-5 py-2.5 rounded-xl text-red-650 hover:text-red-700 font-semibold border border-red-200 hover:bg-red-50 transition-all duration-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  state={{ isRegister: false }} 
                  className={`hidden md:inline-flex px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                    isLoginActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200 hover:from-orange-600 hover:to-amber-600'
                      : 'text-orange-600 border-2 border-orange-100 hover:border-orange-500 hover:bg-orange-50'
                  }`}
                >
                  Log In
                </Link>
                <Link 
                  to="/login" 
                  state={{ isRegister: true }}
                  className={`hidden md:inline-flex px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                    isRegisterActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200 hover:from-orange-600 hover:to-amber-600'
                      : 'text-orange-600 border-2 border-orange-100 hover:border-orange-500 hover:bg-orange-50'
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
        </div>
      </div>
    </motion.nav>
  );
}
