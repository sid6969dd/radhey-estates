\"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50 px-4 md:px-0" ref={dropdownRef}>
      <div className="bg-white/10 backdrop-blur-3xl p-2 md:p-3 rounded-2xl md:rounded-full border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform transition-all hover:scale-[1.01]">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 1 && setShowDropdown(true)}
            placeholder="Search Panipat Colony..." 
            className="w-full md:flex-grow bg-white/90 rounded-xl md:rounded-full px-6 py-4 text-slate-900 font-bold outline-none shadow-inner text-sm md:text-base placeholder:text-slate-400" 
          />
          <button 
            onClick={() => query.trim() && router.push(`/search?area=${encodeURIComponent(query)}`)}
            className="w-full md:w-auto bg-gradient-to-r from-slate-900 to-slate-800 hover:from-orange-600 hover:to-orange-500 text-white px-8 py-4 md:py-5 rounded-xl md:rounded-full font-black text-[10px] md:text-xs tracking-[0.2em] transition-all duration-500 uppercase shadow-xl active:scale-95"
          >
            DISCOVER
          </button>
        </div>
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute w-full mt-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          {suggestions.map((s, i) => (
            <div key={i} onClick={() => {setQuery(s); setShowDropdown(false); router.push(`/search?area=${encodeURIComponent(s)}`);}} className="px-6 py-4 hover:bg-slate-100/80 cursor-pointer font-bold border-b border-slate-50 last:border-none transition-colors">
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [leadData, setLeadData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase.from('properties').select('*');
      if (!error && data) setProperties(data.sort(() => 0.5 - Math.random()));
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
    <main className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-orange-100">
      
      {/* 1. NAVIGATION */}
      <nav className="fixed top-0 w-full z-[150] bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-xl border-b border-slate-200/50 px-4 md:px-8 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 overflow-hidden rounded-xl bg-white shadow-inner border border-slate-100 flex items-center justify-center group transition-all hover:border-orange-500/50">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-110"
                onError={(e) => { e.currentTarget.src = "https://sid6969dd.github.io/radhey-estates/real-estate-engine/public/logo.png"; }}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                MS<span className="text-orange-600">Estates</span>
              </h1>
              <span className="hidden md:block text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase mt-1">Legacy Portfolio</span>
            </div>
          </div>
          <a href="#sell" className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 md:px-10 py-3 rounded-full font-black text-[9px] tracking-widest hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all active:scale-95 uppercase">
            Register Asset
          </a>
        </div>
      </nav>

      {/* 2. HERO */}
      <section className="relative min-h-[90vh] md:h-[95vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/20 to-[#F8F9FA] z-10"></div>
          <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071" className="w-full h-full object-cover scale-105" alt="Hero" />
        </div>

        <div className="relative z-20 text-center px-6 w-full max-w-6xl">
          <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] font-bold tracking-[0.4em] uppercase mb-8">
            Established Legacy • Since 2002
          </div>
          <h2 className="text-5xl md:text-[9rem] font-black text-white mb-8 tracking-tighter leading-[0.9] drop-shadow-2xl">
            Secure <br />
            <span className="italic uppercase text-slate-200 opacity-90 drop-shadow-lg">Premier Holdings.</span>
          </h2>
          
          <Suspense fallback={<div className="text-white font-bold tracking-widest">INITIALIZING INTERFACE...</div>}>
            <SearchContent properties={properties} setProperties={setProperties} />
          </Suspense>
        </div>
      </section>

      {/* 3. LISTINGS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 px-6 max-w-7xl mx-auto py-24">
        {properties.map((item) => (
          <div key={item.id} className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-3 transition-all duration-700 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] hover:-translate-y-4">
            <div className="h-64 md:h-80 bg-slate-100 rounded-[1.6rem] mb-6 overflow-hidden relative">
              <img src={item.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070'} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt={item.area} />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase text-slate-900 shadow-sm border border-white/50">
                {item.tag || 'Legacy'}
              </div>
            </div>
            <div className="px-4 pb-4">
                <h3 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">{item.area}</h3>
                <div className="text-xl font-bold text-orange-600/80 mb-6 italic">{item.price ? `₹ ${item.price}` : 'Portfolio Exclusive'}</div>
                {/* FIXED: Added onClick to redirect to property details */}
                <button 
                  onClick={() => router.push(`/property/${item.id}`)}
                  className="w-full bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all duration-500 border border-slate-200"
                >
                    Access Details
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. FORM */}
      <section id="sell" className="py-24 md:py-40 px-4 md:px-6">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-slate-900 to-[#1a1c20] rounded-[3rem] md:rounded-[5rem] p-10 md:p-24 relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="md:w-1/2 text-white">
              <h2 className="text-4xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-[0.85]">Anonymity<br /><span className="text-slate-500 italic font-light">Guaranteed.</span></h2>
              <p className="text-slate-400 text-lg md:text-2xl font-light italic leading-relaxed border-l-2 border-orange-600 pl-6">"Our mandate is the silent protection of your most significant acquisitions."</p>
            </div>
            <form onSubmit={handleLeadSubmit} className="md:w-1/2 w-full bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-10 md:p-14 shadow-2xl">
               <h4 className="text-slate-900 font-black text-2xl mb-8 uppercase tracking-tighter">Acquisition Inquiry</h4>
               <div className="space-y-5">
                  <input type="text" placeholder="Full Name" value={leadData.name} onChange={(e) => setLeadData({...leadData, name: e.target.value})} className="w-full p-5 bg-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 transition-all" required />
                  <input type="tel" placeholder="Private Line (Phone)" value={leadData.phone} onChange={(e) => setLeadData({...leadData, phone: e.target.value})} className="w-full p-5 bg-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 transition-all" required />
                  <button disabled={isSubmitting} className="w-full py-5 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase transition-all duration-500 shadow-lg active:scale-95">
                    {isSubmitting ? "PROCESSING..." : "REQUEST CONSULTATION"}
                  </button>
               </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
