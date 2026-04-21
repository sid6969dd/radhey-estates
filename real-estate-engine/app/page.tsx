"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Separate component to handle Search Logic safely with Suspense
function SearchContent({ properties, setProperties }: { properties: any[], setProperties: any }) {
  const router = useRouter();
  const [query, setQuery] = useState(""); 
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSearchRedirection = () => {
    if (query.trim()) {
      router.push(`/search?area=${encodeURIComponent(query)}`);
    } else {
      alert("Please enter a colony name.");
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50 px-4 md:px-0" ref={dropdownRef}>
      <div className="bg-white/10 backdrop-blur-2xl p-2 md:p-3 rounded-2xl md:rounded-full border border-white/20 shadow-3xl">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 1 && setShowDropdown(true)}
            placeholder="Search Panipat Colony..." 
            className="w-full md:flex-grow bg-white rounded-xl md:rounded-full px-6 py-4 text-slate-900 font-bold outline-none shadow-inner text-sm md:text-base" 
          />
          <button 
            onClick={handleSearchRedirection}
            className="w-full md:w-auto bg-slate-900 hover:bg-slate-700 text-white px-8 py-4 md:py-5 rounded-xl md:rounded-full font-black text-[10px] md:text-xs tracking-widest transition-all uppercase shadow-xl"
          >
            DISCOVER
          </button>
        </div>
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute w-full mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100]">
          {suggestions.map((s, i) => (
            <div key={i} onClick={() => {setQuery(s); setShowDropdown(false); router.push(`/search?area=${encodeURIComponent(s)}`);}} className="px-6 py-4 hover:bg-slate-50 cursor-pointer font-bold border-b last:border-none">
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [properties, setProperties] = useState<any[]>([]);
  const [leadData, setLeadData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase.from('properties').select('*');
      if (!error && data) {
        setProperties(data.sort(() => 0.5 - Math.random()));
      }
    };
    fetchProperties();
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData.name || !leadData.phone) return alert("Please fill all fields");
    setIsSubmitting(true);
    const { error } = await supabase.from('leads').insert([{ full_name: leadData.name, phone: leadData.phone, property_area: "General Inquiry" }]);
    setIsSubmitting(false);
    if (!error) {
      alert("Success! We will call you shortly.");
      setLeadData({ name: "", phone: "" });
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-slate-200">
      
      {/* 1. NAVIGATION */}
      <nav className="fixed top-0 w-full z-[150] bg-white/95 backdrop-blur-2xl border-b border-slate-100 px-4 md:px-8 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="w-12 h-12 md:w-14 md:h-14 overflow-hidden rounded-xl md:rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center bg-white">
              <img 
                src="/logo.png" 
                alt="MSEstates Logo" 
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                    // Fallback to the exact logo from your brand image
                    e.currentTarget.src = "https://sid6969dd.github.io/radhey-estates/real-estate-engine/public/logo.png";
                }}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-2xl font-black tracking-tight text-slate-900 uppercase">
                MS<span className="text-orange-600">Estates</span>
              </h1>
              <p className="hidden md:block text-[8px] font-bold text-slate-400 tracking-widest uppercase">Curating Legacy Holdings</p>
            </div>
          </div>
          <a href="#sell" className="bg-slate-900 text-white px-4 md:px-8 py-2.5 md:py-3.5 rounded-full font-bold text-[8px] md:text-[10px] tracking-widest hover:bg-slate-700 transition-all shadow-xl">
            REGISTER ASSET
          </a>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-[90vh] md:h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900/40 z-10"></div>
          <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071" className="w-full h-full object-cover" alt="Hero" />
        </div>

        <div className="relative z-20 text-center px-6 w-full max-w-5xl">
          <h2 className="text-4xl md:text-[8.5rem] font-black text-white mb-6 md:mb-10 tracking-tighter leading-tight md:leading-[0.85]">
            Secure <br />
            <span className="italic uppercase text-3xl md:text-[7rem] text-slate-200">Premier Holdings.</span>
          </h2>
          
          <Suspense fallback={<div className="text-white">Loading Search...</div>}>
            <SearchContent properties={properties} setProperties={setProperties} />
          </Suspense>
        </div>
      </section>

      {/* 3. LISTINGS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 px-6 max-w-7xl mx-auto py-16 md:py-20">
        {properties.map((item) => (
          <div key={item.id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-md p-4 transition-all hover:-translate-y-2">
            <div className="h-56 md:h-72 bg-slate-100 rounded-[2rem] mb-6 overflow-hidden">
              <img src={item.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070'} className="w-full h-full object-cover group-hover:scale-110 transition-duration-700" alt={item.area} />
            </div>
            <p className="inline-block bg-slate-50 text-slate-500 font-bold text-[8px] uppercase tracking-widest mb-2 px-3 py-1 rounded-full border">{item.tag || 'Legacy Portfolio'}</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-1 uppercase">{item.area}</h3>
            <div className="text-lg font-bold text-slate-400 mb-6 italic">{item.price ? `₹ ${item.price}` : 'Price on Request'}</div>
            <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-[10px] tracking-widest uppercase">View Briefing</button>
          </div>
        ))}
      </div>

      {/* 4. FORM SECTION */}
      <section id="sell" className="py-16 md:py-32 px-4 md:px-6">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 relative overflow-hidden border border-slate-800">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-20">
            <div className="md:w-1/2 text-white text-left">
              <h2 className="text-3xl md:text-7xl font-black mb-6 tracking-tighter uppercase">Anonymity<br /><span className="text-slate-400 italic">Confirmed.</span></h2>
              <p className="text-slate-400 text-base md:text-xl font-light italic">"Protecting your legacy holds."</p>
            </div>
            <form onSubmit={handleLeadSubmit} className="md:w-1/2 w-full bg-white rounded-[2rem] p-8 md:p-12">
               <h4 className="text-slate-900 font-black text-xl mb-6 uppercase">Private Listing Request</h4>
               <div className="space-y-4">
                  <input type="text" placeholder="Full Name" value={leadData.name} onChange={(e) => setLeadData({...leadData, name: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-xl outline-none font-bold" required />
                  <input type="tel" placeholder="Mobile Number" value={leadData.phone} onChange={(e) => setLeadData({...leadData, phone: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 rounded-xl outline-none font-bold" required />
                  <button disabled={isSubmitting} className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-xl font-black text-xs tracking-widest uppercase">
                    {isSubmitting ? "Submitting..." : "Secure Consultation"}
                  </button>
               </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
