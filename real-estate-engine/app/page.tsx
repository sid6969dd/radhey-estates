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
    <div className="relative w-full max-w-xl mx-auto z-[210]" ref={dropdownRef}>
      <div className="bg-white/5 backdrop-blur-2xl p-1.5 rounded-full border border-white/10 shadow-2xl">
        <div className="flex items-center">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 1 && setShowDropdown(true)}
            placeholder="Search Estates..." 
            className="w-full bg-transparent px-6 py-3 text-white placeholder:text-slate-400 font-medium outline-none text-sm" 
          />
          <button 
            onClick={() => query.trim() && router.push(`/search?area=${encodeURIComponent(query)}`)}
            className="bg-white text-black px-6 py-3 rounded-full font-black text-[9px] tracking-[0.2em] transition-all hover:bg-orange-600 hover:text-white"
          >
            DISCOVER
          </button>
        </div>
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute w-full mt-4 bg-[#0f1115] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[300]">
          {suggestions.map((s, i) => (
            <div key={i} onClick={() => {setQuery(s); setShowDropdown(false); router.push(`/search?area=${encodeURIComponent(s)}`);}} className="px-6 py-4 hover:bg-white/5 text-white cursor-pointer font-bold border-b border-white/5 last:border-none transition-colors">
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase.from('properties').select('*');
      if (!error && data) setProperties(data);
    };
    fetchProperties();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-600/30">
      
      {/* 1. MINIMALIST NAV */}
      <nav className="fixed top-0 w-full z-[500] bg-black/40 backdrop-blur-lg border-b border-white/5 px-6 py-4">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-lg md:text-xl font-black uppercase tracking-[0.4em]">
              MS<span className="text-orange-600">estates</span>
            </h1>
            <div className="h-4 w-[1px] bg-white/20 hidden md:block"></div>
            <span className="text-[10px] font-bold tracking-[0.3em] text-slate-400 hidden md:block uppercase">Global Education</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#concierge" className="text-[10px] font-black tracking-[0.2em] uppercase hover:text-orange-600 transition-colors">The Concierge</a>
            <button onClick={() => router.push('/education')} className="bg-white text-black px-6 py-2.5 rounded-full font-black text-[9px] tracking-[0.2em] uppercase hover:invert transition-all">
              Apply Now
            </button>
          </div>
        </div>
      </nav>

      {/* 2. DUAL SPLIT HERO */}
      <section className="relative h-screen flex flex-col md:flex-row overflow-hidden border-b border-white/5">
        {/* Left Side: Real Estate */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group cursor-pointer overflow-hidden border-r border-white/5">
          <img src="https://images.unsplash.com/photo-1600585154340-be6191bcbe10?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110 opacity-60" alt="Estates" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div className="relative h-full flex flex-col justify-end p-12 md:p-20 z-20">
            <span className="text-orange-600 font-black text-[10px] tracking-[0.5em] uppercase mb-4">Elite Properties</span>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none mb-6">Ultra<br/>Estates</h2>
            <SearchContent properties={properties} />
          </div>
        </div>

        {/* Right Side: Education */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group cursor-pointer overflow-hidden" onClick={() => router.push('/education')}>
          <img src="https://images.unsplash.com/photo-1525921429624-479b6a26d84d?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110 opacity-50" alt="Education" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div className="relative h-full flex flex-col justify-end p-12 md:p-20 z-20">
            <span className="text-orange-600 font-black text-[10px] tracking-[0.5em] uppercase mb-4">Scholastic Excellence</span>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none mb-6">Global<br/>Learning</h2>
            <p className="text-slate-300 text-sm tracking-widest font-medium uppercase italic">United Kingdom • Australia • Canada</p>
          </div>
        </div>
      </section>

      {/* 3. ASSET PORTFOLIO (LISTINGS) */}
      <section className="py-32 px-6 bg-[#0a0a0a]">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex justify-between items-end mb-20 border-b border-white/10 pb-12">
            <div>
              <h3 className="text-[10px] font-black tracking-[0.6em] text-orange-600 uppercase mb-4">Selected Inventory</h3>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Current Portfolio</h2>
            </div>
            <p className="text-slate-500 text-sm max-w-xs text-right italic font-medium hidden md:block">
              Curated assets from the most desirable sectors of NCR and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {properties.map((item) => (
              <div key={item.id} className="group relative" onClick={() => router.push(`/property/${item.id}`)}>
                <div className="aspect-[4/5] overflow-hidden rounded-sm mb-8 bg-slate-900 border border-white/5">
                  <img src={item.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070'} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[2s] group-hover:scale-110" 
                    alt={item.area} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="flex justify-between items-start border-b border-white/10 pb-6">
                  <div>
                    <h4 className="text-2xl font-black uppercase tracking-tight mb-1">{item.area}</h4>
                    <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">{item.tag || 'Exclusive'}</p>
                  </div>
                  <div className="text-lg font-black text-orange-600 tracking-tighter">
                    {item.price ? `₹ ${item.price}` : 'POA'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE CONCIERGE (DUAL FORMS) */}
      <section id="concierge" className="py-32 px-6 bg-[#0f1115] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-6">The Concierge</h2>
            <p className="text-slate-400 tracking-[0.4em] uppercase text-[10px] font-black">Besoke Services for Property & Education</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-[3rem] overflow-hidden">
            {/* Form 1: Property */}
            <div className="bg-[#0f1115] p-12 md:p-20">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4 italic text-orange-600 underline underline-offset-8 decoration-1">Real Estate Intake</h3>
              <p className="text-slate-500 text-sm mb-12 font-medium tracking-wide">Register your high-value assets for our private network.</p>
              <form className="space-y-6">
                <input type="text" placeholder="Full Name" className="w-full bg-transparent border-b border-white/20 py-4 outline-none focus:border-orange-600 transition-colors font-bold text-sm uppercase tracking-widest" />
                <input type="tel" placeholder="Private Line" className="w-full bg-transparent border-b border-white/20 py-4 outline-none focus:border-orange-600 transition-colors font-bold text-sm uppercase tracking-widest" />
                <button className="w-full mt-12 py-5 bg-white text-black font-black text-[10px] tracking-[0.3em] uppercase hover:bg-orange-600 hover:text-white transition-all">Submit Asset</button>
              </form>
            </div>

            {/* Form 2: Education */}
            <div className="bg-[#0f1115] p-12 md:p-20">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4 italic text-orange-600 underline underline-offset-8 decoration-1">Academic Intake</h3>
              <p className="text-slate-500 text-sm mb-12 font-medium tracking-wide">Initiate your application for UK or Australian universities.</p>
              <form className="space-y-6">
                <input type="text" placeholder="Student Name" className="w-full bg-transparent border-b border-white/20 py-4 outline-none focus:border-orange-600 transition-colors font-bold text-sm uppercase tracking-widest" />
                <input type="tel" placeholder="Mobile Line" className="w-full bg-transparent border-b border-white/20 py-4 outline-none focus:border-orange-600 transition-colors font-bold text-sm uppercase tracking-widest" />
                <button className="w-full mt-12 py-5 bg-orange-600 text-white font-black text-[10px] tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all">Request Briefing</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-20 border-t border-white/5 px-6 bg-black">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <h2 className="text-2xl font-black uppercase tracking-[0.5em]">MSestates</h2>
          <div className="flex gap-12 text-[9px] font-bold tracking-[0.3em] text-slate-500 uppercase">
            <span className="cursor-pointer hover:text-white transition-colors">Instagram</span>
            <span className="cursor-pointer hover:text-white transition-colors">LinkedIn</span>
            <span className="cursor-pointer hover:text-white transition-colors">WhatsApp</span>
          </div>
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">© 2026 MSestates & Education. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}
