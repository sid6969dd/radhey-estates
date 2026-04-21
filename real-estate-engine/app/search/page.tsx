"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 1. Separate the logic into a content component
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const area = searchParams.get('area');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!area) return;
      const { data } = await supabase
        .from('properties')
        .select('*')
        .ilike('area', `%${area}%`);
      if (data) setResults(data);
    };
    fetchResults();
  }, [area]);

  return (
    <div className="bg-[#FDFCFB] min-h-screen p-10 pt-32">
      <h1 className="text-5xl font-black mb-10 uppercase tracking-tighter text-slate-900">
        Assets in <span className="bg-gradient-to-b from-slate-200 via-slate-500 to-slate-200 bg-clip-text text-transparent italic font-serif">{area}</span>
      </h1>
      
      <div className="grid gap-8 max-w-5xl">
        {results.length > 0 ? (
          results.map(item => (
            <div 
              key={item.id} 
              onClick={() => router.push(`/property/${item.id}`)} 
              className="bg-white p-8 rounded-[3rem] flex flex-col md:flex-row gap-10 shadow-sm hover:shadow-2xl transition-all cursor-pointer group border border-slate-100"
            >
              <div className="w-full md:w-80 h-60 overflow-hidden rounded-[2rem] bg-slate-100">
                <img 
                  src={item.image_url} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={item.area}
                />
              </div>
              <div className="flex flex-col justify-center text-left">
                <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
                  {item.tag || 'Legacy Holding'}
                </span>
                <h2 className="text-4xl font-black uppercase mb-2 text-slate-900">{item.area}</h2>
                <p className="text-slate-500 font-serif italic text-2xl mb-6">
                  {item.price ? `₹ ${item.price}` : 'Price on Request'}
                </p>
                <button className="text-slate-900 font-black underline uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors">
                  View Asset Intelligence →
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400 font-bold uppercase tracking-widest">No matching assets found.</p>
        )}
      </div>
    </div>
  );
}

// 2. Wrap the component in Suspense for the main export
export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="text-slate-400 font-black tracking-[0.5em] uppercase text-xs animate-pulse">
          Retrieving Intelligence...
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}