import React, { useState, useEffect } from 'react';
import { User, Lock, Building, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountSettingsTab({ user, onProfileUpdate }) {
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [fssaiUploading, setFssaiUploading] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    businessName: '',
    bankAccount: '',
    ifscCode: '',
    fssaiCertificate: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch full profile details including ProviderProfile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await response.json();
        if (response.ok && data.profile) {
          setProfileForm(prev => ({
            ...prev,
            name: data.user.name || '',
            phoneNumber: data.user.phoneNumber || '',
            businessName: data.profile.businessName || '',
            bankAccount: data.profile.bankDetails?.accountNumber || '',
            ifscCode: data.profile.bankDetails?.ifscCode || '',
            fssaiCertificate: data.profile.fssaiCertificate || ''
          }));
        }
      } catch (err) {
        console.error("Failed to load profile details", err);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleFssaiUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFssaiUploading(true);
    const toastId = toast.loading("Uploading new FSSAI certificate...");

    try {
      const CLOUD_NAME = "ds94mrgkb";
      const UPLOAD_PRESET = "tiffinConnect";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error?.message || "Failed to upload image");
      
      setProfileForm(prev => ({ ...prev, fssaiCertificate: data.secure_url }));
      toast.success("Document uploaded successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Upload failed", { id: toastId });
    } finally {
      setFssaiUploading(false);
    }
  };

  const submitProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(profileForm)
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Profile updated successfully!");
        if (onProfileUpdate) onProfileUpdate(); // Callback to parent if needed
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Could not connect to the server");
    } finally {
      setProfileLoading(false);
    }
  };

  const submitPasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    
    setPasswordLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/update-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success("Password updated successfully!");
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (err) {
      toast.error("Could not connect to the server");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Account Settings</h2>
          <p className="text-sm text-gray-500 font-semibold mt-1">Manage your kitchen profile, payouts, and security</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Profile & Financial */}
        <div className="space-y-6">
          <form onSubmit={submitProfileUpdate} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              Kitchen & Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Info */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={profileForm.name} 
                  onChange={handleProfileChange} 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  value={profileForm.phoneNumber} 
                  onChange={handleProfileChange} 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Kitchen / Business Name</label>
                <input 
                  type="text" 
                  name="businessName" 
                  value={profileForm.businessName} 
                  onChange={handleProfileChange} 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                />
              </div>

              {/* Readonly Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Registered Email</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  readOnly
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl outline-none cursor-not-allowed" 
                />
              </div>
            </div>

            <hr className="my-8 border-gray-100" />

            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-orange-500" />
              Financial & Legal Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Bank Account Number</label>
                <input 
                  type="text" 
                  name="bankAccount" 
                  value={profileForm.bankAccount} 
                  onChange={handleProfileChange} 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">IFSC Code</label>
                <input 
                  type="text" 
                  name="ifscCode" 
                  value={profileForm.ifscCode} 
                  onChange={handleProfileChange} 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">FSSAI Certificate</label>
                <div className="flex items-center gap-4">
                  {profileForm.fssaiCertificate ? (
                    <a href={profileForm.fssaiCertificate} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl border border-green-200 hover:bg-green-100 transition-colors">
                      <CheckCircle2 className="w-5 h-5" /> View Current Certificate
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl border border-red-200">
                      <AlertCircle className="w-5 h-5" /> No certificate uploaded
                    </div>
                  )}
                  
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      onChange={handleFssaiUpload}
                      disabled={fssaiUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <button type="button" className="flex items-center gap-2 px-4 py-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-200 hover:bg-orange-100 transition-colors font-bold text-sm pointer-events-none">
                      {fssaiUploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      Update FSSAI
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                type="submit" 
                disabled={profileLoading}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none disabled:cursor-not-allowed flex items-center gap-2"
              >
                {profileLoading && <RefreshCw className="w-5 h-5 animate-spin" />}
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        {/* Security */}
        <div className="space-y-6">
          <form onSubmit={submitPasswordUpdate} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" />
              Security
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                <input 
                  type="password" 
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {passwordLoading && <RefreshCw className="w-5 h-5 animate-spin" />}
                  Update Password
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
