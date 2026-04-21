"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PropertyDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [leadData, setLeadData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);

  useEffect(() => {
    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.push('/'); 
      } else {
        setProperty(data);
      }
      setLoading(false);
    };
    if (id) fetchProperty();
  }, [id, router]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData.name || !leadData.phone) return alert("Please fill all fields");
    setIsSubmitting(true);

    const { error } = await supabase
      .from('leads')
      .insert([{ 
        full_name: leadData.name, 
        phone: leadData.phone,
        property_area: property.area 
      }]);

    setIsSubmitting(false);
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Success! Our executive will call you shortly.");
      setLeadData({ name: "", phone: "" });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest bg-[#FDFCFB]">Loading Asset...</div>;

  const mediaItems = [...(property.images || [])];
  if (property.video_url) mediaItems.push({ url: property.video_url, type: 'video' });
  if (mediaItems.length === 0 && property.image_url) mediaItems.push({ url: property.image_url, type: 'image' });

  return (
    <main className="min-h-screen bg-[#FDFCFB] text-slate-900 pb-32 selection:bg-orange-100">
      {/* NAVIGATION */}
      <nav className="p-6 md:p-8 flex justify-between items-center border-b border-slate-100 bg-white sticky top-0 z-[100]">
        <button onClick={() => router.back()} className="text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:text-orange-500 transition-colors">
          ← Back
        </button>
        <div className="text-xl font-black tracking-tighter uppercase cursor-pointer" onClick={() => router.push('/')}>
            MS<span className="text-orange-500">Estate</span>
        </div>
      </nav>

      {/* MAIN CONTENT AREA: Column on mobile, Grid on Desktop */}
      <div className="max-w-7xl mx-auto mt-4 md:mt-10 px-4 md:px-6 flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* MEDIA BOX: Always first on mobile */}
        <div className="relative w-full order-1">
          <div className="overflow-hidden rounded-[2.5rem] md:rounded-[3rem] shadow-2xl bg-slate-100" ref={emblaRef}>
            <div className="flex">
              {mediaItems.map((item: any, index: number) => (
                <div className="flex-[0_0_100%] min-w-0 h-[350px] sm:h-[450px] md:h-[650px] relative" key={index}>
                  {item.type === 'video' || (typeof item === 'string' && item.endsWith('.mp4')) ? (
                    <video 
                      src={typeof item === 'string' ? item : item.url} 
                      autoPlay muted loop playsInline 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={typeof item === 'string' ? item : item.url} 
                      className="w-full h-full object-cover" 
                      alt="Property View"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">
            Divine Gallery • Auto-Scroll
          </div>
        </div>

        {/* PROPERTY INFO: Below media on mobile */}
        <div className="flex flex-col justify-center order-2 text-left px-2 md:px-0">
          <span className="text-orange-500 font-black tracking-[0.4em] uppercase text-[9px] mb-2 md:mb-4">
            {property.tag || "Premium Asset"}
          </span>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] mb-4 md:mb-6">
            {property.area}
          </h1>
          <p className="text-2xl md:text-3xl font-serif italic text-slate-400 mb-8 md:mb-10">
            {property.price || "Price on Request"}
          </p>

          <div className="space-y-6 md:space-y-8 mb-10 md:mb-12">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Description</h4>
              <p className="text-base md:text-lg leading-relaxed text-slate-600 font-medium">
                {property.description || "An exclusive residence in a prime location."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {property.features?.map((feature: string, i: number) => (
                <div key={i} className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-white border border-slate-50 rounded-2xl shadow-sm">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => document.getElementById('contact-asset')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full py-6 md:py-8 bg-slate-900 text-white rounded-[2rem] font-black text-xs tracking-[0.2em] uppercase hover:bg-orange-600 transition-all shadow-xl"
          >
            Acquire Private Details
          </button>
        </div>
      </div>

      {/* LEAD CAPTURE SECTION */}
      <section id="contact-asset" className="mt-20 md:mt-32 max-w-4xl mx-auto px-4 md:px-6">
        <div className="bg-white rounded-[3rem] md:rounded-[4rem] p-10 md:p-20 shadow-2xl border border-slate-50 relative overflow-hidden text-left">
          <div className="relative z-10">
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-slate-900 leading-none">
              Request a <br />Private Tour
            </h3>
            <p className="text-slate-400 font-medium mb-10 md:mb-12 italic text-base md:text-lg">
              Our executive for <span className="text-slate-900">{property.area}</span> will contact you shortly.
            </p>
            
            <form onSubmit={handleLeadSubmit} className="space-y-4 md:space-y-6">
              <input 
                type="text" 
                placeholder="Full Name" 
                value={leadData.name}
                onChange={(e) => setLeadData({...leadData, name: e.target.value})}
                className="w-full p-6 md:p-8 bg-slate-50 rounded-2xl md:rounded-3xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 transition-all border border-transparent focus:bg-white" 
                required
              />
              <input 
                type="tel" 
                placeholder="Mobile Number" 
                value={leadData.phone}
                onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                className="w-full p-6 md:p-8 bg-slate-50 rounded-2xl md:rounded-3xl outline-none font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 transition-all border border-transparent focus:bg-white" 
                required
              />
              <button 
                disabled={isSubmitting}
                className="w-full py-6 md:py-8 bg-slate-900 text-white rounded-2xl md:rounded-3xl font-black text-xs tracking-[0.3em] uppercase hover:bg-orange-600 transition-all shadow-2xl disabled:bg-slate-300"
              >
                {isSubmitting ? "Processing..." : "Confirm Request"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
