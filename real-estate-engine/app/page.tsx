"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper for Flag Icons (Using standard circular icon placeholders)
const Flag = ({ code, name }: { code: string; name: string }) => (
  <div className="flex flex-col items-center gap-2 group z-30">
    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 shadow-sm transition-transform group-hover:scale-110">
      <img 
        src={`https://flagcdn.com/w80/${code}.png`} 
        alt={name} 
        className="w-full h-full object-cover"
      />
    </div>
    <span className="text-[8px] font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">{name}</span>
  </div>
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
    <div className="relative w-full max-w-lg z-[210]" ref={dropdownRef}>
      <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-full border border-slate-200 shadow-xl flex items-center">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setShowDropdown(true)}
          placeholder="Search by area (e.g. Sector 74)..." 
          className="flex-grow bg-transparent px-6 py-3 text-slate-800 placeholder:text-slate-400 font-medium outline-none text-sm" 
        />
        <button 
          onClick={() => query.trim() && router.push(`/search?area=${encodeURIComponent(query)}`)}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold text-[11px] tracking-widest transition-all hover:bg-orange-600 uppercase shadow-md"
        >
          Search
        </button>
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[300]">
          {suggestions.map((s, i) => (
            <div key={i} onClick={() => {setQuery(s); setShowDropdown(false); router.push(`/search?area=${encodeURIComponent(s)}`);}} className="px-6 py-4 hover:bg-slate-50 text-slate-800 cursor-pointer font-semibold border-b border-slate-50 last:border-none">
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
  const [leadData, setLeadData] = useState({ name: "", phone: "", type: "buying" });
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
    if (!data.name || !data.phone) return alert("Please enter your name and phone number.");
    setIsSubmitting(true);
    
    const payload = type === 'estate' 
      ? { full_name: data.name, phone: data.phone, property_area: `RE: ${leadData.type.toUpperCase()}` }
      : { full_name: data.name, phone: data.phone, property_area: "Education Inquiry" };

    const { error } = await supabase.from('leads').insert([payload]);
    setIsSubmitting(false);
    if (!error) {
      alert("Thank you. Our consultant will contact you shortly.");
      type === 'estate' ? setLeadData({ name: "", phone: "", type: "buying" }) : setEduLeadData({ name: "", phone: "" });
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFBF9] text-slate-900 font-sansselection:bg-orange-100">
      
      {/* 1. NAVIGATION - CLASSY REFINED LOGO */}
      <nav className="fixed top-0 w-full z-[500] bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 overflow-hidden rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
              <img 
                src="https://sid6969dd.github.io/radhey-estates/real-estate-engine/public/logo.png" 
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
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110 z-0" 
            alt="Real Estate" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10"></div>
          <div className="relative h-full flex flex-col justify-end p-10 md:p-20 z-20">
            <span className="text-orange-400 font-bold text-[10px] tracking-[0.4em] uppercase mb-3">Real Estate Division</span>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] mb-8 uppercase tracking-tighter drop-shadow-lg">
              Premium <br /><span className="font-light italic text-slate-200">Properties.</span>
            </h2>
            <SearchContent properties={properties} />
          </div>
        </div>

        {/* Education Side */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756ebafe1?q=80&w=2070" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110 z-0" 
            alt="Education" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10"></div>
          <div className="relative h-full flex flex-col justify-end p-10 md:p-20 z-20">
            {/* DESTINATION FLAGS */}
            <div className="flex gap-6 mb-8 items-center border-l border-white/20 pl-6 z-30 relative">
              <Flag code="gb" name="UK" />
              <Flag code="us" name="USA" />
              <Flag code="ca" name="Canada" />
              <Flag code="au" name="Australia" />
              <Flag code="de" name="Germany" />
            </div>
            <span className="text-orange-400 font-bold text-[10px] tracking-[0.4em] uppercase mb-3">Foreign Education</span>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] mb-8 uppercase tracking-tighter drop-shadow-lg">
              Global <br /><span className="font-light italic text-slate-200">Admissions.</span>
            </h2>
            <button 
              onClick={() => router.push('/education')}
              className="w-fit bg-white text-slate-900 px-12 py-5 rounded-full font-bold text-[10px] tracking-[0.2em] uppercase hover:bg-orange-600 hover:text-white transition-all shadow-2xl z-30"
            >
              Start Your Journey
            </button>
          </div>
        </div>
      </section>

      {/* 3. PROPERTY SECTION */}
      <section id="properties" className="py-32 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
            <div className="max-w-xl">
              <span className="text-orange-600 font-bold text-[10px] tracking-[0.4em] uppercase mb-4 block">Our Portfolio</span>
              <h3 className="text-5xl font-black uppercase text-slate-900 leading-none">Featured <br />Holdings</h3>
            </div>
            <p className="text-slate-400 text-sm font-medium italic border-l-2 border-orange-600 pl-6 py-2">
              Curated selection of North India's most valuable real estate assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {properties.map((item) => (
              <div key={item.id} className="group cursor-pointer" onClick={() => router.push(`/property/${item.id}`)}>
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-8 shadow-xl relative">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={item.area} 
                  />
                  <div className="absolute top-6 right-6 bg-white/95 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-lg">
                    {item.tag || 'Exclusive'}
                  </div>
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-1">{item.area}</h4>
                <p className="text-xl font-light text-orange-600 italic">{item.price ? `₹ ${item.price}` : 'Price on Request'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CONTACT SECTION - LIST YOUR PROPERTIES ADDED */}
      <section id="contact" className="py-32 px-4 bg-slate-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <span className="text-[10px] font-black tracking-[0.6em] uppercase text-orange-600 mb-4 block">Consultation</span>
            <h2 className="text-5xl font-black uppercase tracking-tighter text-slate-900">Get In Touch.</h2>
            <div className="h-1 w-20 bg-slate-200 mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Real Estate Form */}
            <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-xl border border-slate-100">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h4 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">Real Estate</h4>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Property Registration & Sales</p>
                </div>
                {/* INQUIRY TYPE SELECTOR */}
                <div className="flex bg-slate-50 p-1 rounded-full border border-slate-100">
                   <button 
                    onClick={() => setLeadData({...leadData, type: 'buying'})}
                    className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase transition-all ${leadData.type === 'buying' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-900'}`}
                   >
                     I Want To Buy
                   </button>
                   <button 
                    onClick={() => setLeadData({...leadData, type: 'listing'})}
                    className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase transition-all ${leadData.type === 'listing' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-900'}`}
                   >
                     List My Property
                   </button>
                </div>
              </div>

              <form onSubmit={(e) => handleLeadSubmit(e, 'estate')} className="space-y-6">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={leadData.name}
                  onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                  className="w-full bg-slate-50 px-8 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600/10 font-bold transition-all border border-slate-100" 
                />
                <input 
                  type="tel" 
                  placeholder="Mobile Number" 
                  value={leadData.phone}
                  onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                  className="w-full bg-slate-50 px-8 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600/10 font-bold transition-all border border-slate-100" 
                />
                <button 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-[10px] tracking-[0.4em] uppercase hover:bg-orange-600 transition-all shadow-xl mt-4"
                >
                  {isSubmitting ? "Processing..." : leadData.type === 'listing' ? "Request Listing Consultation" : "Submit Inquiry"}
                </button>
              </form>
            </div>

            {/* Education Form */}
            <div className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-xl border border-slate-100">
              <div className="mb-10">
                <h4 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2">Education</h4>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">International Admissions Advisory</p>
              </div>
              <form onSubmit={(e) => handleLeadSubmit(e, 'edu')} className="space-y-6">
                <input 
                  type="text" 
                  placeholder="Student Name" 
                  value={eduLeadData.name}
                  onChange={(e) => setEduLeadData({...eduLeadData, name: e.target.value})}
                  className="w-full bg-slate-50 px-8 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600/10 font-bold transition-all border border-slate-100" 
                />
                <input 
                  type="tel" 
                  placeholder="Contact Number" 
                  value={eduLeadData.phone}
                  onChange={(e) => setEduLeadData({...eduLeadData, phone: e.target.value})}
                  className="w-full bg-slate-50 px-8 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600/10 font-bold transition-all border border-slate-100" 
                />
                <button 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-orange-600 text-white rounded-full font-black text-[10px] tracking-[0.4em] uppercase hover:bg-slate-900 transition-all shadow-xl mt-4"
                >
                  {isSubmitting ? "Processing..." : "Request Briefing"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-24 bg-white px-8 border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div>
              <h1 className="text-2xl font-light uppercase tracking-[0.4em] text-slate-900 leading-none">
                MS<span className="font-black">ESTATES</span>
              </h1>
              <p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest mt-4">Premier Real Estate & Education Advisory 2026</p>
            </div>
            <div className="flex gap-20">
              <div className="space-y-4">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Connect</h5>
                <div className="flex flex-col gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="hover:text-orange-600 cursor-pointer transition-colors">LinkedIn</span>
                  <span className="hover:text-orange-600 cursor-pointer transition-colors">Instagram</span>
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Legal</h5>
                <div className="flex flex-col gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="hover:text-orange-600 cursor-pointer transition-colors">Privacy</span>
                  <span className="hover:text-orange-600 cursor-pointer transition-colors">Terms</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-50 flex justify-between items-center">
            <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.5em]">© 2026 MSestates. Beyond Excellence.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
