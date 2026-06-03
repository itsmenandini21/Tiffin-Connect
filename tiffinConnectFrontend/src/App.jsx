import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import ProviderDashboard from './pages/ProviderDashboard.jsx';
import ConsumerDashboard from './pages/consumer/ConsumerDashboard.jsx';
import MySubscriptions from './pages/consumer/MySubscriptions.jsx';
import Navbar from './components/Navbar.jsx';

function AppContent() {
  const location = useLocation();
  
  // Routes where the Navbar should be hidden
  const hideNavbarRoutes = ['/provider-dashboard', '/consumer-dashboard', '/my-subscriptions'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {shouldShowNavbar && <Navbar />}
      
      {/* Main Content Area */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />
          <Route path="/consumer-dashboard" element={<ConsumerDashboard />} />
          <Route path="/my-subscriptions" element={<MySubscriptions />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
