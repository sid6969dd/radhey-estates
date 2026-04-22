"use client";

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
    <div className="relative w-full max-w-lg mx-auto z-[210]" ref={dropdownRef}>
      <div className="bg-white/80 backdrop-blur-md p-1 rounded-full border border-slate-200 shadow-xl flex items-center">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setShowDropdown(true)}
          placeholder="Explore areas..." 
          className="flex-grow bg-transparent px-6 py-3 text-slate-800 placeholder:text-slate-400 font-medium outline-none text-sm" 
        />
        <button 
          onClick={() => query.trim() && router.push(`/search?area=${encodeURIComponent(query)}`)}
          className="bg-slate-900 text-white px-8 py-3 rounded-full font-black text-[10px] tracking-[0.2em] transition-all hover:bg-orange-600 uppercase"
        >
          Discover
        </button>
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute w-full mt-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[300]">
          {suggestions.map((s, i) => (
            <div key={i} onClick={() => {setQuery(s); setShowDropdown(false); router.push(`/search?area=${encodeURIComponent(s)}`);}} className="px-6 py-4 hover:bg-slate-50 text-slate-800 cursor-pointer font-bold border-b border-slate-50 last:border-none transition-colors">
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
  const [eduLeadData, setEduLeadData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase.from('properties').select('*');
      if (!error && data) setProperties(data);
    };
    fetchProperties();
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
    const data = type === 'estate' ? leadData : eduLeadData;
    if (!data.name || !data.phone) return alert("Please fill all fields");
    setIsSubmitting(true);
    const { error } = await supabase.from('leads').insert([{ 
      full_name: data.name, 
      phone: data.phone, 
      property_area: type === 'estate' ? "General Real Estate" : "Education Inquiry" 
    }]);
    setIsSubmitting(false);
    if (!error) {
      alert("Consultation Request Received.");
      type === 'estate' ? setLeadData({ name: "", phone: "" }) : setEduLeadData({ name: "", phone: "" });
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFBF9] text-slate-900 font-sans selection:bg-orange-100">
      
      {/* 1. ELEGANT NAVIGATION */}
      <nav className="fixed top-0 w-full z-[500] bg-white/70 backdrop-blur-lg border-b border-slate-100 px-6 py-5">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black uppercase tracking-[0.3em] text-slate-900">
              MSestates <span className="text-orange-600 font-light">&</span> Education
            </h1>
          </div>
          <div className="hidden md:flex gap-10 items-center">
            <a href="#portfolio" className="text-[10px] font-black tracking-[0.2em] uppercase hover:text-orange-600 transition-colors">Portfolio</a>
            <a href="#concierge" className="text-[10px] font-black tracking-[0.2em] uppercase hover:text-orange-600 transition-colors">Concierge</a>
            <button onClick={() => router.push('/education')} className="bg-slate-900 text-white px-8 py-3 rounded-full font-black text-[9px] tracking-[0.2em] uppercase hover:shadow-xl transition-all">
              Apply 2026
            </button>
          </div>
        </div>
      </nav>

      {/* 2. SPLIT HERO SECTION */}
      <section className="relative h-[95vh] flex flex-col md:flex-row overflow-hidden pt-20">
        {/* Estates Half */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group overflow-hidden border-r border-slate-50">
          <img 
            src="https://images.unsplash.com/photo-1600607687940-c52af04657b3?q=80&w=2070" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-105" 
            alt="Real Estate" 
          />
          <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors duration-700"></div>
          <div className="relative h-full flex flex-col justify-end p-10 md:p-24 z-20">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-8 text-white drop-shadow-lg">
              Luxury <br /><span className="italic font-light">Holdings.</span>
            </h2>
            <SearchContent properties={properties} />
          </div>
        </div>

        {/* Education Half */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?q=80&w=2070" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-105" 
            alt="Education" 
          />
          <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/10 transition-colors duration-700"></div>
          <div className="relative h-full flex flex-col justify-end p-10 md:p-24 z-20">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-8 text-white drop-shadow-lg">
              Global <br /><span className="italic font-light">Academia.</span>
            </h2>
            <button 
              onClick={() => router.push('/education')}
              className="w-fit bg-white text-slate-900 px-10 py-5 rounded-full font-black text-[10px] tracking-[0.3em] uppercase hover:bg-orange-600 hover:text-white transition-all shadow-2xl"
            >
              Explore Universities
            </button>
          </div>
        </div>
      </section>

      {/* 3. PROPERTY SHOWCASE */}
      <section id="portfolio" className="py-32 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-orange-600 font-black text-[10px] tracking-[0.5em] uppercase mb-4 block">Curated Collection</span>
              <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none text-slate-900">Premier <br />NCR Portfolio</h3>
            </div>
            <p className="text-slate-400 text-lg italic max-w-sm font-medium border-l border-slate-200 pl-8">
              "We provide silent access to the region's most prestigious commercial and residential assets."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {properties.map((item) => (
              <div key={item.id} className="group cursor-pointer" onClick={() => router.push(`/property/${item.id}`)}>
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070'} 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                    alt={item.area} 
                  />
                </div>
                <div className="px-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900">{item.area}</h4>
                    <span className="text-[10px] font-black tracking-widest text-orange-600 uppercase">{item.tag || 'Legacy'}</span>
                  </div>
                  <p className="text-xl font-medium text-slate-500 italic">{item.price ? `₹ ${item.price}` : 'Consult for Pricing'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DUAL CONCIERGE FORMS */}
      <section id="concierge" className="py-32 px-4 bg-[#F4F2EE]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-900 mb-4">The Concierge</h2>
            <div className="h-1 w-20 bg-orange-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Real Estate Intake */}
            <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-slate-100">
              <div className="mb-10">
                <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">Estate Intake</h4>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Property Registration & Sales</p>
              </div>
              <form onSubmit={(e) => handleLeadSubmit(e, 'estate')} className="space-y-6">
                <input 
                  type="text" 
                  placeholder="Owner / Representative Name" 
                  value={leadData.name}
                  onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                  className="w-full bg-slate-50 border-none p-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600/20 font-bold text-slate-900 placeholder:text-slate-300 transition-all" 
                />
                <input 
                  type="tel" 
                  placeholder="Private Contact Number" 
                  value={leadData.phone}
                  onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                  className="w-full bg-slate-50 border-none p-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600/20 font-bold text-slate-900 placeholder:text-slate-300 transition-all" 
                />
                <button 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-[10px] tracking-[0.3em] uppercase hover:bg-orange-600 transition-all shadow-lg"
                >
                  {isSubmitting ? "Processing..." : "Submit to Portfolio"}
                </button>
              </form>
            </div>

            {/* Education Intake */}
            <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-slate-100">
              <div className="mb-10">
                <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">Scholastic Intake</h4>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Global University Admissions</p>
              </div>
              <form onSubmit={(e) => handleLeadSubmit(e, 'edu')} className="space-y-6">
                <input 
                  type="text" 
                  placeholder="Candidate Name" 
                  value={eduLeadData.name}
                  onChange={(e) => setEduLeadData({...eduLeadData, name: e.target.value})}
                  className="w-full bg-slate-50 border-none p-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600/20 font-bold text-slate-900 placeholder:text-slate-300 transition-all" 
                />
                <input 
                  type="tel" 
                  placeholder="Primary Contact Number" 
                  value={eduLeadData.phone}
                  onChange={(e) => setEduLeadData({...eduLeadData, phone: e.target.value})}
                  className="w-full bg-slate-50 border-none p-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600/20 font-bold text-slate-900 placeholder:text-slate-300 transition-all" 
                />
                <button 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-orange-600 text-white rounded-full font-black text-[10px] tracking-[0.3em] uppercase hover:bg-slate-900 transition-all shadow-lg"
                >
                  {isSubmitting ? "Processing..." : "Request Briefing"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MINIMAL FOOTER */}
      <footer className="py-20 border-t border-slate-100 bg-white px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <h1 className="text-xl font-black uppercase tracking-[0.3em] text-slate-900">
            MSestates <span className="text-orange-600 font-light">&</span> Education
          </h1>
          <div className="flex gap-8 text-[9px] font-black tracking-[0.2em] uppercase text-slate-400">
            <span className="cursor-pointer hover:text-slate-900 transition-colors">Instagram</span>
            <span className="cursor-pointer hover:text-slate-900 transition-colors">LinkedIn</span>
            <span className="cursor-pointer hover:text-slate-900 transition-colors">Terms</span>
          </div>
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">© 2026 MSestates. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}
