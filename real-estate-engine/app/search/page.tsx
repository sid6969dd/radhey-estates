"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const area = searchParams.get('area');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      const { data } = await supabase.from('properties').select('*').ilike('area', `%${area}%`);
      if (data) setResults(data);
    };
    fetchResults();
  }, [area]);

  return (
    <div className="bg-slate-50 min-h-screen p-10 pt-32">
      <h1 className="text-5xl font-black mb-10 uppercase tracking-tighter">Assets in <span className="text-orange-500">{area}</span></h1>
      <div className="grid gap-8">
        {results.map(item => (
          <div key={item.id} onClick={() => router.push(`/property/${item.id}`)} className="bg-white p-8 rounded-[3rem] flex flex-col md:flex-row gap-10 shadow-sm hover:shadow-2xl transition-all cursor-pointer group">
            <div className="w-full md:w-80 h-60 overflow-hidden rounded-[2rem]">
              <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="flex flex-col justify-center text-left">
              <span className="text-orange-500 font-black text-xs uppercase tracking-[0.3em] mb-2">{item.tag}</span>
              <h2 className="text-4xl font-black uppercase mb-2">{item.area}</h2>
              <p className="text-slate-400 font-serif italic text-2xl mb-6">{item.price}</p>
              <button className="text-slate-900 font-black underline uppercase tracking-widest text-xs">View Asset Intelligence →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}