import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  ChefHat, 
  CreditCard,
  LogOut, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  X,
  FileText,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Award,
  ChevronRight,
  MapPin,
  Calendar,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Data states
  const [pendingProviders, setPendingProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedProviderProfile, setSelectedProviderProfile] = useState(null); // For verification modal
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userFilter, setUserFilter] = useState(''); // role filter
  const [userSearch, setUserSearch] = useState('');
  
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [inspectingService, setInspectingService] = useState(null); // For kitchen detail drawer
  const [inspectingServiceReviews, setInspectingServiceReviews] = useState([]);
  const [loadingServiceReviews, setLoadingServiceReviews] = useState(false);
  const [serviceReviewsTab, setServiceReviewsTab] = useState('all'); // 'all', 'positive', 'critical', 'neutral'
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  // 1. Initial Authentication & Authorization check
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        toast.error("Access denied. Admin role required.");
        navigate('/');
      } else {
        setUser(parsedUser);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // 2. Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // 3. Fetch Pending Verifications
  const fetchPendingProviders = async () => {
    try {
      setLoadingProviders(true);
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/admin/providers/pending`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPendingProviders(data);
      }
    } catch (err) {
      console.error("Error fetching pending providers:", err);
    } finally {
      setLoadingProviders(false);
    }
  };

  // 4. Fetch Users List
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      let url = `${API_URL}/admin/users?`;
      if (userFilter) url += `role=${userFilter}&`;
      if (userSearch) url += `search=${userSearch}&`;
      
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // 5. Fetch Services Directory
  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/admin/services`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (response.ok) {
        setServices(data);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoadingServices(false);
    }
  };

  // 6. Fetch Subscriptions
  const fetchSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/admin/subscriptions`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSubscriptions(data);
      }
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  // 7. Fetch reviews of a specific service for detailed drawer
  const fetchServiceReviews = async (serviceId) => {
    try {
      setLoadingServiceReviews(true);
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/review/public/${serviceId}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (response.ok) {
        setInspectingServiceReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews for service:", err);
    } finally {
      setLoadingServiceReviews(false);
    }
  };

  // Trigger loads based on active tab
  useEffect(() => {
    if (!user) return;
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'verifications') {
      fetchPendingProviders();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'kitchens') {
      fetchServices();
    } else if (activeTab === 'subscriptions') {
      fetchSubscriptions();
    }
  }, [user, activeTab, userFilter, userSearch]);

  // Handle service inspection clicks
  const handleInspectService = (service) => {
    setInspectingService(service);
    setServiceReviewsTab('all');
    fetchServiceReviews(service._id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Logged out successfully");
    navigate('/login');
  };

  // Action: Verify Provider
  const handleVerifyProvider = async (profileId) => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/admin/providers/verify/${profileId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.ok) {
        toast.success("Provider approved and verified successfully!");
        setSelectedProviderProfile(null);
        fetchPendingProviders();
        fetchStats(); // Update verifications count
      } else {
        toast.error("Failed to verify provider");
      }
    } catch (err) {
      console.error("Error verifying provider:", err);
      toast.error("Server connection failed");
    }
  };

  // Action: Toggle User Block
  const handleToggleUserBlock = async (userId) => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/admin/users/block/${userId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        fetchUsers();
        fetchStats(); // Refresh stats
      } else {
        toast.error(data.message || "Failed to block/unblock user");
      }
    } catch (err) {
      console.error("Error toggling user block:", err);
      toast.error("Server connection failed");
    }
  };

  // Action: Toggle Service Active/Disabled
  const handleToggleServiceActive = async (serviceId) => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/admin/services/active/${serviceId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        
        // Update local service list
        setServices(prev => prev.map(s => s._id === serviceId ? { ...s, isActive: !s.isActive } : s));
        
        // Update currently inspecting service if relevant
        if (inspectingService && inspectingService._id === serviceId) {
          setInspectingService(prev => ({ ...prev, isActive: !prev.isActive }));
        }
      } else {
        toast.error(data.message || "Failed to toggle service status");
      }
    } catch (err) {
      console.error("Error toggling service status:", err);
      toast.error("Server connection failed");
    }
  };

  // Helper: Filter reviews by rating tab selection
  const getFilteredReviews = () => {
    if (serviceReviewsTab === 'positive') {
      return inspectingServiceReviews.filter(r => r.rating >= 4);
    } else if (serviceReviewsTab === 'critical') {
      return inspectingServiceReviews.filter(r => r.rating <= 2);
    } else if (serviceReviewsTab === 'neutral') {
      return inspectingServiceReviews.filter(r => r.rating === 3);
    }
    return inspectingServiceReviews;
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheck, badge: stats?.pendingVerificationsCount },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'kitchens', label: 'Kitchens Directory', icon: ChefHat },
    { id: 'subscriptions', label: 'Subscriptions Tracker', icon: CreditCard },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans">
      
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col shadow-xl relative z-10 shrink-0"
      >
        <div className="p-6 border-b border-slate-800 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-extrabold text-white text-lg tracking-tight">Admin Console</h2>
          <p className="text-xs text-indigo-400 font-bold px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full mt-2">
            Super Administrator
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-bold text-sm">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto relative h-full">
        
        {/* Decorative backdrop blobs */}
        <div className="absolute top-0 right-0 -translate-y-24 translate-x-24 opacity-20 pointer-events-none z-0">
          <div className="w-[500px] h-[500px] bg-indigo-500 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-24 -translate-x-24 opacity-10 pointer-events-none z-0">
          <div className="w-[500px] h-[500px] bg-violet-600 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 space-y-8">
          
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-black text-indigo-400">Tiffin Connect</span>
              <h1 className="text-3xl font-black tracking-tight text-white mt-1">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-slate-400 text-sm mt-1">Manage global operations, moderation, and approvals.</p>
            </div>
            
            {/* Header Mini Info */}
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 shrink-0">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
              <span className="text-slate-300">Live System Status: Healthy</span>
            </div>
          </header>

          <AnimatePresence mode="wait">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                {loadingStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl animate-pulse h-28"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Users</span>
                        <h3 className="text-2xl font-black text-white">{stats?.totalUsers + stats?.totalProviders}</h3>
                        <p className="text-[10px] text-slate-500 font-semibold">{stats?.totalUsers} Consumers | {stats?.totalProviders} Chefs</p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Services</span>
                        <h3 className="text-2xl font-black text-white">{stats?.totalKitchens}</h3>
                        <p className="text-[10px] text-indigo-400 font-semibold">Tiffin kitchens listed</p>
                      </div>
                      <div className="w-12 h-12 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-xl flex items-center justify-center">
                        <ChefHat className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Subscriptions</span>
                        <h3 className="text-2xl font-black text-white">{stats?.activeSubscriptionsCount}</h3>
                        <p className="text-[10px] text-green-400 font-semibold">Active platform cycles</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Est. Revenue</span>
                        <h3 className="text-2xl font-black text-green-400">₹{stats?.totalRevenue}</h3>
                        <p className="text-[10px] text-slate-500 font-semibold">Cumulative plan rates</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Dashboard layout restructure */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left & Middle Column: Activity Feed & Quick Actions */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Live Activities Box */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-6">
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-800/60">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        <div>
                          <h3 className="text-base font-black text-white">Live Platform Activities</h3>
                          <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Real-time registrations, orders, and ratings</p>
                        </div>
                      </div>

                      {loadingStats ? (
                        <div className="py-20 text-center">
                          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <span className="text-xs text-slate-400">Loading timeline...</span>
                        </div>
                      ) : !stats?.activityFeed || stats.activityFeed.length === 0 ? (
                        <p className="text-xs text-slate-500 italic text-center py-10">No recent activity detected.</p>
                      ) : (
                        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                          {stats.activityFeed.map((activity, idx) => (
                            <div key={idx} className="flex gap-4 items-start text-xs p-3 rounded-xl bg-slate-950/50 hover:bg-slate-950 border border-slate-900 transition-colors">
                              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                activity.type === 'registration' ? 'bg-indigo-400' :
                                activity.type === 'subscription' ? 'bg-emerald-400' :
                                'bg-amber-400'
                              }`}></span>
                              <div className="flex-1 space-y-0.5">
                                <p className="font-semibold text-slate-200">{activity.message}</p>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(activity.date).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Subscription Distribution Charts */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-4">
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Subscription Distribution</h3>
                        <p className="text-slate-400 text-[10px] font-semibold">Active subscription breakdowns by plan type</p>
                      </div>

                      {loadingStats ? (
                        <div className="h-20 animate-pulse bg-slate-950 rounded-xl"></div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          {/* Weekly */}
                          <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-center space-y-1">
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase">Weekly</span>
                            <h4 className="text-xl font-black text-indigo-400">{stats?.planDistribution?.weekly || 0}</h4>
                            <p className="text-[8px] text-slate-500 font-semibold">Active Plans</p>
                          </div>
                          {/* Monthly */}
                          <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-center space-y-1">
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase">Monthly</span>
                            <h4 className="text-xl font-black text-emerald-400">{stats?.planDistribution?.monthly || 0}</h4>
                            <p className="text-[8px] text-slate-500 font-semibold">Active Plans</p>
                          </div>
                          {/* Yearly */}
                          <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-center space-y-1">
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase">Yearly</span>
                            <h4 className="text-xl font-black text-violet-400">{stats?.planDistribution?.yearly || 0}</h4>
                            <p className="text-[8px] text-slate-500 font-semibold">Active Plans</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Quick Verification Alerts */}
                  <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-6">
                      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/60">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        <div>
                          <h3 className="text-base font-black text-white">Pending Alerts</h3>
                          <p className="text-slate-400 text-[10px] font-semibold">Verify newly signed-up chefs</p>
                        </div>
                      </div>

                      {loadingStats ? (
                        <div className="space-y-3">
                          {[1, 2].map(n => (
                            <div key={n} className="bg-slate-950 h-20 rounded-xl animate-pulse"></div>
                          ))}
                        </div>
                      ) : !stats?.quickPending || stats.quickPending.length === 0 ? (
                        <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-900 border-dashed">
                          <CheckCircle className="w-8 h-8 text-emerald-500/70 mx-auto mb-2" />
                          <p className="text-[10px] text-slate-400 font-semibold">No pending chef verifications</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {stats.quickPending.map(profile => (
                            <div key={profile._id} className="p-4 rounded-2xl bg-slate-950 border border-slate-900 flex justify-between items-center gap-4">
                              <div className="min-w-0">
                                <h4 className="text-xs font-black text-slate-200 truncate">{profile.businessName}</h4>
                                <p className="text-[10px] text-slate-500 font-bold truncate">Chef: {profile.userId?.name}</p>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedProviderProfile(profile);
                                  setActiveTab('verifications');
                                }}
                                className="bg-indigo-600/10 hover:bg-indigo-650 text-indigo-400 hover:text-white px-3 py-1.5 border border-indigo-500/20 hover:border-transparent rounded-lg text-[10px] font-black transition-all shrink-0"
                              >
                                Review FSSAI
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => setActiveTab('verifications')}
                            className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-bold text-center border border-slate-800 rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            View All Approvals <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 2: VERIFICATIONS */}
            {activeTab === 'verifications' && (
              <motion.div
                key="verifications"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900 border border-slate-850 p-6 rounded-[2rem] space-y-6"
              >
                <div>
                  <h2 className="text-xl font-extrabold text-white">Pending Provider Verifications</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Approve or reject home kitchen provider profiles by reviewing their details & certifications.</p>
                </div>

                {loadingProviders ? (
                  <div className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <span className="text-sm font-semibold text-slate-400">Loading registrations...</span>
                  </div>
                ) : pendingProviders.length === 0 ? (
                  <div className="text-center py-20 bg-slate-950 rounded-2xl border border-slate-850">
                    <CheckCircle className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-slate-200">All caught up!</h4>
                    <p className="text-slate-500 text-xs max-w-xs mx-auto mt-1">There are no pending provider applications awaiting verification at this time.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                          <th className="py-4 px-4">Business Name</th>
                          <th className="py-4 px-4">Chef Name</th>
                          <th className="py-4 px-4">Phone Number</th>
                          <th className="py-4 px-4">FSSAI Number</th>
                          <th className="py-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {pendingProviders.map((profile) => (
                          <tr key={profile._id} className="hover:bg-slate-950/40 text-xs transition-colors">
                            <td className="py-4 px-4 font-black text-slate-200">{profile.businessName}</td>
                            <td className="py-4 px-4 font-bold text-slate-400">{profile.userId?.name || "N/A"}</td>
                            <td className="py-4 px-4 text-slate-400 font-semibold">{profile.userId?.phoneNumber || "N/A"}</td>
                            <td className="py-4 px-4 text-slate-300 font-mono tracking-wider">{profile.fssaiCertificate}</td>
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => setSelectedProviderProfile(profile)}
                                className="bg-indigo-600 hover:bg-indigo-50 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/10 transition-all duration-300"
                              >
                                View Credentials
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: USER MANAGEMENT */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900 border border-slate-850 p-6 rounded-[2rem] space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-white">Registered Users & Merchants</h2>
                    <p className="text-slate-400 text-xs mt-0.5">Block, unblock, or search for accounts across the platform.</p>
                  </div>
                  <div className="flex flex-wrap gap-3 shrink-0">
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs font-semibold px-4 py-2.5 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500 outline-none w-48"
                    />
                    <select 
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl text-slate-300 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Roles</option>
                      <option value="user">Consumer Only</option>
                      <option value="provider">Provider Only</option>
                      <option value="admin">Admins Only</option>
                    </select>
                  </div>
                </div>

                {loadingUsers ? (
                  <div className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <span className="text-sm font-semibold text-slate-400">Loading user registry...</span>
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-20">No users match the search filters.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                          <th className="py-4 px-4">Name</th>
                          <th className="py-4 px-4">Email</th>
                          <th className="py-4 px-4">Phone</th>
                          <th className="py-4 px-4">Role</th>
                          <th className="py-4 px-4">Status</th>
                          <th className="py-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {users.map((item) => (
                          <tr key={item._id} className="hover:bg-slate-950/40 text-xs transition-colors">
                            <td className="py-4 px-4 font-black text-slate-200">{item.name}</td>
                            <td className="py-4 px-4 font-bold text-slate-400">{item.email}</td>
                            <td className="py-4 px-4 text-slate-400 font-semibold">{item.phoneNumber}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${
                                item.role === 'admin' ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' :
                                item.role === 'provider' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                                'bg-slate-500/10 border border-slate-800 text-slate-400'
                              }`}>
                                {item.role}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`flex items-center gap-1.5 font-bold ${item.isBlocked ? 'text-red-400' : 'text-green-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item.isBlocked ? 'bg-red-400' : 'bg-green-400'}`}></span>
                                {item.isBlocked ? 'Suspended' : 'Active'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {item.role === 'admin' ? (
                                <span className="text-[10px] text-slate-500 italic font-medium pr-4">Admin Protected</span>
                              ) : (
                                <button
                                  onClick={() => handleToggleUserBlock(item._id)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                    item.isBlocked 
                                      ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white' 
                                      : 'bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white'
                                  }`}
                                >
                                  {item.isBlocked ? 'Reactivate' : 'Suspend Account'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: KITCHENS DIRECTORY */}
            {activeTab === 'kitchens' && (
              <motion.div
                key="kitchens"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900 border border-slate-850 p-6 rounded-[2rem] space-y-6"
              >
                <div>
                  <h2 className="text-xl font-extrabold text-white">Tiffin Services Directory</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Toggle visibility, inspect ratings & comments tiffin service-wise, or suspend individual menus.</p>
                </div>

                {loadingServices ? (
                  <div className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <span className="text-sm font-semibold text-slate-400">Loading catalog...</span>
                  </div>
                ) : services.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-20">No listed services exist.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                          <th className="py-4 px-4">Service</th>
                          <th className="py-4 px-4">Chef/Kitchen</th>
                          <th className="py-4 px-4">Meal Cost</th>
                          <th className="py-4 px-4">Shift</th>
                          <th className="py-4 px-4">Type</th>
                          <th className="py-4 px-4">Listing Status</th>
                          <th className="py-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {services.map((item) => (
                          <tr key={item._id} className="hover:bg-slate-950/40 text-xs transition-colors">
                            <td className="py-4 px-4 font-black text-slate-200">{item.title}</td>
                            <td className="py-4 px-4 font-bold text-slate-400">{item.providerId?.name || "N/A"}</td>
                            <td className="py-4 px-4 text-slate-200 font-extrabold">₹{item.pricePerMeal}</td>
                            <td className="py-4 px-4 text-slate-400 font-semibold">{item.shift}</td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${
                                item.foodType === 'Veg' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                              }`}>
                                {item.foodType}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`flex items-center gap-1.5 font-bold ${item.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                {item.isActive ? 'Visible' : 'Suspended'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right flex justify-end gap-2.5">
                              <button
                                onClick={() => handleInspectService(item)}
                                className="bg-indigo-600/10 hover:bg-indigo-650 text-indigo-400 hover:text-white px-3 py-1.5 border border-indigo-500/20 hover:border-transparent rounded-lg font-black transition-all"
                              >
                                Inspect Reviews & Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 5: SUBSCRIPTIONS TRACKER */}
            {activeTab === 'subscriptions' && (
              <motion.div
                key="subscriptions"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-900 border border-slate-850 p-6 rounded-[2rem] space-y-6"
              >
                <div>
                  <h2 className="text-xl font-extrabold text-white">Active Global Subscriptions</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Overview of active plans and transaction items on Tiffin Connect.</p>
                </div>

                {loadingSubscriptions ? (
                  <div className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <span className="text-sm font-semibold text-slate-400">Fetching tracking history...</span>
                  </div>
                ) : subscriptions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-20">No active cycles found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                          <th className="py-4 px-4">Consumer</th>
                          <th className="py-4 px-4">Kitchen</th>
                          <th className="py-4 px-4">Tiffin</th>
                          <th className="py-4 px-4">Plan</th>
                          <th className="py-4 px-4">Deliveries</th>
                          <th className="py-4 px-4">State</th>
                          <th className="py-4 px-4 text-right">Start Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {subscriptions.map((item) => (
                          <tr key={item._id} className="hover:bg-slate-950/40 text-xs transition-colors">
                            <td className="py-4 px-4 font-black text-slate-200">
                              <div>{item.userId?.name || "N/A"}</div>
                              <div className="text-[9px] text-slate-500 font-bold">{item.userId?.phoneNumber}</div>
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-400">{item.tiffinServiceId?.providerId?.name || "N/A"}</td>
                            <td className="py-4 px-4 text-slate-300 font-semibold">{item.tiffinServiceId?.title || "N/A"}</td>
                            <td className="py-4 px-4 uppercase tracking-wider font-extrabold text-indigo-400">{item.planType}</td>
                            <td className="py-4 px-4">
                              <span className="text-slate-200 font-mono capitalize">{item.deliveryStatus || 'Pending'}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-md ${
                                item.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right font-medium text-slate-400">
                              {item.startDate ? new Date(item.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : 'Not started'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DRAWER: Slide-out detailed inspection panel for Tiffin Services (Service-Wise Reviews) */}
        <AnimatePresence>
          {inspectingService && (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setInspectingService(null)}
                className="fixed inset-0 bg-slate-950"
              />

              {/* Panel Content */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="w-full max-w-lg bg-slate-900 border-l border-slate-800 relative z-10 flex flex-col h-full shadow-2xl text-slate-100"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-850 flex justify-between items-center bg-slate-950/20 shrink-0">
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                      Inspect Mode 🍳
                    </span>
                    <h3 className="text-lg font-black text-white truncate mt-1">{inspectingService.title}</h3>
                  </div>
                  <button
                    onClick={() => setInspectingService(null)}
                    className="p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Status Box */}
                  <div className="flex justify-between items-center bg-slate-950 border border-slate-850 p-4 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase">Service Visibility</span>
                      <p className="text-xs font-bold text-slate-300 mt-0.5">
                        Current status: <span className={inspectingService.isActive ? "text-green-400" : "text-red-400"}>
                          {inspectingService.isActive ? "Active / Visible" : "Suspended"}
                        </span>
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleToggleServiceActive(inspectingService._id)}
                      className={`px-4 py-2 text-xs font-black rounded-lg transition-colors ${
                        inspectingService.isActive 
                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-450 hover:bg-rose-500 hover:text-white' 
                          : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                      }`}
                    >
                      {inspectingService.isActive ? 'Disable Service' : 'Enable Service'}
                    </button>
                  </div>

                  {/* Details Card */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3.5 text-xs">
                    <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-850">Service Overview</h4>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Kitchen:</span>
                      <span className="text-slate-200 font-extrabold">{inspectingService.providerId?.name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Price per meal:</span>
                      <span className="text-slate-200 font-extrabold text-indigo-400">₹{inspectingService.pricePerMeal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Service Shift:</span>
                      <span className="text-slate-200 font-extrabold uppercase tracking-wide">{inspectingService.shift}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Food Category:</span>
                      <span className="text-slate-200 font-extrabold uppercase tracking-wide">{inspectingService.foodType}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-850 space-y-1">
                      <span className="text-slate-500 font-bold">Description:</span>
                      <p className="text-slate-350 leading-relaxed font-medium">{inspectingService.description}</p>
                    </div>
                  </div>

                  {/* Reviews Section */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Tiffin Service Reviews</h4>
                    
                    {/* Drawer sub-tab selectors */}
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 border border-slate-850 rounded-xl">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'positive', label: 'Good' },
                        { id: 'neutral', label: 'Neutral' },
                        { id: 'critical', label: 'Bad' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setServiceReviewsTab(t.id)}
                          className={`py-1.5 rounded-lg text-[10px] font-extrabold text-center transition-all ${
                            serviceReviewsTab === t.id 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {loadingServiceReviews ? (
                      <div className="py-12 text-center">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <span className="text-[10px] text-slate-400">Loading reviews...</span>
                      </div>
                    ) : getFilteredReviews().length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-10 bg-slate-950/40 border border-slate-850 border-dashed rounded-xl">
                        No reviews fit this filter.
                      </p>
                    ) : (
                      <div className="space-y-3.5">
                        {getFilteredReviews().map(rev => (
                          <div key={rev.reviewId} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5">
                            <div className="flex justify-between items-start">
                              <span className="text-[11px] font-black text-slate-300">{rev.userName}</span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                rev.rating >= 4 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                rev.rating === 3 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                              }`}>
                                {rev.rating} ★
                              </span>
                            </div>
                            {rev.comment ? (
                              <p className="text-xs text-slate-400 font-medium italic">"{rev.comment}"</p>
                            ) : (
                              <p className="text-[9px] text-slate-600 italic">No suggestion written.</p>
                            )}
                            <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1">
                              <span>Campaign: {rev.question}</span>
                              <span>{new Date(rev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: Provider Credentials Verification Detail Modal */}
        <AnimatePresence>
          {selectedProviderProfile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl p-8 max-w-lg w-full relative text-slate-100"
              >
                <button
                  onClick={() => setSelectedProviderProfile(null)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <ChefHat className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white">{selectedProviderProfile.businessName}</h3>
                    <p className="text-slate-400 text-xs mt-1">Application for Home Tiffin Provider</p>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Chef/User Name:</span>
                      <span className="text-slate-200 font-extrabold">{selectedProviderProfile.userId?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Email Address:</span>
                      <span className="text-slate-200 font-extrabold">{selectedProviderProfile.userId?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">Phone Number:</span>
                      <span className="text-slate-200 font-extrabold">{selectedProviderProfile.userId?.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">FSSAI License:</span>
                      <span className="text-indigo-400 font-mono font-black tracking-wider">{selectedProviderProfile.fssaiCertificate}</span>
                    </div>
                    {selectedProviderProfile.userId?.address && (
                      <div className="flex flex-col gap-1 pt-2 border-t border-slate-850">
                        <span className="text-slate-500 font-bold">Kitchen Address:</span>
                        <span className="text-slate-300 font-medium leading-relaxed">
                          {selectedProviderProfile.userId.address.street}, {selectedProviderProfile.userId.address.city}, {selectedProviderProfile.userId.address.state} - {selectedProviderProfile.userId.address.pincode}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">FSSAI Verification Document</label>
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col items-center justify-center text-center min-h-[160px]">
                      {selectedProviderProfile.fssaiCertificate && selectedProviderProfile.fssaiCertificate.startsWith("http") ? (
                        <div className="space-y-3 w-full">
                          {selectedProviderProfile.fssaiCertificate.toLowerCase().endsWith(".pdf") ? (
                            <div className="space-y-2">
                              <FileText className="w-10 h-10 text-indigo-500 mx-auto" />
                              <a 
                                href={selectedProviderProfile.fssaiCertificate} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all"
                              >
                                View PDF Certificate
                              </a>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <img 
                                src={selectedProviderProfile.fssaiCertificate} 
                                alt="FSSAI Certificate" 
                                className="max-h-32 object-contain rounded-lg mx-auto border border-slate-800 shadow" 
                              />
                              <a 
                                href={selectedProviderProfile.fssaiCertificate} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold underline block"
                              >
                                Open Full Image
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <FileText className="w-8 h-8 text-indigo-500 mb-1 mx-auto" />
                          <span className="text-xs text-slate-355 font-black">FSSAI Number Provided</span>
                          <span className="text-[10px] text-slate-500 font-mono tracking-wider block mt-1">ID: {selectedProviderProfile.fssaiCertificate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setSelectedProviderProfile(null)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3.5 rounded-xl text-xs font-bold transition-all"
                    >
                      Hold Review
                    </button>
                    <button
                      onClick={() => handleVerifyProvider(selectedProviderProfile._id)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/25 transition-all"
                    >
                      Approve & Verify Chef
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
