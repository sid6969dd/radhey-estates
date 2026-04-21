"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }
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
    const timeoutId = setTimeout(() => fetchSuggestions(), 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchRedirection = () => {
    if (query.trim()) {
      router.push(`/search?area=${encodeURIComponent(query)}`);
    } else {
      alert("Please enter a colony name.");
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData.name || !leadData.phone) return alert("Please fill all fields");
    setIsSubmitting(true);
    const { error } = await supabase
      .from('leads')
      .insert([{ full_name: leadData.name, phone: leadData.phone, property_area: "General Inquiry (MSEstates-Silver)" }]);
    setIsSubmitting(false);
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Success! A senior executive will call you shortly.");
      setLeadData({ name: "", phone: "" });
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-slate-200 relative">
      
      {/* 1. LUXURY NAVIGATION (MSEstates-Silver) */}
      <nav className="fixed top-0 w-full z-[150] bg-white/95 backdrop-blur-2xl border-b border-slate-100 px-6 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-5">
            {/* INTERACTIVE BRAND LOGO */}
            <div className="relative group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="w-14 h-14 overflow-hidden rounded-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-2xl flex items-center justify-center bg-white border border-slate-100">
                <img 
                  src="/logo.png" 
                  alt="MSEstates Logo" 
                  className="w-full h-full object-contain p-1.5 transition-all duration-700 group-hover:brightness-110"
                />
              </div>
              {/* Silver Status Dot */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-400 rounded-full border-2 border-white animate-pulse shadow-md"></div>
            </div>
            <div className="flex flex-col text-left">
              <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none text-slate-900 uppercase">
                {/* Silver Gradient applied via CSS */}
                MS<span className="bg-gradient-to-b from-slate-200 via-slate-500 to-slate-200 bg-clip-text text-transparent">Estates</span>
              </h1>
              <p className="text-[7px] md:text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase mt-1">Curating Legacy Holdings</p>
            </div>
          </div>
          <a href="#sell" className="bg-slate-900 text-white px-5 md:px-8 py-3.5 rounded-full font-bold text-[9px] md:text-[10px] tracking-widest hover:bg-slate-700 transition-all shadow-xl whitespace-nowrap">
            REGISTER PRIVATE ASSET
          </a>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden z-10">
        <div className="absolute inset-0 z-0 scale-105">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/10 to-[#FDFCFB] z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071" 
            className="w-full h-full object-cover" 
            alt="MSEstates Luxury Properties" 
          />
        </div>

        <div className="relative z-20 text-center px-6 w-full max-w-5xl">
          <span className="inline-block text-slate-300 font-black tracking-[0.5em] uppercase text-[10px] mb-6 animate-pulse">Established Legacy, Since 2002</span>
          <h2 className="text-5xl md:text-[8.5rem] font-black text-white mb-10 tracking-tighter leading-[0.85]">
            Secure <br />
            <span className="italic font-serif bg-gradient-to-b from-slate-200 to-slate-400 bg-clip-text text-transparent uppercase text-4xl md:text-[7rem]">Premier Holdings.</span>
          </h2>
          
          {/* SEARCH COMPONENT (Silver Accent) */}
          <div className="relative max-w-2xl mx-auto z-50" ref={dropdownRef}>
            <div className="bg-white/10 backdrop-blur-2xl p-3 rounded-full border border-white/20 shadow-3xl">
              <div className="flex flex-row items-center gap-2">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.length > 1 && setShowDropdown(true)}
                  placeholder="Search Panipat Colony..." 
                  className="flex-grow bg-white rounded-full px-6 py-4 md:py-5 text-slate-900 font-bold outline-none shadow-inner text-sm md:text-base placeholder:font-medium placeholder:text-slate-300" 
                />
                <button 
                  onClick={handleSearchRedirection}
                  className="bg-slate-900 hover:bg-slate-700 text-white px-6 md:px-10 py-4 md:py-5 rounded-full font-black text-[10px] md:text-xs tracking-widest transition-all uppercase whitespace-nowrap shadow-xl"
                >
                  <span className="bg-gradient-to-b from-slate-100 to-slate-400 bg-clip-text text-transparent">Discover</span>
                </button>
              </div>
            </div>

            {showDropdown && suggestions.length > 0 && (
              <div className="absolute w-full mt-3 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-[100] text-left">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    onClick={() => {
                      setQuery(suggestion);
                      setShowDropdown(false);
                      router.push(`/search?area=${encodeURIComponent(suggestion)}`);
                    }}
                    className="px-8 py-4 hover:bg-slate-50 cursor-pointer text-slate-900 font-bold border-b border-slate-100/50 last:border-none transition-colors"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 px-6 max-w-7xl mx-auto py-20">
        {properties.map((item) => (
          <div key={item.id} className="group bg-white rounded-[3rem] overflow-hidden shadow-lg p-5 transition-all hover:-translate-y-3">
            <div className="h-64 md:h-72 bg-slate-100 rounded-[2.5rem] mb-6 md:mb-8 overflow-hidden">
              <img 
                src={item.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070'} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={item.area} 
              />
            </div>
            {/* Silver Badge Tag */}
            <p className="inline-block bg-slate-100 text-slate-600 font-black text-[9px] uppercase tracking-widest mb-3 px-4 py-1.5 rounded-full border border-slate-200">{item.tag || 'Legacy Portfolio'}</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase">{item.area}</h3>
            <div className="text-lg md:text-xl font-bold text-slate-400 mb-6 md:mb-8 italic">{item.price ? `₹ ${item.price}` : 'Price on Request'}</div>
            <button onClick={() => router.push(`/property/${item.id}`)} className="w-full bg-slate-900 text-white py-4 rounded-[1.2rem] font-bold text-xs hover:bg-slate-700 transition-all uppercase tracking-widest">
              View Briefing
            </button>
          </div>
        ))}
      </div>
        
      {/* 4. SELLER SECTION */}
      <section id="sell" className="py-20 md:py-32 px-4 md:px-6 z-30">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[3rem] md:rounded-[4rem] p-10 md:p-24 relative overflow-hidden shadow-2xl border-2 border-slate-800">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" alt="Background" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="md:w-1/2 text-white text-left">
              <h2 className="text-4xl md:text-7xl font-black leading-[0.9] mb-8 md:mb-10 tracking-tighter uppercase">Anonymity<br /><span className="bg-gradient-to-b from-slate-100 to-slate-400 bg-clip-text text-transparent italic font-serif">Confirmed.</span></h2>
              <p className="text-slate-400 text-lg md:text-xl mb-10 md:mb-12 font-light leading-relaxed italic">"Protecting your legacy holds."</p>
            </div>
            <form onSubmit={handleLeadSubmit} className="md:w-1/2 w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-3xl text-left border border-slate-100">
               <h4 className="text-slate-900 font-black text-xl md:text-2xl mb-8 uppercase tracking-tighter">Private Listing Request</h4>
               <div className="space-y-4 md:space-y-6">
                  <input type="text" placeholder="Owner Full Name" value={leadData.name} onChange={(e) => setLeadData({...leadData, name: e.target.value})} className="w-full p-5 md:p-6 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-slate-400 transition-all placeholder:font-medium placeholder:text-slate-300" required />
                  <input type="tel" placeholder="Mobile Number" value={leadData.phone} onChange={(e) => setLeadData({...leadData, phone: e.target.value})} className="w-full p-5 md:p-6 bg-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-slate-400 transition-all placeholder:font-medium placeholder:text-slate-300" required />
                  <button disabled={isSubmitting} className={`w-full py-5 md:py-6 rounded-2xl font-black text-xs md:text-sm tracking-widest transition-all uppercase shadow-xl ${isSubmitting ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-700 text-white'}`}>
                    {isSubmitting ? "Submitting..." : "Secure Consultation"}
                  </button>
               </div>
            </form>
          </div>
        </div>
      </section>

      {/* 5. WHATSAPP (Now Cold Blue/Silver) */}
      <a 
        href="https://wa.me/919876543210?text=Hello%20MSEstates,%20I'm%20interested%20in%20discussing%20your%20premier%20holdings." 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-slate-800 text-white p-3 md:p-4 rounded-full shadow-2xl hover:scale-110 hover:-translate-y-2 transition-all duration-300 z-[200] flex items-center justify-center group border border-slate-600"
      >
        <span className="absolute inset-0 rounded-full bg-slate-600 animate-ping opacity-20 group-hover:hidden"></span>
        <svg viewBox="0 0 448 512" className="w-6 h-6 md:w-8 md:h-8 relative z-10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.5-.3-8.5 2.4-11.2 2.5-2.6 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.2 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>
    </main>
  );
}