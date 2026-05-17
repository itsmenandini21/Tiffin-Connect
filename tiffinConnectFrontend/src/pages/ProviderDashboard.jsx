import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, ShoppingBag, Settings, LogOut, Coffee, DollarSign, Clock, Utensils, ChefHat } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuToDelete, setMenuToDelete] = useState(null);

  const fetchMenus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tiffin/getMenu`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMenus(data);
      }
    } catch (err) {
      console.error("Error fetching menus", err);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'overview') {
      fetchMenus();
    }
  }, [user, activeTab]);
  
  useEffect(() => {
    // Check if user is logged in and is a provider
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'provider') {
        navigate('/');
      } else {
        setUser(parsedUser);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Logged out successfully");
    navigate('/login');
  };

  const handleAddMenu = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const weeklyMenu = {
      monday: formData.get('monday'),
      tuesday: formData.get('tuesday'),
      wednesday: formData.get('wednesday'),
      thursday: formData.get('thursday'),
      friday: formData.get('friday'),
      saturday: formData.get('saturday'),
      sunday: formData.get('sunday'),
    };
    
    const payload = {
      title: formData.get('title'),
      foodType: formData.get('foodType'),
      shift: formData.get('shift'),
      pricePerMeal: Number(formData.get('pricePerMeal')),
      monthlyPrice: Number(formData.get('monthlyPrice')),
      description: formData.get('description'),
      weeklyMenu
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tiffin/addMenu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Menu published successfully!");
        e.target.reset();
        fetchMenus();
      } else {
        toast.error(data.message || "Failed to publish menu");
      }
    } catch (err) {
      toast.error("Could not connect to the server");
    }
  };

  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const weeklyMenu = {
      monday: formData.get('monday'),
      tuesday: formData.get('tuesday'),
      wednesday: formData.get('wednesday'),
      thursday: formData.get('thursday'),
      friday: formData.get('friday'),
      saturday: formData.get('saturday'),
      sunday: formData.get('sunday'),
    };
    
    const payload = {
      title: formData.get('title'),
      foodType: formData.get('foodType'),
      shift: formData.get('shift'),
      pricePerMeal: Number(formData.get('pricePerMeal')),
      monthlyPrice: Number(formData.get('monthlyPrice')),
      description: formData.get('description'),
      weeklyMenu
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tiffin/update/${editingMenu._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Menu updated successfully!");
        setEditingMenu(null);
        fetchMenus(); // Refresh the list with updated data
      } else {
        toast.error(data.message || "Failed to update menu");
      }
    } catch (err) {
      toast.error("Could not connect to the server");
    }
  };

  const handleDeleteMenu = async () => {
    if (!menuToDelete) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tiffin/delete/${menuToDelete}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Menu deleted successfully!");
        setMenuToDelete(null);
        fetchMenus(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to delete menu");
        setMenuToDelete(null);
      }
    } catch (err) {
      toast.error("Could not connect to the server");
      setMenuToDelete(null);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'add-menu', label: 'Add Menu', icon: PlusCircle },
    { id: 'orders', label: 'Active Orders', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm relative z-10"
      >
        <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg">
            <ChefHat className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="font-bold text-gray-900 text-lg">{user.name}'s Kitchen</h2>
          <p className="text-xs text-green-500 font-medium px-2 py-1 bg-green-50 rounded-full mt-2">Verified Provider</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        {/* Background decorative blob */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-10 pointer-events-none z-0">
          <div className="w-[500px] h-[500px] bg-orange-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-gray-500 mt-1">Manage your kitchen operations and menus.</p>
            </div>
            {activeTab === 'overview' && (
              <button onClick={() => setActiveTab('add-menu')} className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                New Menu
              </button>
            )}
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Stats Cards */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-4 bg-orange-50 rounded-2xl"><ShoppingBag className="w-8 h-8 text-orange-500"/></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Active Subscriptions</p>
                    <p className="text-3xl font-extrabold text-gray-900">0</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-4 bg-green-50 rounded-2xl"><DollarSign className="w-8 h-8 text-green-500"/></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Monthly Revenue</p>
                    <p className="text-3xl font-extrabold text-gray-900">₹0</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-4 bg-blue-50 rounded-2xl"><Coffee className="w-8 h-8 text-blue-500"/></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Active Menus</p>
                    <p className="text-3xl font-extrabold text-gray-900">{menus.length}</p>
                  </div>
                </div>

                {/* Conditional Rendering for Menus */}
                {menus.length > 0 ? (
                  <div className="col-span-1 md:col-span-3 mt-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Your Active Menus</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {menus.map((menu) => (
                        <div key={menu._id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                          {/* Decorative background shape */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                          
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-extrabold text-xl text-gray-900 mb-2">{menu.title}</h4>
                              <div className="flex gap-2">
                                <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg border border-orange-200">
                                  {menu.foodType}
                                </span>
                                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                                  {menu.shift}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-extrabold rounded-xl shadow-md shadow-green-200">
                                ₹{menu.monthlyPrice} <span className="text-xs font-medium opacity-90">/mo</span>
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4 flex-1">{menu.description}</p>
                          
                          {/* Weekly Menu Display */}
                          <div className="mb-4 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Utensils className="w-3 h-3"/> Weekly Menu Plan
                            </p>
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                                const meal = menu.weeklyMenu?.[day];
                                if (!meal) return null;
                                return (
                                  <div key={day} className="flex-shrink-0 bg-white border border-gray-100 px-3 py-2 rounded-xl min-w-[110px] shadow-sm">
                                    <span className="text-[10px] font-bold text-orange-500 uppercase">{day.slice(0,3)}</span>
                                    <p className="text-xs font-bold text-gray-800 mt-0.5 truncate">{meal}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-4 flex justify-between text-sm items-center">
                            <span className="text-gray-500 font-bold bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                              Per Meal: <span className="text-gray-900">₹{menu.pricePerMeal}</span>
                            </span>
                            <div className="flex gap-2">
                              <button onClick={() => setEditingMenu(menu)} className="text-orange-500 font-bold hover:text-white hover:bg-orange-500 border border-orange-500 px-4 py-2 rounded-xl transition-all shadow-sm">
                                Edit
                              </button>
                              <button onClick={() => setMenuToDelete(menu._id)} className="text-orange-500 font-bold hover:text-white hover:bg-orange-500 border border-orange-500 px-4 py-2 rounded-xl transition-all shadow-sm">
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="col-span-1 md:col-span-3 bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center mt-6">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <Utensils className="w-12 h-12 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No menus created yet</h3>
                    <p className="text-gray-500 max-w-md mb-6">You haven't added any tiffin services to your kitchen. Create your first menu to start receiving orders!</p>
                    <button onClick={() => setActiveTab('add-menu')} className="bg-white border-2 border-orange-500 text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all">
                      Create your first menu
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'add-menu' && (
              <motion.div 
                key="add-menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100"
              >
                <form className="space-y-8" onSubmit={handleAddMenu}>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Details */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Service Title</label>
                        <input name="title" required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" placeholder="e.g. Premium North Indian Lunch" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">Food Type</label>
                          <select name="foodType" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                            <option>Veg</option>
                            <option>Non-Veg</option>
                            <option>Vegan</option>
                            <option>Jain</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">Shift</label>
                          <select name="shift" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                            <option>Lunch</option>
                            <option>Dinner</option>
                            <option>Breakfast</option>
                            <option>All Day</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">Price Per Meal (₹)</label>
                          <input name="pricePerMeal" required type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" placeholder="150" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">Monthly Price (₹)</label>
                          <input name="monthlyPrice" required type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" placeholder="4000" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                        <textarea name="description" required rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none" placeholder="Describe what makes your food special..."></textarea>
                      </div>
                    </div>

                    {/* Weekly Menu Planner */}
                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500"/> Weekly Menu Plan</h3>
                      <div className="space-y-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <div key={day} className="flex items-center gap-3">
                            <span className="w-24 text-sm font-semibold text-gray-700">{day}</span>
                            <input name={day.toLowerCase()} type="text" className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. Rajma Chawal, Roti, Salad" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                    <button type="button" onClick={() => setActiveTab('overview')} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                    <button type="submit" className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Publish Menu</button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Other tabs placeholders */}
            {(activeTab === 'orders' || activeTab === 'settings') && (
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-10 h-10 text-gray-400 animate-spin-slow" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Coming Soon</h3>
                <p className="text-gray-500 mt-2">We are currently building this feature!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Edit Menu Modal */}
        <AnimatePresence>
          {editingMenu && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold text-gray-900">Edit Menu: {editingMenu.title}</h2>
                    <button onClick={() => setEditingMenu(null)} className="p-2 bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>

                  <form className="space-y-8" onSubmit={handleUpdateMenu}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Basic Details */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">Service Title</label>
                          <input name="title" defaultValue={editingMenu.title} required type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Food Type</label>
                            <select name="foodType" defaultValue={editingMenu.foodType} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                              <option>Veg</option><option>Non-Veg</option><option>Vegan</option><option>Jain</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Shift</label>
                            <select name="shift" defaultValue={editingMenu.shift} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                              <option>Lunch</option><option>Dinner</option><option>Breakfast</option><option>All Day</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Price Per Meal (₹)</label>
                            <input name="pricePerMeal" defaultValue={editingMenu.pricePerMeal} required type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Monthly Price (₹)</label>
                            <input name="monthlyPrice" defaultValue={editingMenu.monthlyPrice} required type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                          <textarea name="description" defaultValue={editingMenu.description} required rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"></textarea>
                        </div>
                      </div>

                      {/* Weekly Menu Planner */}
                      <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500"/> Weekly Menu Plan</h3>
                        <div className="space-y-3">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                            const dbKey = day.toLowerCase();
                            return (
                              <div key={day} className="flex items-center gap-3">
                                <span className="w-24 text-sm font-semibold text-gray-700">{day}</span>
                                <input name={dbKey} defaultValue={editingMenu.weeklyMenu?.[dbKey] || ""} type="text" className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                      <button type="button" onClick={() => setEditingMenu(null)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                      <button type="submit" className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Save Changes</button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {menuToDelete && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-sm w-full text-center"
              >
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Utensils className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Delete Menu?</h3>
                <p className="text-gray-500 mb-8">Are you sure you want to remove this tiffin service? This action cannot be undone.</p>
                <div className="flex gap-4">
                  <button onClick={() => setMenuToDelete(null)} className="flex-1 py-3 text-gray-700 font-bold bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                    Cancel
                  </button>
                  <button onClick={handleDeleteMenu} className="flex-1 py-3 text-white font-bold bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5 rounded-xl transition-all">
                    Yes, Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
