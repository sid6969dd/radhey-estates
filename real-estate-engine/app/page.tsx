"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Flag = ({ code, name }: { code: string; name: string }) => (
  <div className="flex flex-col items-center gap-2 group cursor-default">
    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl transition-all duration-500 group-hover:rounded-full group-hover:border-amber-500 group-hover:scale-110">
      <img 
        src={`https://flagcdn.com/w160/${code}.png`} 
        alt={name} 
        className="w-full h-full object-cover"
      />
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-amber-500 transition-colors">
      {name}
    </span>
  </div>
);

// BUG FIX #4: Removed unused `properties` prop from SearchContent
function SearchContent() {
  const router = useRouter();
  const [query, setQuery] = useState(""); 
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="relative w-full max-w-xl z-[100]" ref={dropdownRef}>
      <div className="bg-white p-2 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.2)] flex items-center transition-all focus-within:ring-4 focus-within:ring-amber-500/20">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setShowDropdown(true)}
          placeholder="Search areas (e.g. Golf Course Road)..." 
          className="flex-grow bg-transparent px-6 py-4 text-slate-900 placeholder:text-slate-400 font-bold outline-none text-lg" 
        />
        <button 
          onClick={() => query.trim() && router.push(`/search?area=${encodeURIComponent(query)}`)}
          className="bg-amber-600 text-white px-10 py-4 rounded-xl font-black text-xs tracking-widest transition-all hover:bg-slate-900 uppercase shadow-lg active:scale-95"
        >
          Explore
        </button>
      </div>
      
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute w-full mt-4 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
          {/* BUG FIX #3: Use suggestion value as key instead of array index */}
          {suggestions.map((s) => (
            <div 
              key={s}
              onClick={() => {
                setQuery(s); 
                setShowDropdown(false); 
                router.push(`/search?area=${encodeURIComponent(s)}`);
              }} 
              className="px-8 py-5 hover:bg-amber-50 text-slate-800 cursor-pointer font-bold border-b border-slate-50 last:border-none flex justify-between items-center group"
            >
              <span className="text-lg">{s}</span>
              <span className="text-[10px] text-amber-600 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">View Listings</span>
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
  const [leadData, setLeadData] = useState({ name: "", phone: "", type: "buying" });
  const [eduLeadData, setEduLeadData] = useState({ name: "", phone: "" });

  // BUG FIX #2: Split isSubmitting into two separate states so forms don't block each other
  const [isSubmittingEstate, setIsSubmittingEstate] = useState(false);
  const [isSubmittingEdu, setIsSubmittingEdu] = useState(false);

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
    
    // BUG FIX #2: Use the correct submitting flag per form
    if (type === 'estate') setIsSubmittingEstate(true);
    else setIsSubmittingEdu(true);
    
    const payload = type === 'estate' 
      ? { full_name: data.name, phone: data.phone, property_area: `RE: ${leadData.type.toUpperCase()}` }
      : { full_name: data.name, phone: data.phone, property_area: "Education Inquiry" };

    const { error } = await supabase.from('leads').insert([payload]);
    
    if (type === 'estate') setIsSubmittingEstate(false);
    else setIsSubmittingEdu(false);

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
    <main className="min-h-screen bg-neutral-50 text-slate-900 font-sans selection:bg-amber-100">
      
      {/* 1. NAVIGATION */}
     <nav className="fixed top-0 w-full z-[500] bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 overflow-hidden rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
              <img 
                src="/logo.png" 
                alt="MS Logo" 
                className="w-full h-full object-contain p-1"
                onError={(e) => { e.currentTarget.src = "https://sid6969dd.github.io/radhey-estates/real-estate-engine/public/logo.png"; }}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-light uppercase tracking-[0.3em] text-slate-900 leading-none">
                MS<span className="font-black">ESTATES</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-px w-4 bg-orange-600"></div>
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-400">Education Advisory</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex gap-10 items-center font-bold text-[10px] uppercase tracking-[0.2em]">
            <a href="#properties" className="hover:text-orange-600 transition-colors">Properties</a>
            <a href="#contact" className="hover:text-orange-600 transition-colors">Contact</a>
            <button onClick={() => router.push('/education')} className="bg-slate-900 text-white px-7 py-3 rounded-full hover:bg-orange-600 transition-all shadow-lg">
              Admissions 2026
            </button>
          </div>
        </div>
      </nav>
    

      {/* 2. HERO SECTION */}
      <section className="relative h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Real Estate Side */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group overflow-hidden border-r border-white/10">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-125" 
            alt="Corporate Real Estate" 
          />
          <div className="absolute inset-0 bg-slate-950/60 group-hover:bg-slate-950/40 transition-colors duration-700"></div>
          <div className="relative h-full flex flex-col justify-end p-12 md:p-24 z-20">
            <h2 className="text-6xl md:text-9xl font-black text-white leading-[0.8] mb-8 uppercase tracking-tighter">
              Prime <br /><span className="text-amber-500 italic">Assets.</span>
            </h2>
            {/* BUG FIX #4: No longer passing unused `properties` prop */}
            <SearchContent />
          </div>
        </div>

        {/* Education Side */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group overflow-hidden">
          {/* BUG FIX #1: Replaced broken/expired Unsplash URL with a stable one */}
          <img 
            src="https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=2074" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-125" 
            alt="University Campus" 
          />
          <div className="absolute inset-0 bg-amber-950/60 group-hover:bg-amber-950/40 transition-colors duration-700"></div>
          <div className="relative h-full flex flex-col justify-end p-12 md:p-24 z-20">
            <div className="flex gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
              <Flag code="gb" name="UK" />
              <Flag code="us" name="USA" />
              <Flag code="ca" name="Canada" />
              <Flag code="au" name="Australia" />
            </div>
            <h2 className="text-6xl md:text-9xl font-black text-white leading-[0.8] mb-8 uppercase tracking-tighter">
              Global <br /><span className="text-amber-500 italic">Admissions.</span>
            </h2>
            <button 
              onClick={() => router.push('/education')}
              className="w-fit bg-white text-slate-900 px-16 py-6 rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-amber-500 hover:text-white transition-all shadow-2xl"
            >
              Start Admission
            </button>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES */}
      <section id="properties" className="py-40 px-8 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-32">
            <span className="text-amber-600 font-black text-xs tracking-[1em] uppercase mb-6 block">The Collection</span>
            <h3 className="text-7xl md:text-9xl font-black uppercase text-slate-900 leading-none tracking-tighter">Iconic <br />Holdings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {properties.map((item) => (
              <div key={item.id} className="group cursor-pointer" onClick={() => router.push(`/property/${item.id}`)}>
                <div className="aspect-[3/4] rounded-[3rem] overflow-hidden mb-8 shadow-2xl relative">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt={item.area} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest">
                      View Details
                    </button>
                  </div>
                </div>
                <h4 className="text-3xl font-black uppercase text-slate-900 mb-2">{item.area}</h4>
                <p className="text-xl font-medium text-amber-600 italic">₹ {item.price || 'Price on Request'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CONTACT SECTION */}
      <section id="contact" className="py-40 px-4 bg-slate-50">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-center mb-24">
            <span className="text-[11px] font-black tracking-[0.8em] uppercase text-amber-600 mb-6 block">Concierge</span>
            <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter text-slate-900">Get In Touch.</h2>
            <div className="h-1.5 w-24 bg-amber-600/20 mx-auto mt-8 rounded-full"></div>
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
                    className={`px-6 py-3 rounded-full text-[10px] font-black uppercase transition-all ${leadData.type === 'listing' ? 'bg-amber-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}
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
                    className="w-full bg-slate-50 px-8 py-6 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600/20 font-bold transition-all border border-slate-100" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Primary Contact</label>
                  <input 
                    type="tel" 
                    placeholder="+91 00000 00000" 
                    value={leadData.phone}
                    onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                    className="w-full bg-slate-50 px-8 py-6 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600/20 font-bold transition-all border border-slate-100" 
                  />
                </div>
                {/* BUG FIX #2: Uses isSubmittingEstate, not the shared isSubmitting */}
                <button 
                  disabled={isSubmittingEstate}
                  className="w-full py-6 bg-slate-900 text-white rounded-full font-black text-[11px] tracking-[0.5em] uppercase hover:bg-amber-600 transition-all shadow-2xl mt-6 active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingEstate ? "Processing..." : leadData.type === 'listing' ? "Request Listing Consultation" : "Submit Portfolio Inquiry"}
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
                    className="w-full bg-white/5 px-8 py-6 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600/50 font-bold transition-all border border-white/10 text-white placeholder:text-slate-600" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Parent/Student Contact</label>
                  <input 
                    type="tel" 
                    placeholder="+91 00000 00000" 
                    value={eduLeadData.phone}
                    onChange={(e) => setEduLeadData({...eduLeadData, phone: e.target.value})}
                    className="w-full bg-white/5 px-8 py-6 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600/50 font-bold transition-all border border-white/10 text-white placeholder:text-slate-600" 
                  />
                </div>
                {/* BUG FIX #2: Uses isSubmittingEdu, not the shared isSubmitting */}
                <button 
                  disabled={isSubmittingEdu}
                  className="w-full py-6 bg-amber-600 text-white rounded-full font-black text-[11px] tracking-[0.5em] uppercase hover:bg-white hover:text-slate-900 transition-all shadow-2xl mt-6 active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingEdu ? "Processing..." : "Request Academic Briefing"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-slate-950 py-32 px-8 text-white border-t border-white/5">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">MS<span className="text-amber-500 italic">ESTATES</span></h1>
            <p className="text-slate-500 text-sm max-w-md leading-relaxed font-medium">
              Elevating real estate standards across the NCR and paving pathways to global academic excellence.
            </p>
          </div>
          <div className="space-y-8">
            <h5 className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em]">Divisions</h5>
            <ul className="space-y-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              <li className="hover:text-white cursor-pointer transition-colors">Residential Luxury</li>
              <li className="hover:text-white cursor-pointer transition-colors">Commercial Real Estate</li>
              <li className="hover:text-white cursor-pointer transition-colors">Higher Education Advisory</li>
            </ul>
          </div>
          <div className="space-y-8">
            <h5 className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em]">Contact</h5>
            <ul className="space-y-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              <li className="hover:text-white cursor-pointer transition-colors">Gurgaon Office</li>
              <li className="hover:text-white cursor-pointer transition-colors">+91 000 000 0000</li>
              <li className="hover:text-white cursor-pointer transition-colors">hello@msestates.com</li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}
