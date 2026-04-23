"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// --- Supabase Configuration ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Components ---

/**
 * Flag Icon Helper - Refined with better contrast and hover states
 */
const Flag = ({ code, name }: { code: string; name: string }) => (
  <div className="flex flex-col items-center gap-2 group cursor-default">
    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-orange-500">
      <img 
        src={`https://flagcdn.com/w80/${code}.png`} 
        alt={name} 
        className="w-full h-full object-cover"
      />
    </div>
    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors">
      {name}
    </span>
  </div>
);

/**
 * Search Bar - Fixed Z-Index and Dropdown Positioning
 */
function SearchContent({ properties }: { properties: any[] }) {
  const router = useRouter();
  const [query, setQuery] = useState(""); 
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="relative w-full max-w-lg z-[100]" ref={dropdownRef}>
      <div className="bg-white/95 backdrop-blur-xl p-1.5 rounded-full border border-white/20 shadow-2xl flex items-center transition-all focus-within:ring-2 focus-within:ring-orange-500/50">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setShowDropdown(true)}
          placeholder="Search by area (e.g. Sector 74)..." 
          className="flex-grow bg-transparent px-6 py-3 text-slate-900 placeholder:text-slate-400 font-semibold outline-none text-sm" 
        />
        <button 
          onClick={() => query.trim() && router.push(`/search?area=${encodeURIComponent(query)}`)}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-black text-[11px] tracking-widest transition-all hover:bg-orange-600 uppercase shadow-lg active:scale-95"
        >
          Search
        </button>
      </div>
      
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute w-full mt-3 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((s, i) => (
            <div 
              key={i} 
              onClick={() => {
                setQuery(s); 
                setShowDropdown(false); 
                router.push(`/search?area=${encodeURIComponent(s)}`);
              }} 
              className="px-6 py-4 hover:bg-slate-50 text-slate-800 cursor-pointer font-bold border-b border-slate-50 last:border-none flex justify-between items-center group"
            >
              <span>{s}</span>
              <span className="text-[10px] text-slate-300 group-hover:text-orange-500 transition-colors uppercase tracking-widest">View Area</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main Home Page
 */
export default function Home() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [leadData, setLeadData] = useState({ name: "", phone: "", type: "buying" });
  const [eduLeadData, setEduLeadData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      if (!error && data) setProperties(data);
    };
    fetchProperties();
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
    const data = type === 'estate' ? leadData : eduLeadData;
    
    if (!data.name || !data.phone) return alert("Required: Name and phone number.");
    
    setIsSubmitting(true);
    
    const payload = type === 'estate' 
      ? { full_name: data.name, phone: data.phone, property_area: `RE: ${leadData.type.toUpperCase()}` }
      : { full_name: data.name, phone: data.phone, property_area: "Education Inquiry" };

    const { error } = await supabase.from('leads').insert([payload]);
    
    setIsSubmitting(false);
    if (!error) {
      alert("Request received. A consultant will contact you shortly.");
      type === 'estate' 
        ? setLeadData({ name: "", phone: "", type: "buying" }) 
        : setEduLeadData({ name: "", phone: "" });
    } else {
      alert("Submission error. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFBF9] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* 1. NAVIGATION */}
      <nav className="fixed top-0 w-full z-[500] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 overflow-hidden rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
              <img 
                src="https://sid6969dd.github.io/radhey-estates/real-estate-engine/public/logo.png" 
                alt="MS Logo" 
                className="w-full h-full object-contain p-1.5"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-light uppercase tracking-[0.4em] text-slate-900 leading-none">
                MS<span className="font-black">ESTATES</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-px w-4 bg-orange-600"></div>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Education Advisory</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-10 items-center font-black text-[10px] uppercase tracking-[0.3em]">
            <a href="#properties" className="hover:text-orange-600 transition-colors">Portfolio</a>
            <a href="#contact" className="hover:text-orange-600 transition-colors">Consult</a>
            <button 
              onClick={() => router.push('/education')} 
              className="bg-slate-900 text-white px-7 py-3 rounded-full hover:bg-orange-600 transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              Admissions 2026
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative h-screen flex flex-col md:flex-row overflow-hidden bg-slate-900">
        {/* Real Estate Side */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-70" 
            alt="Premium Real Estate" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
          <div className="relative h-full flex flex-col justify-end p-10 md:p-24 z-20">
            <span className="text-orange-500 font-black text-[11px] tracking-[0.5em] uppercase mb-4 block">Real Estate Division</span>
            <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.85] mb-10 uppercase tracking-tighter">
              Premium <br /><span className="font-light italic text-slate-300 lowercase">Properties.</span>
            </h2>
            <SearchContent properties={properties} />
          </div>
        </div>

        {/* Education Side */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1523050335102-c6744729ea24?q=80&w=2070" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-70" 
            alt="Global Education" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
          <div className="relative h-full flex flex-col justify-end p-10 md:p-24 z-20">
            <div className="flex gap-6 mb-10 items-center border-l-2 border-orange-600/50 pl-8">
              <Flag code="gb" name="UK" />
              <Flag code="us" name="USA" />
              <Flag code="ca" name="Canada" />
              <Flag code="au" name="Australia" />
              <Flag code="de" name="Germany" />
            </div>
            <span className="text-orange-500 font-black text-[11px] tracking-[0.5em] uppercase mb-4 block">Scholastic Division</span>
            <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.85] mb-10 uppercase tracking-tighter">
              Global <br /><span className="font-light italic text-slate-300 lowercase">Admissions.</span>
            </h2>
            <button 
              onClick={() => router.push('/education')}
              className="w-fit bg-white text-slate-900 px-14 py-5 rounded-full font-black text-[11px] tracking-[0.3em] uppercase hover:bg-orange-600 hover:text-white transition-all shadow-2xl hover:-translate-y-1"
            >
              Start Your Journey
            </button>
          </div>
        </div>
      </section>

      {/* 3. PROPERTY SECTION */}
      <section id="properties" className="py-40 px-6 bg-white">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
            <div className="max-w-xl">
              <span className="text-orange-600 font-black text-[11px] tracking-[0.5em] uppercase mb-6 block">Curated Portfolio</span>
              <h3 className="text-6xl md:text-7xl font-black uppercase text-slate-900 leading-[0.9] tracking-tighter">Featured <br />Holdings</h3>
            </div>
            <p className="max-w-sm text-slate-400 text-sm font-medium leading-relaxed border-l-2 border-orange-600 pl-8 py-2 italic">
              A private collection of North India's most significant real estate assets, hand-picked for high-yield potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {properties.map((item) => (
              <div key={item.id} className="group cursor-pointer" onClick={() => router.push(`/property/${item.id}`)}>
                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-10 shadow-2xl relative bg-slate-100">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt={item.area} 
                  />
                  <div className="absolute top-8 right-8 bg-white/95 backdrop-blur px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl border border-slate-100">
                    {item.tag || 'Exclusive'}
                  </div>
                </div>
                <h4 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">{item.area}</h4>
                <p className="text-2xl font-light text-orange-600 italic tracking-tight">{item.price ? `₹ ${item.price}` : 'Price on Request'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CONTACT SECTION */}
      <section id="contact" className="py-40 px-4 bg-slate-50">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-center mb-24">
            <span className="text-[11px] font-black tracking-[0.8em] uppercase text-orange-600 mb-6 block">Concierge</span>
            <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter text-slate-900">Get In Touch.</h2>
            <div className="h-1.5 w-24 bg-orange-600/20 mx-auto mt-8 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Real Estate Form */}
            <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full opacity-50"></div>
              <div className="flex flex-col md:flex-row justify-between items-start mb-14 gap-8">
                <div>
                  <h4 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-3">Real Estate</h4>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Asset Management & Sales</p>
                </div>
                <div className="flex bg-slate-50 p-1.5 rounded-full border border-slate-100 shadow-inner">
                   <button 
                    onClick={() => setLeadData({...leadData, type: 'buying'})}
                    className={`px-6 py-3 rounded-full text-[10px] font-black uppercase transition-all ${leadData.type === 'buying' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}
                   >
                     Buy
                   </button>
                   <button 
                    onClick={() => setLeadData({...leadData, type: 'listing'})}
                    className={`px-6 py-3 rounded-full text-[10px] font-black uppercase transition-all ${leadData.type === 'listing' ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}
                   >
                     List
                   </button>
                </div>
              </div>

              <form onSubmit={(e) => handleLeadSubmit(e, 'estate')} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Legal Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={leadData.name}
                    onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                    className="w-full bg-slate-50 px-8 py-6 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600/20 font-bold transition-all border border-slate-100" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Primary Contact</label>
                  <input 
                    type="tel" 
                    placeholder="+91 00000 00000" 
                    value={leadData.phone}
                    onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                    className="w-full bg-slate-50 px-8 py-6 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600/20 font-bold transition-all border border-slate-100" 
                  />
                </div>
                <button 
                  disabled={isSubmitting}
                  className="w-full py-6 bg-slate-900 text-white rounded-full font-black text-[11px] tracking-[0.5em] uppercase hover:bg-orange-600 transition-all shadow-2xl mt-6 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : leadData.type === 'listing' ? "Request Listing Consultation" : "Submit Portfolio Inquiry"}
                </button>
              </form>
            </div>

            {/* Education Form */}
            <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
              <div className="mb-14">
                <h4 className="text-4xl font-black uppercase tracking-tighter text-white mb-3">Education</h4>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Global Academic Placement</p>
              </div>
              <form onSubmit={(e) => handleLeadSubmit(e, 'edu')} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Student Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter student name" 
                    value={eduLeadData.name}
                    onChange={(e) => setEduLeadData({...eduLeadData, name: e.target.value})}
                    className="w-full bg-white/5 px-8 py-6 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600/50 font-bold transition-all border border-white/10 text-white placeholder:text-slate-600" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Parent/Student Contact</label>
                  <input 
                    type="tel" 
                    placeholder="+91 00000 00000" 
                    value={eduLeadData.phone}
                    onChange={(e) => setEduLeadData({...eduLeadData, phone: e.target.value})}
                    className="w-full bg-white/5 px-8 py-6 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600/50 font-bold transition-all border border-white/10 text-white placeholder:text-slate-600" 
                  />
                </div>
                <button 
                  disabled={isSubmitting}
                  className="w-full py-6 bg-orange-600 text-white rounded-full font-black text-[11px] tracking-[0.5em] uppercase hover:bg-white hover:text-slate-900 transition-all shadow-2xl mt-6 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Request Academic Briefing"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-32 bg-white px-8 border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-24">
            <div className="max-w-xs">
              <h1 className="text-3xl font-light uppercase tracking-[0.4em] text-slate-900 leading-none mb-6">
                MS<span className="font-black">ESTATES</span>
              </h1>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                India's bespoke advisory for premium real estate investments and global academic transitions. Beyond standard excellence.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
              <div className="space-y-6">
                <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Divisions</h5>
                <div className="flex flex-col gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="hover:text-orange-600 cursor-pointer transition-colors">Residential</span>
                  <span className="hover:text-orange-600 cursor-pointer transition-colors">Commercial</span>
                  <span className="hover:text-orange-600 cursor-pointer transition-colors">Education</span>
                </div>
              </div>
              <div className="space-y-6">
                <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Network</h5>
                <div className="flex flex-col gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="hover:text-orange-600 cursor-pointer transition-colors">LinkedIn</span>
                  <span className="hover:text-orange-600 cursor-pointer transition-colors">Instagram</span>
                </div>
              </div>
              <div className="space-y-6">
                <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Privacy</h5>
                <div className="flex flex-col gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="hover:text-orange-600 cursor-pointer transition-colors">Legal Terms</span>
                  <span className="hover:text-orange-600 cursor-pointer transition-colors">Policy</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-16 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.8em]">© 2026 MSestates. Beyond Excellence.</p>
            <div className="flex gap-10 items-center opacity-30 grayscale">
               {/* Place for trust badges/logos */}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
