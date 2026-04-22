"use client";

import React, { useState, useEffect, useRef } from 'react';
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
    if (!data.name || !data.phone) return alert("Please enter your name and phone number.");
    setIsSubmitting(true);
    const { error } = await supabase.from('leads').insert([{ 
      full_name: data.name, 
      phone: data.phone, 
      property_area: type === 'estate' ? "Real Estate Inquiry" : "Education Inquiry" 
    }]);
    setIsSubmitting(false);
    if (!error) {
      alert("Thank you. We will contact you shortly.");
      type === 'estate' ? setLeadData({ name: "", phone: "" }) : setEduLeadData({ name: "", phone: "" });
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFBF9] text-slate-900 font-sans">
      
      {/* 1. NAVIGATION */}
      <nav className="fixed top-0 w-full z-[500] bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* LOGO CONTAINER */}
            <div className="w-10 h-10 overflow-hidden rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
              <img 
                src="/logo.png" 
                alt="MS Logo" 
                className="w-full h-full object-contain p-1"
                onError={(e) => { e.currentTarget.src = "https://sid6969dd.github.io/radhey-estates/real-estate-engine/public/logo.png"; }}
              />
            </div>
            <h1 className="text-lg font-black uppercase tracking-widest text-slate-900">
              MSestates <span className="text-orange-600">&</span> Education
            </h1>
          </div>
          <div className="hidden md:flex gap-8 items-center font-bold text-[10px] uppercase tracking-widest">
            <a href="#properties" className="hover:text-orange-600 transition-colors">Properties</a>
            <a href="#contact" className="hover:text-orange-600 transition-colors">Contact Us</a>
            <button onClick={() => router.push('/education')} className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-orange-600 transition-all">
              Apply Now
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
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Real Estate" 
          />
          <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/30 transition-colors"></div>
          <div className="relative h-full flex flex-col justify-end p-10 md:p-20 z-20">
            <span className="text-orange-400 font-bold text-[10px] tracking-[0.3em] uppercase mb-2">Real Estate Services</span>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-tight mb-8">
              Find Your <br />Dream Home.
            </h2>
            <SearchContent properties={properties} />
          </div>
        </div>

        {/* Education Side */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1523050335102-c6744729ea24?q=80&w=2070" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt="Education" 
          />
          <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/30 transition-colors"></div>
          <div className="relative h-full flex flex-col justify-end p-10 md:p-20 z-20">
            <span className="text-orange-400 font-bold text-[10px] tracking-[0.3em] uppercase mb-2">Foreign Education</span>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-tight mb-8">
              Study at Top <br />Universities.
            </h2>
            <button 
              onClick={() => router.push('/education')}
              className="w-fit bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-[11px] tracking-widest uppercase hover:bg-orange-600 hover:text-white transition-all shadow-xl"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* 3. PROPERTY SECTION */}
      <section id="properties" className="py-24 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16">
            <h3 className="text-4xl md:text-5xl font-black uppercase text-slate-900 mb-4">Top Properties</h3>
            <p className="text-slate-500 font-medium">Best residential and commercial options in Gurgaon & NCR.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {properties.map((item) => (
              <div key={item.id} className="group cursor-pointer" onClick={() => router.push(`/property/${item.id}`)}>
                <div className="aspect-square rounded-3xl overflow-hidden mb-6 shadow-md relative">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={item.area} 
                  />
                  <div className="absolute bottom-4 left-4 bg-white/90 px-4 py-1 rounded-full text-[10px] font-bold uppercase text-slate-900">
                    {item.tag || 'New'}
                  </div>
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-1">{item.area}</h4>
                <p className="text-orange-600 font-bold">{item.price ? `₹ ${item.price}` : 'Contact for Price'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CONTACT SECTION */}
      <section id="contact" className="py-24 px-4 bg-slate-50">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black uppercase text-slate-900">Get In Touch</h2>
            <p className="text-slate-500 mt-2">Leave your details and we will call you back.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Property Form */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
              <h4 className="text-2xl font-black text-slate-900 mb-6">Property Inquiry</h4>
              <form onSubmit={(e) => handleLeadSubmit(e, 'estate')} className="space-y-5">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={leadData.name}
                  onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                  className="w-full bg-slate-50 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-orange-600/20 font-semibold" 
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  value={leadData.phone}
                  onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                  className="w-full bg-slate-50 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-orange-600/20 font-semibold" 
                />
                <button 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-900 text-white rounded-full font-bold text-[11px] tracking-widest uppercase hover:bg-orange-600 transition-all"
                >
                  {isSubmitting ? "Sending..." : "Submit Inquiry"}
                </button>
              </form>
            </div>

            {/* Education Form */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
              <h4 className="text-2xl font-black text-slate-900 mb-6">Education Inquiry</h4>
              <form onSubmit={(e) => handleLeadSubmit(e, 'edu')} className="space-y-5">
                <input 
                  type="text" 
                  placeholder="Student Name" 
                  value={eduLeadData.name}
                  onChange={(e) => setEduLeadData({...eduLeadData, name: e.target.value})}
                  className="w-full bg-slate-50 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-orange-600/20 font-semibold" 
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  value={eduLeadData.phone}
                  onChange={(e) => setEduLeadData({...eduLeadData, phone: e.target.value})}
                  className="w-full bg-slate-50 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-orange-600/20 font-semibold" 
                />
                <button 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-orange-600 text-white rounded-full font-bold text-[11px] tracking-widest uppercase hover:bg-slate-900 transition-all"
                >
                  {isSubmitting ? "Sending..." : "Request Call"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-12 bg-white px-8 border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto flex flex-col md:row justify-between items-center gap-6">
          <h1 className="text-lg font-black uppercase tracking-widest">
            MSestates <span className="text-orange-600">&</span> Education
          </h1>
          <div className="flex gap-6 text-[10px] font-bold uppercase text-slate-400">
            <span className="hover:text-slate-900 cursor-pointer">LinkedIn</span>
            <span className="hover:text-slate-900 cursor-pointer">Instagram</span>
            <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
          </div>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">© 2026 MSestates. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}
