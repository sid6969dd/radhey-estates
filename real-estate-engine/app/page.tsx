"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Refined Flag Component ---
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

function SearchContent({ properties }: { properties: any[] }) {
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
          {suggestions.map((s, i) => (
            <div 
              key={i} 
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

  return (
    <main className="min-h-screen bg-neutral-50 text-slate-900 font-sans selection:bg-amber-100">
      
      {/* 1. NAVIGATION */}
      <nav className="fixed top-0 w-full z-[500] bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 px-8 py-5">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 overflow-hidden rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl">
              {/* FALLBACK LOGO LOGIC */}
              <img 
                src="/logo.png" 
                onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/609/609803.png" }}
                alt="Logo" 
                className="w-full h-full object-contain p-2 invert"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                MS<span className="text-amber-600 italic">ESTATES</span>
              </h1>
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 mt-1">Global Advisory</span>
            </div>
          </div>
          <div className="hidden md:flex gap-12 items-center font-black text-[11px] uppercase tracking-[0.2em]">
            <a href="#properties" className="hover:text-amber-600 transition-colors">Portfolio</a>
            <a href="#contact" className="hover:text-amber-600 transition-colors">Contact</a>
            <button 
              onClick={() => router.push('/education')} 
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-amber-600 transition-all shadow-2xl hover:-translate-y-1"
            >
              Admissions 2026
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Real Estate Side - Gurgaon Vibes */}
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
            <SearchContent properties={properties} />
          </div>
        </div>

        {/* Education Side - Ivy League Vibes */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070" 
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
              World <br /><span className="text-amber-500 italic">Class.</span>
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

      {/* 4. FOOTER - DARK & CLEAN */}
      <footer className="bg-slate-900 py-40 px-8 text-white">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24">
          <div className="lg:col-span-2">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-10">MS<span className="text-amber-500 italic">ESTATES</span></h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Elevating real estate standards across the NCR and paving pathways to global academic excellence.
            </p>
          </div>
          <div className="space-y-8">
            <h5 className="text-amber-500 font-black text-xs uppercase tracking-widest">Divisions</h5>
            <ul className="space-y-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              <li className="hover:text-white cursor-pointer transition-colors">Residential Luxury</li>
              <li className="hover:text-white cursor-pointer transition-colors">Commercial Real Estate</li>
              <li className="hover:text-white cursor-pointer transition-colors">Higher Education Advisory</li>
            </ul>
          </div>
          <div className="space-y-8">
            <h5 className="text-amber-500 font-black text-xs uppercase tracking-widest">Contact</h5>
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
