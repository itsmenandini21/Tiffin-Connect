import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  ChefHat 
} from 'lucide-react';
import toast from 'react-hot-toast';

// Import modular sub-components
import OverviewTab from './provider/OverviewTab';
import AddMenuTab from './provider/AddMenuTab';
import SubscribersDrawer from './provider/SubscribersDrawer';
import EditMenuModal from './provider/EditMenuModal';
import DeleteMenuModal from './provider/DeleteMenuModal';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [selectedMenuForSubscribers, setSelectedMenuForSubscribers] = useState(null);

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
        setActiveTab('overview');
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
        fetchMenus();
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
        fetchMenus();
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedMenuForSubscribers(null); // Close drawer if open
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200' 
                    : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
          >
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
              <button 
                onClick={() => setActiveTab('add-menu')} 
                className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                New Menu
              </button>
            )}
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview-wrapper"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <OverviewTab 
                  menus={menus}
                  setEditingMenu={setEditingMenu}
                  setMenuToDelete={setMenuToDelete}
                  onViewSubscribers={setSelectedMenuForSubscribers}
                  setActiveTab={setActiveTab}
                />
              </motion.div>
            )}

            {activeTab === 'add-menu' && (
              <motion.div
                key="add-menu-wrapper"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AddMenuTab 
                  handleAddMenu={handleAddMenu}
                  setActiveTab={setActiveTab}
                />
              </motion.div>
            )}

            {/* Other tabs placeholders */}
            {(activeTab === 'orders' || activeTab === 'settings') && (
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
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

        {/* Modal overlays */}
        <AnimatePresence>
          {editingMenu && (
            <EditMenuModal 
              editingMenu={editingMenu}
              setEditingMenu={setEditingMenu}
              handleUpdateMenu={handleUpdateMenu}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {menuToDelete && (
            <DeleteMenuModal 
              menuToDelete={menuToDelete}
              setMenuToDelete={setMenuToDelete}
              handleDeleteMenu={handleDeleteMenu}
            />
          )}
        </AnimatePresence>

        {/* Subscribers Details sliding overlay drawer */}
        <AnimatePresence>
          {selectedMenuForSubscribers && (
            <SubscribersDrawer 
              menu={selectedMenuForSubscribers}
              onClose={() => setSelectedMenuForSubscribers(null)}
            />
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
