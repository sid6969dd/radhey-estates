\"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function SearchContent({ properties }: { properties: any[] }) {
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
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="relative w-full max-w-2xl mx-auto z-[210] px-4 md:px-0" ref={dropdownRef}>
      <div className="bg-white/10 backdrop-blur-3xl p-2 md:p-3 rounded-2xl md:rounded-full border border-white/30 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 1 && setShowDropdown(true)}
            placeholder="Search Panipat Colony..." 
            className="w-full md:flex-grow bg-white/90 rounded-xl md:rounded-full px-6 py-4 text-slate-900 font-bold outline-none text-sm md:text-base" 
          />
          <button 
            onClick={() => query.trim() && router.push(`/search?area=${encodeURIComponent(query)}`)}
            className="w-full md:w-auto bg-slate-900 hover:bg-orange-600 text-white px-8 py-4 md:py-5 rounded-xl md:rounded-full font-black text-[10px] md:text-xs tracking-widest transition-all uppercase shadow-xl"
          >
            DISCOVER
          </button>
        </div>
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute w-full mt-4 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[300]">
          {suggestions.map((s, i) => (
            <div key={i} onClick={() => {setQuery(s); setShowDropdown(false); router.push(`/search?area=${encodeURIComponent(s)}`);}} className="px-6 py-4 hover:bg-slate-100 cursor-pointer font-bold border-b last:border-none">
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
      if (!error && data) setProperties(data);
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
    <main className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans">
      
      {/* 1. NAVIGATION */}
      <nav className="fixed top-0 w-full z-[500] bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 overflow-hidden rounded-xl bg-white border border-slate-100 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain p-1.5"
                onError={(e) => { e.currentTarget.src = "https://sid6969dd.github.io/radhey-estates/real-estate-engine/public/logo.png"; }}
              />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase">
              MS<span className="text-orange-600">Estates</span>
            </h1>
          </div>
          <a href="#sell" className="bg-slate-900 text-white px-6 md:px-10 py-3 rounded-full font-black text-[9px] tracking-widest uppercase">
            Register Asset
          </a>
        </div>
      </nav>

      {/* 2. HERO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900/40 z-10"></div>
          <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071" className="w-full h-full object-cover" alt="Hero" />
        </div>
        <div className="relative z-20 text-center px-6 w-full max-w-6xl">
          <h2 className="text-5xl md:text-[8rem] font-black text-white mb-8 tracking-tighter leading-[0.9]">
            Secure <br />
            <span className="italic uppercase text-slate-200 opacity-90">Premier Holdings.</span>
          </h2>
          <Suspense fallback={<div className="text-white font-bold">LOADING...</div>}>
            <SearchContent properties={properties} />
          </Suspense>
        </div>
      </section>

      {/* 3. LISTINGS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 px-6 max-w-7xl mx-auto py-24 relative z-[100]">
        {properties.map((item) => (
          <div key={item.id} className="group bg-white rounded-[2rem] border border-slate-100 p-3 shadow-lg transition-all hover:-translate-y-4 relative z-[110]">
            <div className="h-64 md:h-80 bg-slate-100 rounded-[1.6rem] mb-6 overflow-hidden">
              <img src={item.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070'} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.area} />
            </div>
            <div className="px-4 pb-4">
                <h3 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">{item.area}</h3>
                <div className="text-xl font-bold text-orange-600 mb-6 italic">{item.price ? `₹ ${item.price}` : 'Portfolio Exclusive'}</div>
                <button 
                  onClick={() => router.push(`/property/${item.id}`)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-colors hover:bg-orange-600 relative z-[120]"
                >
                    Access Details
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. FORM SECTION */}
      <section id="sell" className="py-24 px-4 relative z-[100]">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-[3rem] p-10 md:p-20 border border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 text-white">
              <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter uppercase">Anonymity<br /><span className="text-slate-500 italic">Guaranteed.</span></h2>
              <p className="text-slate-400 text-lg md:text-xl font-light italic border-l-2 border-orange-600 pl-6">"Secure your legacy acquisitions today."</p>
            </div>
            <form onSubmit={handleLeadSubmit} className="md:w-1/2 w-full bg-white rounded-[2rem] p-10 shadow-2xl">
               <h4 className="text-slate-900 font-black text-2xl mb-8 uppercase">Acquisition Inquiry</h4>
               <div className="space-y-5">
                  <input type="text" placeholder="Full Name" value={leadData.name} onChange={(e) => setLeadData({...leadData, name: e.target.value})} className="w-full p-5 bg-slate-100 rounded-2xl outline-none font-bold" required />
                  <input type="tel" placeholder="Phone Number" value={leadData.phone} onChange={(e) => setLeadData({...leadData, phone: e.target.value})} className="w-full p-5 bg-slate-100 rounded-2xl outline-none font-bold" required />
                  <button disabled={isSubmitting} className="w-full py-5 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all">
                    {isSubmitting ? "SENDING..." : "REQUEST CONSULTATION"}
                  </button>
               </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
