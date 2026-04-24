"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [thumbsRef, thumbsApi] = useEmblaCarousel({ containScroll: 'keepSnaps', dragFree: true });

  const [leadData, setLeadData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const autoplayPlugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [autoplayPlugin.current]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    if (thumbsApi) {
      thumbsApi.scrollTo(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi, thumbsApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      setSubmitted(true);
      setLeadData({ name: "", phone: "" });
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-white gap-4">
      <div className="w-12 h-12 border-2 border-white/10 border-t-amber-400 rounded-full animate-spin" />
      <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40">Curating Asset</p>
    </div>
  );

  // Build media items — support both array of strings and array of objects
  const rawImages: any[] = property.images || (property.image_url ? [property.image_url] : []);
  const mediaItems = rawImages.map((item: any) => {
    if (typeof item === 'string') return { url: item, type: item.endsWith('.mp4') ? 'video' : 'image' };
    return { url: item.url || item, type: item.type || 'image' };
  });
  if (property.video_url) mediaItems.push({ url: property.video_url, type: 'video' });
  if (mediaItems.length === 0) mediaItems.push({ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', type: 'image' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@400;500&display=swap');
        
        :root {
          --gold: #C9A96E;
          --gold-light: #E8D5B0;
          --ink: #0A0A0A;
          --warm: #1A1612;
          --bone: #F7F4EF;
          --muted: #8B8580;
        }

        * { box-sizing: border-box; }

        body { background: var(--bone); }

        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-mono-custom { font-family: 'DM Mono', monospace; }

        .nav-glass {
          background: rgba(247, 244, 239, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .nav-glass.scrolled {
          background: rgba(10, 10, 10, 0.92);
        }
        .nav-glass.scrolled .nav-text { color: white; }
        .nav-glass.scrolled .nav-logo { color: white; }
        .nav-glass.scrolled .nav-logo span { color: var(--gold); }

        .media-slide { flex: 0 0 100%; min-width: 0; position: relative; }

        .thumb-item {
          cursor: pointer;
          flex: 0 0 auto;
          opacity: 0.45;
          transition: opacity 0.3s, transform 0.3s;
          transform: scale(0.92);
        }
        .thumb-item.active {
          opacity: 1;
          transform: scale(1);
        }
        .thumb-item:hover { opacity: 0.8; }

        .dot-btn {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transition: all 0.3s;
          cursor: pointer;
          border: none;
          padding: 0;
        }
        .dot-btn.active {
          background: var(--gold);
          width: 24px;
          border-radius: 3px;
        }

        .arrow-btn {
          width: 52px; height: 52px;
          border-radius: 50%;
          background: rgba(10,10,10,0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(201,169,110,0.3);
          color: white;
          font-size: 18px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.25s;
        }
        .arrow-btn:hover {
          background: var(--gold);
          border-color: var(--gold);
          transform: scale(1.08);
        }

        .feature-pill {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 18px;
          background: white;
          border: 1px solid rgba(201,169,110,0.2);
          border-radius: 14px;
          transition: all 0.25s;
        }
        .feature-pill:hover {
          border-color: var(--gold);
          box-shadow: 0 4px 20px rgba(201,169,110,0.12);
          transform: translateY(-2px);
        }

        .cta-primary {
          background: var(--ink);
          color: white;
          border: 1px solid transparent;
          transition: all 0.3s;
        }
        .cta-primary:hover {
          background: transparent;
          border-color: var(--ink);
          color: var(--ink);
        }

        .form-input {
          width: 100%;
          padding: 20px 24px;
          background: var(--bone);
          border: 1.5px solid transparent;
          border-radius: 16px;
          outline: none;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: var(--ink);
          transition: all 0.25s;
        }
        .form-input:focus {
          border-color: var(--gold);
          background: white;
          box-shadow: 0 0 0 4px rgba(201,169,110,0.08);
        }
        .form-input::placeholder { color: var(--muted); }

        .slide-up {
          animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .counter-badge {
          background: rgba(10,10,10,0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          padding: 8px 16px;
          border-radius: 100px;
        }

        .gold-line {
          width: 48px; height: 2px;
          background: linear-gradient(90deg, var(--gold), transparent);
          margin-bottom: 16px;
        }

        .stat-card {
          background: var(--ink);
          color: white;
          border-radius: 24px;
          padding: 24px;
          text-align: center;
        }

        .success-check {
          width: 72px; height: 72px;
          background: linear-gradient(135deg, var(--gold), #E8C87A);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 32px;
          margin: 0 auto 20px;
          animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .section-number {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--gold);
          letter-spacing: 0.2em;
        }
      `}</style>

      <main style={{ background: 'var(--bone)', minHeight: '100vh', color: 'var(--ink)' }}>

        {/* NAVIGATION */}
        <nav
          className={`nav-glass px-6 md:px-10 py-5 flex justify-between items-center sticky top-0 z-[100] transition-all duration-500 border-b ${isScrolled ? 'scrolled border-white/5' : 'border-black/5'}`}
        >
          <button
            onClick={() => router.back()}
            className="nav-text font-mono-custom text-[9px] font-medium tracking-[0.3em] uppercase flex items-center gap-2 hover:opacity-60 transition-opacity"
          >
            <span>←</span> Portfolio
          </button>
          <div
            className="nav-logo font-display text-2xl font-semibold tracking-tight cursor-pointer"
            onClick={() => router.push('/')}
          >
            MS<span>Estate</span>
          </div>
          <button
            onClick={() => document.getElementById('contact-asset')?.scrollIntoView({ behavior: 'smooth' })}
            className="font-mono-custom text-[9px] font-medium tracking-[0.25em] uppercase hidden md:block hover:opacity-60 transition-opacity"
          >
            Inquire →
          </button>
        </nav>

        {/* HERO + CONTENT LAYOUT */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-8 md:mt-12">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_420px] gap-8 lg:gap-14">

            {/* LEFT: CAROUSEL */}
            <div className="relative order-1">
              {/* Tag */}
              <div className="absolute top-6 left-6 z-20">
                <span className="font-mono-custom text-[9px] tracking-[0.3em] uppercase bg-black/60 backdrop-blur-md text-amber-300 px-4 py-2 rounded-full border border-amber-400/20">
                  {property.tag || 'Exclusive Listing'}
                </span>
              </div>

              {/* Counter */}
              <div className="absolute top-6 right-6 z-20">
                <span className="counter-badge">
                  {selectedIndex + 1} / {mediaItems.length}
                </span>
              </div>

              {/* Main Carousel */}
              <div className="overflow-hidden rounded-[2.5rem] md:rounded-[3rem]" ref={emblaRef}>
                <div className="flex">
                  {mediaItems.map((item: any, index: number) => (
                    <div className="media-slide h-[400px] sm:h-[520px] md:h-[680px] bg-slate-900" key={index}>
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          autoPlay muted loop playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={item.url}
                          className="w-full h-full object-cover"
                          alt={`Property view ${index + 1}`}
                        />
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none rounded-[2.5rem] md:rounded-[3rem]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Nav Arrows */}
              {mediaItems.length > 1 && (
                <>
                  <button onClick={scrollPrev} className="arrow-btn absolute left-5 top-1/2 -translate-y-1/2 z-20">‹</button>
                  <button onClick={scrollNext} className="arrow-btn absolute right-5 top-1/2 -translate-y-1/2 z-20">›</button>
                </>
              )}

              {/* Dot Indicators */}
              {mediaItems.length > 1 && (
                <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                  {scrollSnaps.map((_, idx) => (
                    <button
                      key={idx}
                      className={`dot-btn ${idx === selectedIndex ? 'active' : ''}`}
                      onClick={() => scrollTo(idx)}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnail Strip */}
              {mediaItems.length > 1 && (
                <div className="mt-4 overflow-hidden" ref={thumbsRef}>
                  <div className="flex gap-3">
                    {mediaItems.map((item: any, index: number) => (
                      <div
                        key={index}
                        className={`thumb-item w-20 h-16 md:w-28 md:h-20 rounded-2xl overflow-hidden flex-shrink-0 ${index === selectedIndex ? 'active' : ''}`}
                        onClick={() => scrollTo(index)}
                      >
                        {item.type === 'video' ? (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <span className="text-white text-2xl">▶</span>
                          </div>
                        ) : (
                          <img src={item.url} className="w-full h-full object-cover" alt="" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: PROPERTY INFO */}
            <div className="order-2 flex flex-col justify-between py-2">
              <div>
                {/* Section label */}
                <div className="gold-line" />
                <p className="section-number mb-3">01 — Property Overview</p>

                <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light leading-[0.9] mb-2" style={{ color: 'var(--ink)' }}>
                  {property.area}
                </h1>
                <p className="font-display text-xl italic mb-8" style={{ color: 'var(--muted)' }}>
                  {property.city || 'Prime Location'}, India
                </p>

                {/* Price Block */}
                <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--ink)' }}>
                  <p className="font-mono-custom text-[9px] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Investment</p>
                  <p className="font-display text-3xl md:text-4xl font-light" style={{ color: 'var(--gold-light)' }}>
                    {property.price || 'Price on Request'}
                  </p>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <p className="section-number mb-3">02 — About</p>
                  <p className="font-display text-lg leading-relaxed" style={{ color: 'var(--muted)', fontWeight: 300 }}>
                    {property.description || 'An exclusive residence in a prime location, crafted for those who appreciate the finest in contemporary living.'}
                  </p>
                </div>

                {/* Features */}
                {property.features?.length > 0 && (
                  <div className="mb-10">
                    <p className="section-number mb-4">03 — Highlights</p>
                    <div className="grid grid-cols-2 gap-3">
                      {property.features.map((feature: string, i: number) => (
                        <div key={i} className="feature-pill">
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                          <span className="font-mono-custom text-[10px] uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => document.getElementById('contact-asset')?.scrollIntoView({ behavior: 'smooth' })}
                className="cta-primary w-full py-7 rounded-[1.75rem] font-mono-custom text-[10px] tracking-[0.3em] uppercase cursor-pointer"
              >
                Schedule Private Viewing
              </button>
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-16 md:mt-20">
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {[
              { label: 'Property Type', value: property.type || 'Residential' },
              { label: 'Status', value: property.status || 'Available' },
              { label: 'Listed', value: property.listed_date || 'Recently' },
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <p className="font-mono-custom text-[8px] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{stat.label}</p>
                <p className="font-display text-base md:text-xl font-light" style={{ color: 'var(--gold-light)' }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* LEAD CAPTURE */}
        <section id="contact-asset" className="mt-20 md:mt-32 max-w-[860px] mx-auto px-4 md:px-8 pb-24">
          <div className="rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden" style={{ background: 'var(--ink)' }}>

            {/* Top decorative band */}
            <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--gold), transparent 60%)' }} />

            <div className="p-10 md:p-16">
              {!submitted ? (
                <>
                  <p className="font-mono-custom text-[9px] tracking-[0.35em] uppercase mb-4" style={{ color: 'var(--gold)' }}>
                    04 — Private Inquiry
                  </p>
                  <h3 className="font-display text-4xl md:text-6xl font-light leading-none mb-3" style={{ color: 'white' }}>
                    Request a<br />
                    <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Private Tour</span>
                  </h3>
                  <p className="font-display text-base italic mb-12" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Our dedicated executive for {property.area} will reach out within 2 hours.
                  </p>

                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={leadData.name}
                      onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                      className="form-input"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={leadData.phone}
                      onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                      className="form-input"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '22px',
                        background: isSubmitting ? 'rgba(255,255,255,0.1)' : 'var(--gold)',
                        color: isSubmitting ? 'rgba(255,255,255,0.4)' : 'var(--ink)',
                        border: 'none',
                        borderRadius: '16px',
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '10px',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s',
                        fontWeight: 500,
                      }}
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm Viewing Request →'}
                    </button>
                  </form>

                  <p className="font-mono-custom text-[9px] text-center mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Your information is kept strictly confidential
                  </p>
                </>
              ) : (
                <div className="text-center py-8 slide-up">
                  <div className="success-check">✓</div>
                  <h4 className="font-display text-3xl font-light mb-3" style={{ color: 'white' }}>Request Confirmed</h4>
                  <p className="font-display italic text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Our executive will call you within 2 hours regarding {property.area}.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-10 font-mono-custom text-[9px] tracking-[0.3em] uppercase hover:opacity-60 transition-opacity"
                    style={{ color: 'var(--gold)' }}
                  >
                    Submit another inquiry
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
