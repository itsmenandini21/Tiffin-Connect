import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, Star, HelpCircle, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsTab({ menus, setActiveTab }) {
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedService, setSelectedService] = useState('');
  const [question, setQuestion] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);
  const [intervalDays, setIntervalDays] = useState(0);
  const [expiresHours, setExpiresHours] = useState(24);

  useEffect(() => {
    if (menus && menus.length > 0) {
      setSelectedService(menus[0]._id);
    }
    fetchTemplates();
  }, [menus]);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/feedback/templates`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setTemplates(data);
      } else {
        console.error("Failed to load templates:", data.message);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      setSubmitting(true);
      // Calculate expiresAt based on hours
      const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000);

      const payload = {
        tiffinServiceId: selectedService,
        question: question.trim(),
        expiresAt,
        isTemplate,
        intervalDays: Number(intervalDays)
      };

      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/feedback/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        if (isTemplate) {
          toast.success("Feedback added and template saved!");
          fetchTemplates();
        } else {
          toast.success("Feedback added successfully!");
        }
        setActiveTab('overview');
        
        // Reset only question and template checkbox
        setQuestion('');
        setIsTemplate(false);
      } else {
        toast.error(data.message || "Failed to add feedback");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not connect to the server");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseTemplate = (template) => {
    setQuestion(template.question);
    setIsTemplate(false); // Assume they want to launch it now
    toast.success("Template loaded! Set your options and click Add Feedback.");
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const response = await fetch(`${API_URL}/feedback/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Template deleted successfully!");
        fetchTemplates();
      } else {
        toast.error(data.message || "Failed to delete template");
      }
    } catch (err) {
      console.error("Error deleting template:", err);
      toast.error("Could not connect to the server");
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Feedback Creation Form */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" /> Add Feedback
            </h3>
            <p className="text-xs text-gray-400 mt-1">Ask questions, collect ratings, and improve your food service quality dynamically.</p>
          </div>

          <form onSubmit={handleAddFeedback} className="space-y-6">
            
            {/* Tiffin Service Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Select Tiffin Service</label>
              {menus.length === 0 ? (
                <p className="text-xs text-red-500 italic">No active menus. Please create a menu first.</p>
              ) : (
                <select 
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  {menus.map((menu) => (
                    <option key={menu._id} value={menu._id}>
                      {menu.title} ({menu.shift})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Question Text Area */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Feedback Question</label>
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                rows="3"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none text-sm font-semibold"
                placeholder="e.g. How did you like today's Paneer Butter Masala and Butter Roti?"
              ></textarea>
            </div>

            {/* Expiry and Interval Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Active Duration (Expires At) */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-500" /> Active Duration
                </label>
                <select 
                  value={expiresHours}
                  onChange={(e) => setExpiresHours(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                >
                  <option value={12}>Active for 12 Hours</option>
                  <option value={24}>Active for 24 Hours</option>
                  <option value={48}>Active for 2 days</option>
                  <option value={168}>Active for 7 days</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1.5 leading-normal">
                  This is the time period during which the rating prompt will be active for consumers.
                </p>
              </div>

              {/* Pop-up Frequency (Reoccurrence Interval) */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-orange-500" /> Reoccurrence Frequency
                </label>
                <select 
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                >
                  <option value={0}>One-time feedback (Once rated, it won't pop up again)</option>
                  <option value={1}>Ask Daily (Pops up every 24 hours)</option>
                  <option value={2}>Ask Every 2 Days</option>
                  <option value={3}>Ask Every 3 Days</option>
                  <option value={5}>Ask Every 5 Days</option>
                  <option value={7}>Ask Weekly (Pops up every 7 days)</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1.5 leading-normal">
                  Specifies the rest interval. Once answered, how many days to wait before prompting the user again.
                </p>
              </div>

            </div>

            {/* Save Template Checkbox */}
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <input 
                id="isTemplate"
                type="checkbox" 
                checked={isTemplate}
                onChange={(e) => setIsTemplate(e.target.checked)}
                className="w-4.5 h-4.5 accent-orange-500 cursor-pointer"
              />
              <label htmlFor="isTemplate" className="text-xs font-bold text-gray-700 cursor-pointer">
                Also save this feedback as a template for future reuse
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setActiveTab('overview')} 
                className="px-5 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Add Feedback 🚀</span>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Templates Library Column */}
        <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 flex flex-col h-full min-h-[450px]">
          <h3 className="font-extrabold text-gray-800 text-base mb-2 flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> Templates Library
          </h3>
          <p className="text-[11px] text-gray-400 font-semibold mb-4">Quickly launch previously saved feedback questions.</p>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[400px] pr-1">
            {loadingTemplates ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-2">
                <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                <span className="text-[10px] font-bold text-amber-800">Loading templates...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-16 px-4 border border-dashed border-amber-200/60 rounded-xl bg-white/50">
                <HelpCircle className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-amber-800">No templates saved</h4>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                  Tick "Save as template" while creating a question to save it here for future reuse.
                </p>
              </div>
            ) : (
              templates.map((template) => (
                <div 
                  key={template._id}
                  className="bg-white p-3.5 rounded-xl border border-amber-100 hover:border-amber-300 hover:shadow-sm transition-all duration-300 flex flex-col justify-between gap-3 group relative"
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-xs font-bold text-gray-700 leading-relaxed flex-1">
                      "{template.question}"
                    </p>
                    <button
                      onClick={() => handleDeleteTemplate(template._id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors duration-200"
                      title="Delete Template"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-semibold text-gray-400">
                    <span>Saved template</span>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="px-2.5 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm text-[9px] font-black group-hover:scale-105 transition-transform"
                    >
                      Use Question
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
