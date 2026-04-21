"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [query, setQuery] = useState(""); 
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [leadData, setLeadData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // LOGIC: Fetch and Shuffle Properties
  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase.from('properties').select('*');
      if (!error && data) {
        const shuffled = data.sort(() => 0.5 - Math.random());
        setProperties(shuffled);
      }
    };
    fetchProperties();
  }, []);

  // LOGIC: Fetch Live Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      // Filter by the 'area' column (text) instead of the UUID
      const { data, error } = await supabase
        .from('properties')
        .select('area')
        .ilike('area', `%${query}%`) 
        .limit(5);

      if (!error && data) {
        const areaNames = Array.from(new Set(data.map(item => item.area)));
        setSuggestions(areaNames as string[]);
        setShowDropdown(true);
      }
    };

    // Small delay to prevent too many database requests while typing fast
    const timeoutId = setTimeout(() => fetchSuggestions(), 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // LOGIC: Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // LOGIC: Search Redirection
  const handleSearchRedirection = () => {
    if (query.trim()) {
      router.push(`/search?area=${encodeURIComponent(query)}`);
    } else {
      alert("Please enter a colony name to discover assets.");
    }
  };

  // LOGIC: Handle Lead Submission
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData.name || !leadData.phone) return alert("Please fill all fields");
    setIsSubmitting(true);
    const { error } = await supabase
      .from('leads')
      .insert([{ full_name: leadData.name, phone: leadData.phone }]);
    setIsSubmitting(false);
    if (error) {
      alert("Error saving request: " + error.message);
    } else {
      alert("Success! Our executive will call you shortly.");
      setLeadData({ name: "", phone: "" });
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-orange-100 relative">
      
      {/* 1. LUXURY NAVIGATION */}
      <nav className="fixed top-0 w-full z-[150] bg-white/90 backdrop-blur-xl border-b border-slate-100 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 border-2 border-slate-900 flex items-center justify-center rotate-45 transition-transform group-hover:rotate-[135deg] duration-500">
                <span className="text-lg font-serif text-slate-900 font-black -rotate-45 group-hover:rotate-[-135deg] transition-transform duration-500">R</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex flex-col text-left">
              <h1 className="text-xl font-black tracking-[0.15em] leading-none text-slate-900 uppercase">
                Radhey<span className="text-orange-500">Estate</span>
              </h1>
              <p className="text-[8px] font-bold text-slate-400 tracking-[0.4em] uppercase mt-1">Divine Property Group</p>
            </div>
          </div>
          <a href="#sell" className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold text-[10px] tracking-widest hover:bg-orange-600 transition-all shadow-lg">
            REGISTER ASSET
          </a>
        </div>
      </nav>

      {/* 2. ELITE HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden z-10">
        <div className="absolute inset-0 z-0 scale-105">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/20 to-[#FDFCFB] z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071" 
            className="w-full h-full object-cover" 
            alt="Divine Properties" 
          />
        </div>

        <div className="relative z-20 text-center px-6 w-full max-w-5xl">
          <span className="inline-block text-orange-400 font-black tracking-[0.5em] uppercase text-[10px] mb-6 animate-pulse">Established 2002</span>
          <h2 className="text-6xl md:text-[8.5rem] font-black text-white mb-10 tracking-tighter leading-[0.85]">
            Secure <br />
            <span className="italic font-serif text-orange-200 uppercase">Divine Properties.</span>
          </h2>
          
          {/* THE SMART SEARCH COMPONENT */}
          <div className="relative max-w-2xl mx-auto z-50" ref={dropdownRef}>
            <div className="bg-white/10 backdrop-blur-2xl p-4 rounded-[3rem] border border-white/30 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-3">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.length > 1 && setShowDropdown(true)}
                  placeholder="Enter colony name..." 
                  className="flex-grow bg-white rounded-[2rem] p-6 text-slate-900 font-bold outline-none shadow-inner" 
                />
                <button 
                  onClick={handleSearchRedirection}
                  className="bg-slate-900 hover:bg-orange-600 text-white px-14 py-6 rounded-[2rem] font-black text-xs tracking-widest transition-all uppercase"
                >
                  Discover
                </button>
              </div>
            </div>

            {/* LIVE SUGGESTIONS DROPDOWN */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute w-full mt-4 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-[100] text-left">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    onClick={() => {
                      setQuery(suggestion);
                      setShowDropdown(false);
                      router.push(`/search?area=${encodeURIComponent(suggestion)}`);
                    }}
                    className="px-8 py-5 hover:bg-orange-50 cursor-pointer text-slate-900 font-bold border-b border-slate-100/50 last:border-none transition-colors"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. CURATED LISTINGS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-6 max-w-7xl mx-auto py-20">
        {properties.map((item) => (
          <div key={item.id} className="group bg-white rounded-[3.5rem] overflow-hidden shadow-lg p-6 transition-all hover:-translate-y-3">
            <div className="h-72 bg-slate-100 rounded-[2.5rem] mb-8 overflow-hidden">
              <img 
                src={item.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070'} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={item.area || 'Property'} 
              />
            </div>
            <p className="text-orange-500 font-black text-[10px] uppercase tracking-widest mb-3">{item.tag || 'Luxury Asset'}</p>
            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase">{item.area}</h3>
            <div className="text-xl font-bold text-slate-400 mb-8 italic">{item.price ? `₹ ${item.price}` : 'Price on Request'}</div>
            <button onClick={() => router.push(`/property/${item.id}`)} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-bold text-xs hover:bg-orange-600 transition-all uppercase">
              Request Details
            </button>
          </div>
        ))}
      </div>
       
      {/* 4. PRESTIGE SELLER SECTION */}
      <section id="sell" className="relative py-32 px-6 z-30">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden shadow-2xl">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" alt="Background" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-20">
            <div className="md:w-1/2 text-white text-left">
              <h2 className="text-5xl md:text-7xl font-black leading-[0.9] mb-10 tracking-tighter uppercase">Privacy is <br /><span className="text-orange-400 italic font-serif">Power.</span></h2>
              <p className="text-slate-400 text-xl mb-12 font-light leading-relaxed italic">"We keep your contact private. We verify the buyer. You just sign the deal."</p>
            </div>
            <form onSubmit={handleLeadSubmit} className="md:w-1/2 w-full bg-white rounded-[3rem] p-12 shadow-2xl text-left">
               <h4 className="text-slate-900 font-black text-2xl mb-10 uppercase tracking-tighter">Private Asset Appraisal</h4>
               <div className="space-y-6">
                  <input type="text" placeholder="Full Name" value={leadData.name} onChange={(e) => setLeadData({...leadData, name: e.target.value})} className="w-full p-6 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 transition-all" required />
                  <input type="tel" placeholder="Mobile Number" value={leadData.phone} onChange={(e) => setLeadData({...leadData, phone: e.target.value})} className="w-full p-6 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 transition-all" required />
                  <button disabled={isSubmitting} className={`w-full py-6 rounded-2xl font-black text-sm tracking-widest transition-all uppercase shadow-xl ${isSubmitting ? 'bg-slate-400' : 'bg-slate-900 hover:bg-orange-600 text-white'}`}>
                    {isSubmitting ? "Sending..." : "Request Callback"}
                  </button>
               </div>
            </form>
          </div>
        </div>
      </section>
      {/* 5. FLOATING WHATSAPP BUTTON (ADD IT HERE) */}
     {/* 5. OFFICIAL WHATSAPP FLOATING BUTTON */}
      <a 
        href="https://wa.me/919876543210?text=Hello%20Radhey%20Estate,%20I'm%20interested%20in%20your%20properties." 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_40px_rgba(37,211,102,0.4)] hover:scale-110 hover:-translate-y-2 transition-all duration-300 z-[200] flex items-center justify-center group"
      >
        {/* Subtle Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:hidden"></span>
        
        <svg 
          viewBox="0 0 448 512" 
          className="w-8 h-8 relative z-10" 
          fill="currentColor" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.5-.3-8.5 2.4-11.2 2.5-2.6 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.2 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>
    </main>
  );
}