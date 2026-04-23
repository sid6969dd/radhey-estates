"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── DATA ────────────────────────────────────────────────────────────────────

const VISA_STEPS = {
  au: [
    { n: "01", title: "Choose Course & University", desc: "Select an eligible institution and program from the CRICOS register. Confirm entry requirements and intake dates." },
    { n: "02", title: "Receive Confirmation of Enrolment", desc: "Once your offer is accepted and fees paid, your university issues a CoE — the key document for your visa application." },
    { n: "03", title: "Get Overseas Health Cover (OSHC)", desc: "Purchase OSHC from an approved provider before lodging your visa. This is mandatory for the full duration of your stay." },
    { n: "04", title: "Apply for Student Visa (Subclass 500)", desc: "Lodge your application online via ImmiAccount. Attach CoE, OSHC, financial evidence, passport, and English test results." },
    { n: "05", title: "Provide Financial Evidence", desc: "Show 12 months of tuition + AUD 24,505 for living costs + return airfare. Bank statements or a scholarship letter are accepted." },
    { n: "06", title: "Health Examination & Biometrics", desc: "You may be asked to complete a medical exam with a panel physician and submit biometrics at a visa application centre." },
    { n: "07", title: "Visa Grant & Pre-Departure", desc: "Once granted, you'll receive a visa grant number. Arrive no more than 90 days before your course start date." },
  ],
  uk: [
    { n: "01", title: "Choose Course & University", desc: "Select a UKVI-licensed Student sponsor. Confirm entry requirements, English language conditions, and tuition fees." },
    { n: "02", title: "Receive CAS Number", desc: "Your university issues a Confirmation of Acceptance for Studies (CAS) number after accepting your unconditional offer." },
    { n: "03", title: "Prepare Financial Documents", desc: "Show at least 9 months of tuition fees + £1,334/month (London) or £1,023/month (elsewhere) for living costs in your bank account." },
    { n: "04", title: "Apply for UK Student Visa", desc: "Apply online up to 6 months before your course starts. Attend a biometrics appointment at a UKVCAS service point." },
    { n: "05", title: "Pay Immigration Health Surcharge", desc: "Pay the IHS upfront as part of your application (currently £776/year). This gives you access to NHS healthcare." },
    { n: "06", title: "Biometrics & Document Upload", desc: "Visit a UKVCAS centre to submit fingerprints and a photo, and upload your supporting documents digitally." },
    { n: "07", title: "Receive Decision & Travel", desc: "Most decisions arrive within 3 weeks. You'll receive a vignette sticker or e-visa to travel to the UK." },
  ],
};

const UNIVERSITIES = {
  au: [
    {
      city: "Sydney",
      color: "amber",
      unis: [
        { name: "University of Sydney", rank: "QS #18", type: "Russell Group equivalent" },
        { name: "University of New South Wales", short: "UNSW Sydney", rank: "QS #19", type: "Go8 Member" },
        { name: "Macquarie University", rank: "QS #195", type: "Research University" },
        { name: "University of Technology Sydney", short: "UTS", rank: "QS #133", type: "Tech & Innovation" },
        { name: "Western Sydney University", rank: "QS #601", type: "Regional University" },
        { name: "Australian Catholic University", short: "ACU", rank: "QS #801", type: "Private / Specialist" },
        { name: "Torrens University Australia", rank: "Unranked", type: "Private / Specialist" },
        { name: "University of Notre Dame Australia", rank: "Unranked", type: "Private / Specialist" },
      ],
    },
    {
      city: "Melbourne",
      color: "slate",
      unis: [
        { name: "University of Melbourne", rank: "QS #14", type: "Go8 Member" },
        { name: "Monash University", rank: "QS #42", type: "Go8 Member" },
        { name: "RMIT University", rank: "QS #124", type: "Tech & Design" },
        { name: "Deakin University", rank: "QS #284", type: "Research University" },
        { name: "La Trobe University", rank: "QS #401", type: "Research University" },
        { name: "Swinburne University of Technology", rank: "QS #431", type: "Tech & Innovation" },
        { name: "Victoria University", rank: "QS #801", type: "Regional University" },
      ],
    },
  ],
  uk: [
    {
      city: "Russell Group",
      color: "amber",
      unis: [
        { name: "University of Edinburgh", rank: "QS #22", type: "Russell Group" },
        { name: "King's College London", rank: "QS #40", type: "Russell Group" },
        { name: "University of Manchester", rank: "QS #32", type: "Russell Group" },
        { name: "University of Bristol", rank: "QS #55", type: "Russell Group" },
        { name: "University of Warwick", rank: "QS #67", type: "Russell Group" },
        { name: "University of Birmingham", rank: "QS #84", type: "Russell Group" },
        { name: "University of Glasgow", rank: "QS #78", type: "Russell Group" },
        { name: "University of Leeds", rank: "QS #75", type: "Russell Group" },
        { name: "University of Southampton", rank: "QS #81", type: "Russell Group" },
        { name: "University of Sheffield", rank: "QS #95", type: "Russell Group" },
      ],
    },
    {
      city: "Top Ranked",
      color: "slate",
      unis: [
        { name: "Durham University", rank: "QS #78", type: "Top Ranked" },
        { name: "University of Nottingham", rank: "QS #99", type: "Russell Group" },
        { name: "Queen Mary University of London", rank: "QS #114", type: "Russell Group" },
        { name: "University of St Andrews", rank: "QS #100", type: "Ancient University" },
        { name: "University of Bath", rank: "QS #179", type: "Top Ranked" },
        { name: "Newcastle University", rank: "QS #110", type: "Russell Group" },
        { name: "University of Liverpool", rank: "QS #163", type: "Russell Group" },
        { name: "University of Exeter", rank: "QS #149", type: "Russell Group" },
        { name: "Lancaster University", rank: "QS #140", type: "Top Ranked" },
        { name: "University of York", rank: "QS #145", type: "Top Ranked" },
      ],
    },
    {
      city: "Specialist & Regional",
      color: "amber",
      unis: [
        { name: "Cardiff University", rank: "QS #151", type: "Russell Group" },
        { name: "University of Reading", rank: "QS #201", type: "Top Ranked" },
        { name: "Queen's University Belfast", rank: "QS #209", type: "Russell Group" },
        { name: "Loughborough University", rank: "QS #224", type: "Sports & Tech" },
        { name: "University of Strathclyde", rank: "QS #302", type: "Tech & Innovation" },
        { name: "University of Aberdeen", rank: "QS #252", type: "Ancient University" },
        { name: "University of Surrey", rank: "QS #323", type: "Top Ranked" },
        { name: "University of Sussex", rank: "QS #261", type: "Top Ranked" },
        { name: "Heriot-Watt University", rank: "QS #273", type: "Tech & Business" },
        { name: "Swansea University", rank: "QS #395", type: "Research University" },
        { name: "City, University of London", rank: "QS #401", type: "Specialist" },
        { name: "University of Leicester", rank: "QS #401", type: "Research University" },
        { name: "Oxford Brookes University", rank: "QS #801", type: "Modern University" },
        { name: "University of East Anglia", rank: "QS #461", type: "Research University" },
        { name: "Brunel University London", rank: "QS #490", type: "Tech University" },
        { name: "University of London", rank: "QS #521", type: "Federal University" },
        { name: "Aston University", rank: "QS #551", type: "Business & Tech" },
        { name: "University of Kent", rank: "QS #651", type: "Research University" },
        { name: "University of Dundee", rank: "QS #384", type: "Research University" },
        { name: "University of Essex", rank: "QS #551", type: "Research University" },
        { name: "Royal Holloway, University of London", rank: "QS #601", type: "Liberal Arts" },
        { name: "SOAS University of London", rank: "QS #501", type: "Specialist" },
        { name: "Bangor University", rank: "QS #651", type: "Research University" },
        { name: "University of Hull", rank: "QS #751", type: "Regional University" },
        { name: "Northumbria University", rank: "QS #801", type: "Modern University" },
      ],
    },
  ],
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function StepCard({ n, title, desc, index }: { n: string; title: string; desc: string; index: number }) {
  return (
    <div
      className="relative flex gap-6 group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Connector line */}
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center font-black text-white text-xs tracking-widest shrink-0 group-hover:bg-amber-500 transition-colors shadow-lg shadow-amber-900/30">
          {n}
        </div>
        <div className="w-px flex-1 bg-white/10 mt-3 mb-0 min-h-[2rem]"></div>
      </div>
      <div className="pb-10 pt-3">
        <h4 className="text-white font-black uppercase tracking-tight text-lg mb-2 leading-tight">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}

function UniversityGroup({ group, countryColor }: { group: typeof UNIVERSITIES.au[0]; countryColor: string }) {
  const [expanded, setExpanded] = useState(true);
  const isAmber = group.color === "amber";

  return (
    <div className="mb-12">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-4 mb-6 group w-full text-left"
      >
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
          isAmber ? "bg-amber-600/20 text-amber-400 border border-amber-600/30" : "bg-white/5 text-slate-400 border border-white/10"
        }`}>
          {group.city}
        </div>
        <div className="h-px flex-1 bg-white/10"></div>
        <span className="text-slate-600 text-xs font-black uppercase tracking-widest">{group.unis.length} unis</span>
        <span className={`text-slate-500 text-lg transition-transform duration-300 ${expanded ? "rotate-90" : ""}`}>›</span>
      </button>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {group.unis.map((uni) => (
            <div
              key={uni.name}
              className="group/card bg-white/5 border border-white/8 rounded-2xl p-6 hover:bg-amber-600/10 hover:border-amber-600/30 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h5 className="text-white font-black text-sm leading-snug uppercase tracking-tight group-hover/card:text-amber-400 transition-colors">
                  {uni.short || uni.name}
                </h5>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-amber-500 bg-amber-600/10 px-2.5 py-1 rounded-full border border-amber-600/20 uppercase tracking-widest">
                  {uni.rank}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {uni.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function EducationPage() {
  const router = useRouter();
  const [country, setCountry] = useState<"uk" | "au">("uk");
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", destination: "uk", course: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return alert("Name and phone are required.");
    setSubmitting(true);
    const { error } = await supabase.from("leads").insert([{
      full_name: formData.name,
      phone: formData.phone,
      property_area: `Education: ${formData.destination.toUpperCase()} — ${formData.course || "General Inquiry"}`,
    }]);
    setSubmitting(false);
    if (!error) setSubmitted(true);
    else alert("Submission error. Please try again.");
  };

  const steps = VISA_STEPS[country];
  const universities = UNIVERSITIES[country];

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans">

      {/* NAV */}
      <nav className="fixed top-0 w-full z-[500] bg-slate-950/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <button onClick={() => router.push("/")} className="flex items-center gap-5 group">
            <div className="w-8 h-8 overflow-hidden rounded-lg bg-white/10 flex items-center justify-center">
              <img src="/logo.png" alt="MS Logo" className="w-full h-full object-contain p-1"
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
            <span className="text-base font-light uppercase tracking-[0.3em] text-white/80 group-hover:text-white transition-colors">
              MS<span className="font-black">ESTATES</span>
            </span>
          </button>
          <button
            onClick={() => router.push("/")}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-2"
          >
            ‹ Back to Home
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(180,110,0,0.15),_transparent_60%)]"></div>
        <div className="max-w-[1400px] mx-auto relative">
          <span className="text-amber-500 font-black text-[10px] tracking-[1em] uppercase mb-6 block">MS Estates · Education Division</span>
          <h1 className="text-6xl sm:text-8xl md:text-[10rem] font-black uppercase leading-[0.8] tracking-tighter mb-12">
            Study<br /><span className="text-amber-500 italic">Abroad.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed mb-14">
            Your complete guide to university admissions, student visa pathways, and top institutions in the UK and Australia.
          </p>

          {/* COUNTRY TOGGLE */}
          <div className="flex gap-4">
            <button
              onClick={() => setCountry("uk")}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 border ${
                country === "uk"
                  ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-900/40"
                  : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              <img src="https://flagcdn.com/w40/gb.png" alt="UK" className="w-6 h-4 object-cover rounded-sm" />
              United Kingdom
            </button>
            <button
              onClick={() => setCountry("au")}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 border ${
                country === "au"
                  ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-900/40"
                  : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              <img src="https://flagcdn.com/w40/au.png" alt="Australia" className="w-6 h-4 object-cover rounded-sm" />
              Australia
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT: VISA STEPS + UNIVERSITIES */}
      <section className="px-6 pb-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-16 items-start">

            {/* LEFT: VISA STEPS */}
            <div className="lg:sticky lg:top-28">
              <div className="mb-8">
                <span className="text-amber-500 font-black text-[10px] tracking-[0.6em] uppercase block mb-3">Step-by-Step</span>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                  {country === "uk" ? "UK Student Visa" : "Australia Subclass 500"}
                </h2>
                <p className="text-slate-500 text-sm mt-2 font-medium">
                  {country === "uk" ? "Student Route (formerly Tier 4)" : "Student Visa (Subclass 500)"}
                </p>
              </div>
              <div>
                {steps.map((step, i) => (
                  <StepCard key={step.n} {...step} index={i} />
                ))}
              </div>
            </div>

            {/* RIGHT: UNIVERSITIES */}
            <div>
              <div className="mb-10 flex items-end justify-between gap-4">
                <div>
                  <span className="text-amber-500 font-black text-[10px] tracking-[0.6em] uppercase block mb-3">Partner Institutions</span>
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                    {country === "uk" ? "Universities in the UK" : "Universities in Australia"}
                  </h2>
                </div>
                <span className="text-slate-600 font-black text-[10px] uppercase tracking-widest shrink-0">
                  {universities.reduce((a, g) => a + g.unis.length, 0)} institutions
                </span>
              </div>
              {universities.map((group) => (
                <UniversityGroup key={group.city} group={group} countryColor={country} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA / INQUIRY FORM */}
      <section className="px-6 pb-32">
        <div className="max-w-[900px] mx-auto">
          <div className="bg-gradient-to-br from-amber-600/20 to-transparent border border-amber-600/20 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl"></div>
            <div className="relative">
              <span className="text-amber-500 font-black text-[10px] tracking-[0.6em] uppercase block mb-4">Free Consultation</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
                Start Your<br /><span className="text-amber-500 italic">Application.</span>
              </h2>
              <p className="text-slate-400 font-medium mb-12 max-w-md">
                Our advisors will guide you through every step — from shortlisting universities to visa approval.
              </p>

              {submitted ? (
                <div className="flex flex-col items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-600 flex items-center justify-center text-2xl">✓</div>
                  <h3 className="text-2xl font-black uppercase text-white">Request Received</h3>
                  <p className="text-slate-400">A consultant will contact you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 px-6 py-5 rounded-2xl text-white placeholder:text-slate-600 font-bold outline-none focus:ring-2 focus:ring-amber-600/40 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 px-6 py-5 rounded-2xl text-white placeholder:text-slate-600 font-bold outline-none focus:ring-2 focus:ring-amber-600/40 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Destination</label>
                      <select
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 px-6 py-5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-amber-600/40 transition-all appearance-none"
                      >
                        <option value="uk" className="bg-slate-900">🇬🇧 United Kingdom</option>
                        <option value="au" className="bg-slate-900">🇦🇺 Australia</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Desired Course</label>
                      <input
                        type="text"
                        placeholder="e.g. MBA, Engineering..."
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 px-6 py-5 rounded-2xl text-white placeholder:text-slate-600 font-bold outline-none focus:ring-2 focus:ring-amber-600/40 transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-6 bg-amber-600 text-white rounded-full font-black text-[11px] tracking-[0.5em] uppercase hover:bg-white hover:text-slate-900 transition-all shadow-2xl shadow-amber-900/30 active:scale-95 disabled:opacity-50 mt-2"
                  >
                    {submitting ? "Sending..." : "Request Free Consultation →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10 px-6 text-center">
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          © MS Estates · Education Advisory Division · Gurugram
        </p>
      </footer>

    </main>
  );
}
