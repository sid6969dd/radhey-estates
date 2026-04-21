"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 1. REUSE THE SLIDESHOW COMPONENT HERE
function ImageSlideshow({ images }: { images: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageList = Array.isArray(images) ? images : [images].filter(Boolean);

  useEffect(() => {
    if (imageList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [imageList]);

  if (imageList.length === 0) return <div className="w-full h-full bg-slate-200 animate-pulse" />;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {imageList.map((src, index) => (
        <img
          key={index}
          src={src}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"
          }`}
          alt="Property View"
        />
      ))}
      {/* Dots for the details page */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {imageList.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
}

export default function PropertyDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) setProperty(data);
    };
    fetchProperty();
  }, [id]);

  if (!property) return <div className="min-h-screen flex items-center justify-center font-black tracking-widest text-slate-400">LOADING ASSET...</div>;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HERO SECTION WITH SLIDESHOW */}
      <section className="relative h-[60vh] md:h-[80vh] bg-slate-100">
        <button 
          onClick={() => router.back()}
          className="absolute top-8 left-8 z-50 bg-white/90 backdrop-blur-md p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        
        {/* UPDATED: Pass the image_url (which should be an array) here */}
        <ImageSlideshow images={property.image_url} />
      </section>

      {/* CONTENT SECTION */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 border-b border-slate-100 pb-12">
          <div>
            <span className="text-orange-600 font-black text-xs tracking-[0.3em] uppercase mb-4 block">{property.tag || 'Exclusive Listing'}</span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">{property.area}</h1>
            <p className="text-slate-400 font-medium text-lg italic">Premium Portfolio Asset</p>
          </div>
          <div className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
            {property.price ? `₹ ${property.price}` : 'POA'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-6">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Specifications</h3>
            <p className="text-xl leading-relaxed text-slate-600">{property.description || "Detailed specifications for this premier holding are available upon verified request."}</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
             <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6">Inquiry</h3>
             <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-orange-600 transition-all">
                Request Private Briefing
             </button>
          </div>
        </div>
      </section>
    </main>
  );
}
