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
    <div className="relative w-full max-w-lg z-[210]" ref={dropdownRef}>
      <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-slate-200 shadow-2xl flex items-center">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setShowDropdown(true)}
          placeholder="Search exclusive areas..." 
          className="flex-grow bg-transparent px-6 py-3 text-slate-800 placeholder:text-slate-400 font-semibold outline-none text-sm" 
        />
        <button 
          onClick={() => query.trim() && router.push(`/search?area=${encodeURIComponent(query)}`)}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-black text-[10px] tracking-[0.2em] transition-all hover:bg-orange-600 uppercase shadow-lg"
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
      <nav className="fixed top-0 w-full z-[500] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* LOGO BOX - Ensures visibility */}
            <div className="w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain p-1"
                onError={(e) => { e.currentTarget.src = "https://sid6969dd.github.io/radhey-estates/real-estate-engine/public/logo.png"; }}
              />
            </div>
            <h1 className="text-lg md:text-xl font-black uppercase tracking-[0.25em] text-slate-900">
              MSestates <span className="text-orange-600 font-light">&</span> Education
            </h1>
          </div>
          <div className="hidden md:flex gap-10 items-center">
            <a href="#portfolio" className="text-[10px] font-black tracking-[0.2em] uppercase hover:text-orange-600 transition-colors">Portfolio</a>
            <a href="#concierge" className="text-[10px] font-black tracking-[0.2em] uppercase hover:text-orange-600 transition-colors">Concierge</a>
            <button onClick={() => router.push('/education')} className="bg-slate-900 text-white px-8 py-3 rounded-full font-black text-[9px] tracking-[0.2em] uppercase hover:bg-orange-600 shadow-lg transition-all">
              Apply 2026
            </button>
          </div>
        </div>
      </nav>

      {/* 2. SPLIT HERO SECTION */}
      <section className="relative h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Estates Half */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group overflow-hidden border-r border-slate-50">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-110" 
            alt="Real Estate" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
          <div className="relative h-full flex flex-col justify-end p-10 md:p-20 z-20">
            <span className="text-white/80 font-black text-[10px] tracking-[0.5em] uppercase mb-4">The Real Estate Division</span>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-10 text-white drop-shadow-2xl">
              Luxury <br /><span className="italic font-light text-slate-200">Holdings.</span>
            </h2>
            <SearchContent properties={properties} />
          </div>
        </div>

        {/* Education Half */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1523050335102-c6744729ea24?q=80&w=2070" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-110" 
            alt="Education" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
          <div className="relative h-full flex flex-col justify-end p-10 md:p-20 z-20">
            <span className="text-white/80 font-black text-[10px] tracking-[0.5em] uppercase mb-4">The Scholastic Division</span>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-10 text-white drop-shadow-2xl">
              Global <br /><span className="italic font-light text-slate-200">Academia.</span>
            </h2>
            <button 
              onClick={() => router.push('/education')}
              className="w-fit bg-white text-slate-900 px-12 py-5 rounded-full font-black text-[10px] tracking-[0.3em] uppercase hover:bg-orange-600 hover:text-white transition-all shadow-2xl"
            >
              Explore Universities
            </button>
          </div>
        </div>
      </section>

      {/* 3. PROPERTY SHOWCASE */}
      <section id="portfolio" className="py-32 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <span className="text-orange-600 font-black text-[10px] tracking-[0.5em] uppercase mb-6 block">Featured Inventory</span>
              <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-slate-900">The <br />Portfolio.</h3>
            </div>
            <p className="text-slate-400 text-xl italic max-w-sm font-medium border-l-2 border-orange-600 pl-10 leading-relaxed">
              Discreet access to North India's most coveted commercial and residential landscapes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {properties.map((item) => (
              <div key={item.id} className="group cursor-pointer" onClick={() => router.push(`/property/${item.id}`)}>
                <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-10 shadow-2xl group-hover:shadow-orange-200/50 transition-all duration-700 relative">
                   {/* Full Color Image */}
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070'} 
                    className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" 
                    alt={item.area} 
                  />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase text-slate-900 shadow-sm">
                    {item.tag || 'Exclusive'}
                  </div>
                </div>
                <div className="px-4">
                  <h4 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-2">{item.area}</h4>
                  <p className="text-2xl font-light text-orange-600 italic tracking-tight">{item.price ? `₹ ${item.price}` : 'P.O.A.'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DUAL CONCIERGE FORMS */}
      <section id="concierge" className="py-32 px-4 bg-[#F9F8F6]">
        <div className="max-w-[1300px] mx-auto">
          <div className="text-center mb-24">
            <span className="text-[10px] font-black tracking-[0.8em] uppercase text-orange-600 mb-4 block">Personalized Service</span>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 mb-6">Concierge.</h2>
            <div className="h-0.5 w-32 bg-slate-200 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Real Estate Form */}
            <div className="bg-white rounded-[3.5rem] p-12 md:p-20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="mb-14">
                <h4 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-3">Asset Registration</h4>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Confidential Property Inquiry</p>
              </div>
              <form onSubmit={(e) => handleLeadSubmit(e, 'estate')} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                   <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={leadData.name}
                    onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                    className="w-full bg-slate-50 border-none px-8 py-6 rounded-3xl outline-none focus:ring-2 focus:ring-orange-600/10 font-bold text-slate-900 transition-all shadow-inner" 
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Mobile Number</label>
                   <input 
                    type="tel" 
                    placeholder="+91 00000 00000" 
                    value={leadData.phone}
                    onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                    className="w-full bg-slate-50 border-none px-8 py-6 rounded-3xl outline-none focus:ring-2 focus:ring-orange-600/10 font-bold text-slate-900 transition-all shadow-inner" 
                  />
                </div>
                <button 
                  disabled={isSubmitting}
                  className="w-full py-6 bg-slate-900 text-white rounded-full font-black text-[10px] tracking-[0.4em] uppercase hover:bg-orange-600 transition-all shadow-xl mt-4"
                >
                  {isSubmitting ? "Processing..." : "Submit to Portfolio"}
                </button>
              </form>
            </div>

            {/* Education Form */}
            <div className="bg-white rounded-[3.5rem] p-12 md:p-20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="mb-14">
                <h4 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-3">Academic Inquiry</h4>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">International Admissions 2026</p>
              </div>
              <form onSubmit={(e) => handleLeadSubmit(e, 'edu')} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Student Name</label>
                   <input 
                    type="text" 
                    placeholder="Candidate Name" 
                    value={eduLeadData.name}
                    onChange={(e) => setEduLeadData({...eduLeadData, name: e.target.value})}
                    className="w-full bg-slate-50 border-none px-8 py-6 rounded-3xl outline-none focus:ring-2 focus:ring-orange-600/10 font-bold text-slate-900 transition-all shadow-inner" 
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Contact Detail</label>
                   <input 
                    type="tel" 
                    placeholder="+91 00000 00000" 
                    value={eduLeadData.phone}
                    onChange={(e) => setEduLeadData({...eduLeadData, phone: e.target.value})}
                    className="w-full bg-slate-50 border-none px-8 py-6 rounded-3xl outline-none focus:ring-2 focus:ring-orange-600/10 font-bold text-slate-900 transition-all shadow-inner" 
                  />
                </div>
                <button 
                  disabled={isSubmitting}
                  className="w-full py-6 bg-orange-600 text-white rounded-full font-black text-[10px] tracking-[0.4em] uppercase hover:bg-slate-900 transition-all shadow-xl mt-4"
                >
                  {isSubmitting ? "Processing..." : "Request Briefing"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LUXURY FOOTER */}
      <footer className="py-24 border-t border-slate-100 bg-white px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
            <div>
               <h1 className="text-2xl font-black uppercase tracking-[0.4em] text-slate-900 mb-4">
                MSestates <span className="text-orange-600 font-light">&</span> Education
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Est. 2026 • Premier Advisory</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
               <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.3em]">Social</h5>
                  <div className="flex flex-col gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="hover:text-orange-600 cursor-pointer">Instagram</span>
                    <span className="hover:text-orange-600 cursor-pointer">LinkedIn</span>
                  </div>
               </div>
               <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.3em]">Legal</h5>
                  <div className="flex flex-col gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="hover:text-orange-600 cursor-pointer">Privacy</span>
                    <span className="hover:text-orange-600 cursor-pointer">Terms</span>
                  </div>
               </div>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-50 flex justify-between items-center">
             <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.5em]">© 2026 MSestates. Beyond Excellence.</p>
             <div className="h-px w-24 bg-slate-100"></div>
          </div>
        </div>
      </footer>
    </main>
  );
}
