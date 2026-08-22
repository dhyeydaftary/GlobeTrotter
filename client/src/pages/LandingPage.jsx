import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, MapPin, DollarSign, Share2, Star, Globe, Clock, Users, Map, Bot, Smartphone, Link2, CheckCircle2 } from 'lucide-react';
import {
  motion,
  useReducedMotion,
  useMotionValue,
  animate,
} from 'motion/react';
import {
  springSettle,
  springMomentum,
  staggerContainer,
  staggerContainerSlow,
  fadeUpItem,
  scaleInItem,
  getMotionProps,
} from '../lib/motion';
import {
  HERO_PARIS,
  HERO_BALI,
  HERO_TOKYO,
  TRIP_CARD_FALLBACK,
  LANDING_SANTORINI,
  LANDING_KYOTO,
  LANDING_LISBON,
} from '../constants/images';

// Airplane icon — matches the Navbar
const AirplaneIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Stat counter — count up from 0 to target on first in-view trigger
// ---------------------------------------------------------------------------
const StatCounter = ({ target, suffix = '', reduceMotion }) => {
  const motionVal = useMotionValue(reduceMotion ? target : 0);
  const nodeRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      if (nodeRef.current) nodeRef.current.textContent = target + suffix;
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(motionVal, target, {
            duration: 1.2,
            ease: 'easeOut',
            onUpdate: (v) => {
              if (nodeRef.current)
                nodeRef.current.textContent = Math.round(v).toLocaleString() + suffix;
            },
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [target, suffix, reduceMotion, motionVal]);

  return <span ref={nodeRef}>{reduceMotion ? target + suffix : '0' + suffix}</span>;
};

// ---------------------------------------------------------------------------
// Star rating helper
// ---------------------------------------------------------------------------
const Stars = ({ n = 5 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: n }).map((_, i) => (
      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const reduceMotion = useReducedMotion();

  const handlePrimaryCTA = () => navigate(isAuthenticated ? '/dashboard' : '/signup');

  const heroProps = getMotionProps(reduceMotion, 'mount');
  const scrollProps = getMotionProps(reduceMotion, 'scroll');

  // Testimonial data
  const testimonials = [
    {
      name: 'Riya Mehta',
      handle: '@riya.travels',
      avatar: 'RM',
      text: "GlobeTrotter completely changed how I plan trips. I used to spend days on spreadsheets — now I build a full 2-week itinerary in an hour. The budget tracker is a game changer.",
      stars: 5,
      trip: 'Europe Summer 2026',
    },
    {
      name: 'Arjun Patel',
      handle: '@arjun_explorer',
      avatar: 'AP',
      text: "The AI recommendations are genuinely useful — not just tourist traps. It suggested Plovdiv over Sofia based on my vibe and it was the best call of the whole trip.",
      stars: 5,
      trip: 'Balkans Road Trip',
    },
    {
      name: 'Dhyey Daftary',
      handle: '@dhyey.d',
      avatar: 'DD',
      text: "Sharing the public link with my friends before the trip so they can see the plan is 🔥. No more forwarding PDFs or screenshots. One link, done.",
      stars: 5,
      trip: 'Japan Cherry Blossom Tour',
    },
    {
      name: 'Priya Shah',
      handle: '@priyagoesplaces',
      avatar: 'PS',
      text: "Finally an app that treats itinerary building as a first-class feature, not an afterthought. The day-by-day view is clean, the activity cards are beautiful.",
      stars: 5,
      trip: 'Southeast Asia Backpack',
    },
    {
      name: 'Karan Joshi',
      handle: '@karanj',
      avatar: 'KJ',
      text: "Used it for a 5-city trip with my college group. We could all see the itinerary through the public link and give feedback before we even booked flights. Perfect workflow.",
      stars: 5,
      trip: 'Europe Backpacking 2026',
    },
    {
      name: 'Meera Nair',
      handle: '@meera.away',
      avatar: 'MN',
      text: "The budget breakdown by category is exactly what I needed. I could see we were overspending on accommodation mid-trip and adjust on the fly. Genuinely saved money.",
      stars: 5,
      trip: 'Morocco & Portugal',
    },
  ];

  return (
    <div className="min-h-screen bg-surface font-body text-text-main selection:bg-accent-light selection:text-accent overflow-x-hidden">

      {/* ================================================================= */}
      {/* 1. HERO                                                             */}
      {/* ================================================================= */}
      <section className="relative pt-16 flex flex-col overflow-hidden bg-gradient-to-br from-[#1A1A2E] via-[#2D2A5C] to-[#14141F]">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="16" cy="16" r="1" fill="rgba(255,255,255,0.06)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">

            {/* Left: hero copy */}
            <motion.div
              className="w-full lg:w-[56%] space-y-5 sm:space-y-6"
              variants={staggerContainer}
              {...heroProps}
            >
              <motion.div
                variants={fadeUpItem}
                className="inline-flex items-center space-x-2 bg-accent/20 border border-accent/40 rounded-full px-4 py-1.5 backdrop-blur-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="text-accent-light text-xs font-semibold tracking-wide uppercase">
                  AI-Powered Travel Planner
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUpItem}
                className="font-display font-extrabold text-white leading-tight"
                style={{ fontSize: 'clamp(2.2rem, 4.8vw, 3.8rem)' }}
              >
                Plan Your{' '}
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  Dream
                  <svg
                    style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%' }}
                    height="6" viewBox="0 0 200 6" fill="none" aria-hidden="true"
                  >
                    <path d="M0,3 Q25,0 50,3 Q75,6 100,3 Q125,0 150,3 Q175,6 200,3"
                      stroke="#5B5BF6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
                <br />Journey, City by City.
              </motion.h1>

              <motion.p
                variants={fadeUpItem}
                className="text-text-light text-base sm:text-lg leading-relaxed max-w-[520px]"
              >
                Build multi-city itineraries, assign activities to each day, track your budget live — then share it with one clean link.
              </motion.p>

              <motion.div variants={fadeUpItem} className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handlePrimaryCTA}
                  className="bg-accent hover:bg-accent-hover text-white rounded-btn px-7 py-3.5 font-bold text-sm sm:text-base shadow-btn-accent active:scale-[0.97] transition-all duration-150"
                >
                  {isAuthenticated ? 'Go to Dashboard →' : 'Start Planning Free →'}
                </button>
                <button
                  onClick={() => navigate('/public/trips/summer-euro-expedition-2026')}
                  className="border border-white/30 hover:bg-white/10 text-white rounded-btn px-6 py-3.5 font-semibold text-sm sm:text-base active:scale-[0.97] transition-all duration-150"
                >
                  View a sample trip
                </button>
              </motion.div>

              {/* Stats row */}
              <motion.div
                variants={fadeUpItem}
                className="pt-6 border-t border-white/15 flex flex-wrap items-center gap-x-8 gap-y-3"
              >
                <div>
                  <p className="font-display font-extrabold text-white text-2xl leading-tight">
                    <StatCounter target={2400} suffix="+" reduceMotion={reduceMotion} />
                  </p>
                  <p className="text-xs text-text-light font-medium mt-0.5">Trips Planned</p>
                </div>
                <div className="w-px h-8 bg-white/15 hidden sm:block" />
                <div>
                  <p className="font-display font-extrabold text-white text-2xl leading-tight">
                    <StatCounter target={60} suffix="+" reduceMotion={reduceMotion} />
                  </p>
                  <p className="text-xs text-text-light font-medium mt-0.5">Cities Seeded</p>
                </div>
                <div className="w-px h-8 bg-white/15 hidden sm:block" />
                <div>
                  <p className="font-display font-extrabold text-white text-2xl leading-tight">AI-Ranked</p>
                  <p className="text-xs text-text-light font-medium mt-0.5">Semantic Ideas</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: photo stack */}
            <div className="hidden lg:block w-[44%] relative h-[320px]">
              <div className="relative w-full h-full">
                <motion.div
                  className="w-[175px] h-[230px] rounded-card border-2 border-white/20 shadow-2xl overflow-hidden absolute right-[88px] top-[10px] bg-slate-900 z-10"
                  style={{ rotate: -8 }}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...springSettle, delay: 0.0 }}
                >
                  <img src={HERO_PARIS} alt="Paris" className="w-full h-full object-cover" onError={(e) => { e.target.src = TRIP_CARD_FALLBACK; }} />
                  <div className="absolute bottom-3 left-3 bg-accent text-white text-xs font-bold rounded-full px-2.5 py-0.5 shadow-md">Paris</div>
                </motion.div>
                <motion.div
                  className="w-[175px] h-[230px] rounded-card border-2 border-white/20 shadow-2xl overflow-hidden absolute right-[44px] top-[44px] bg-slate-900 z-20"
                  style={{ rotate: -2 }}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...springSettle, delay: 0.15 }}
                >
                  <img src={HERO_BALI} alt="Bali" className="w-full h-full object-cover" onError={(e) => { e.target.src = TRIP_CARD_FALLBACK; }} />
                  <div className="absolute bottom-3 left-3 bg-accent text-white text-xs font-bold rounded-full px-2.5 py-0.5 shadow-md">Bali</div>
                </motion.div>
                <motion.div
                  className="w-[175px] h-[230px] rounded-card border-2 border-white/20 shadow-2xl overflow-hidden absolute right-[0px] top-[76px] bg-slate-900 z-30 cursor-pointer"
                  style={{ rotate: 5 }}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...springSettle, delay: 0.30 }}
                  whileHover={reduceMotion ? {} : { scale: 1.06, rotate: 1, transition: springMomentum }}
                >
                  <img src={HERO_TOKYO} alt="Tokyo" className="w-full h-full object-cover" onError={(e) => { e.target.src = TRIP_CARD_FALLBACK; }} />
                  <div className="absolute bottom-3 left-3 bg-accent text-white text-xs font-bold rounded-full px-2.5 py-0.5 shadow-md">Tokyo</div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 2. TRUST BAR — quick scan social proof strip                        */}
      {/* ================================================================= */}
      <motion.div
        className="bg-surface-card border-y border-border-light py-5"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-text-muted text-sm font-medium">
            {[
              { icon: <Users className="w-4 h-4 text-accent" />, text: '2,400+ trips planned by travelers worldwide' },
              { icon: <Globe className="w-4 h-4 text-accent" />, text: '60+ seeded cities across 30+ countries' },
              { icon: <><Stars /><span className="font-semibold text-text-main ml-1">4.9</span></>, text: 'average from 240+ reviews' },
              { icon: <Clock className="w-4 h-4 text-accent" />, text: 'Build a full itinerary in under 30 minutes' },
            ].map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="w-px h-4 bg-border-light hidden sm:block" />}
                <motion.div
                  variants={fadeUpItem}
                  className="flex items-center gap-2"
                >
                  {item.icon}
                  <span>{item.text}</span>
                </motion.div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ================================================================= */}
      {/* 3. FEATURES                                                         */}
      {/* ================================================================= */}
      <section id="features" className="relative bg-surface-card py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative radial glow behind section header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center max-w-[580px] mx-auto" variants={fadeUpItem} {...scrollProps}>
            <p className="text-accent text-xs font-bold tracking-widest uppercase mb-2">EVERYTHING YOU NEED</p>
            <h2 className="text-display-lg font-extrabold text-text-main text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight">
              Travel planning, finally done right.
            </h2>
            <p className="text-text-muted text-base sm:text-lg mt-3.5 leading-relaxed">
              GlobeTrotter brings your entire trip — cities, activities, budget, sharing — into one unified, elegant workspace.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14 sm:mt-18"
            variants={staggerContainer}
            {...scrollProps}
          >
            {[
              {
                title: 'Build Your Itinerary',
                body: 'Add city stops, assign activities to specific days and times, and reorder everything effortlessly with a clean drag-and-drop flow.',
                icon: <MapPin className="w-6 h-6 text-accent" />,
              },
              {
                title: 'Live Budget Tracking',
                body: 'Every activity you add updates the total instantly. See cost breakdowns by category and by day — no surprises at checkout.',
                icon: <DollarSign className="w-6 h-6 text-accent" />,
              },
              {
                title: 'Share Your Adventure',
                body: 'Toggle public visibility to get a shareable link anyone can view — or let them copy your entire trip into their own account in one click.',
                icon: <Share2 className="w-6 h-6 text-accent" />,
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUpItem}
                className="gt-card p-8 text-left hover:border-accent/40"
              >
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center mb-6 shadow-sm"
                  whileHover={reduceMotion ? {} : { scale: 1.05, transition: springMomentum }}
                >
                  {card.icon}
                </motion.div>
                <h3 className="text-display-md font-bold text-lg text-text-main mb-2">{card.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Extended features — 2×2 grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8"
            variants={staggerContainer}
            {...scrollProps}
          >
            {[
              {
                icon: <Map className="w-5 h-5 text-accent" />,
                title: 'Multi-City Trips',
                body: 'String together as many cities as you want in one trip — Paris → Rome → Athens — with clean day-by-day breakdowns per city.',
              },
              {
                icon: <Bot className="w-5 h-5 text-accent" />,
                title: 'AI Destination Matching',
                body: 'Describe your vibe and our semantic engine suggests cities and activities that actually match your travel personality.',
              },
              {
                icon: <Smartphone className="w-5 h-5 text-accent" />,
                title: 'Fully Responsive',
                body: 'Plan on desktop, check your itinerary on the go. Every page is designed to work beautifully on any screen size.',
              },
              {
                icon: <Link2 className="w-5 h-5 text-accent" />,
                title: 'One-Link Sharing',
                body: 'Share a clean public URL with your travel group. No accounts required to view — just a beautiful read-only itinerary page.',
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUpItem}
                className="gt-card p-6 flex items-start gap-4 hover:border-accent/30"
                whileHover={{ y: -3, transition: springMomentum }}
              >
                <motion.div
                  className="w-11 h-11 rounded-xl bg-accent-light flex items-center justify-center shrink-0 mt-0.5"
                  whileHover={{ scale: 1.08, rotate: 6, transition: springMomentum }}
                >
                  {f.icon}
                </motion.div>
                <div>
                  <h4 className="font-bold text-text-main text-sm mb-1">{f.title}</h4>
                  <p className="text-text-muted text-xs leading-relaxed">{f.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. HOW IT WORKS                                                     */}
      {/* ================================================================= */}
      <section id="how-it-works" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ background: 'linear-gradient(160deg, #F0F0FA 0%, #FAFAFC 60%, #EEEEFE 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center max-w-[580px] mx-auto mb-16" variants={fadeUpItem} {...scrollProps}>
            <p className="text-accent text-xs font-bold tracking-widest uppercase mb-2">THE FLOW</p>
            <h2 className="text-display-lg font-extrabold text-text-main text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight">
              From idea to itinerary in minutes.
            </h2>
            <p className="text-text-muted text-base mt-3 leading-relaxed">
              No complex setup, no learning curve. If you can make a list, you can build a world-class travel itinerary.
            </p>
          </motion.div>

          <motion.div
            className="relative grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainerSlow}
            {...scrollProps}
          >
            {/* Animated connector line */}
            <div className="hidden md:block absolute top-[40px] left-[18%] right-[18%] h-[2px] z-0 overflow-hidden bg-border-light rounded-full">
              <motion.div
                className="h-full bg-accent/40 rounded-full origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
              />
            </div>
            {[
              { n: '01', title: 'Create Your Trip', body: 'Give your trip a name, set your travel dates, pick a cover photo, and add your first city destination.', icon: <CheckCircle2 className="w-4 h-4 text-accent" /> },
              { n: '02', title: 'Build the Itinerary', body: 'Search activities for each city, assign them to specific dates and times, and set your estimated costs.', icon: <MapPin className="w-4 h-4 text-accent" /> },
              { n: '03', title: 'Share or Keep Private', body: 'Toggle public visibility to generate a shareable link that fellow travelers can view and copy into their own account.', icon: <Share2 className="w-4 h-4 text-accent" /> },
            ].map((step) => (
              <motion.div
                key={step.n}
                variants={fadeUpItem}
                className="relative z-10 gt-card p-8 sm:p-9 group"
                whileHover={{ y: -4, transition: springMomentum }}
              >
                {/* Step number badge — clearly visible */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-btn-accent shrink-0">
                    <span className="font-display font-extrabold text-white text-lg leading-none">{step.n}</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-accent-light flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-display-md font-bold text-xl text-text-main">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed mt-2.5">{step.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. AI RECOMMENDATIONS                                               */}
      {/* ================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 text-white bg-gradient-to-br from-[#1A1A2E] via-[#2D2A5C] to-[#14141F] relative overflow-hidden">
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 items-center relative z-10">
          <motion.div className="space-y-6" variants={fadeUpItem} {...scrollProps}>
            <div className="inline-flex items-center space-x-2 bg-accent/20 border border-accent/40 rounded-full px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-accent-light text-xs font-semibold tracking-wide uppercase">AI-POWERED</span>
            </div>
            <h2 className="text-display-lg font-extrabold text-white text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight">
              Get destination ideas tailored to your vibe.
            </h2>
            <p className="text-text-light text-base sm:text-lg leading-relaxed max-w-lg">
              Our recommendation engine uses semantic matching to suggest cities and activities that match your travel personality — not generic top 10 lists.
            </p>
            <button
              onClick={handlePrimaryCTA}
              className="bg-accent hover:bg-accent-hover text-white font-bold text-sm sm:text-base rounded-btn px-7 py-3.5 shadow-btn-accent active:scale-[0.97] transition-all duration-150"
            >
              Try it on your trip →
            </button>
          </motion.div>

          <motion.div
            className="gt-glass-dark border border-white/15 rounded-card p-6 sm:p-7 shadow-glass space-y-4"
            variants={scaleInItem}
            {...scrollProps}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-white text-sm font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Recommended Destinations</span>
              </span>
              <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">AI Match</span>
            </div>
            {[
              { img: LANDING_SANTORINI, name: 'Santorini', country: 'Greece', why: 'Matches: beaches, coastal scenery', w: '92%' },
              { img: LANDING_KYOTO, name: 'Kyoto', country: 'Japan', why: 'Matches: culture, historical shrines', w: '78%' },
              { img: LANDING_LISBON, name: 'Lisbon', country: 'Portugal', why: 'Matches: culinary, historic architecture', w: '65%' },
            ].map((row, i) => (
              <div key={row.name} className={`flex items-center justify-between gap-3.5 py-2.5 ${i < 2 ? 'border-b border-white/10' : ''}`}>
                <img src={row.img} alt={row.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{row.name}</p>
                  <p className="text-text-light text-xs">{row.country}</p>
                  <p className="text-accent-light/90 italic text-[11px] truncate mt-0.5">{row.why}</p>
                </div>
                <div className="w-16 bg-white/20 h-1.5 rounded-full overflow-hidden shrink-0">
                  <div className="bg-accent h-full rounded-full" style={{ width: row.w }} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 6. TESTIMONIALS                                                      */}
      {/* ================================================================= */}
      <section id="testimonials" className="relative bg-[#F8F8FC] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Large decorative quote mark */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 font-display font-extrabold text-[280px] text-accent/[0.04] leading-none select-none pointer-events-none" aria-hidden="true">&ldquo;</div>
        {/* Top gradient fade from white */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-surface-card to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center max-w-[580px] mx-auto mb-14" variants={fadeUpItem} {...scrollProps}>
            <p className="text-accent text-xs font-bold tracking-widest uppercase mb-2">REAL TRAVELERS</p>
            <h2 className="text-display-lg font-extrabold text-text-main text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight">
              Loved by explorers worldwide.
            </h2>
            <p className="text-text-muted text-base mt-3.5 leading-relaxed">
              Don't take our word for it. Here's what people building real trips with GlobeTrotter have to say.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            {...scrollProps}
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUpItem}
                className="gt-card p-6 flex flex-col gap-4 border-l-4 border-l-accent/20 hover:border-l-accent/60 hover:border-border-light transition-all"
                whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(91,91,246,0.12)', transition: springMomentum }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-light text-accent border border-accent/20 flex items-center justify-center font-bold text-sm shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-text-main">{t.name}</p>
                      <p className="text-xs text-text-muted">{t.handle}</p>
                    </div>
                  </div>
                  <Stars />
                </div>
                <p className="text-text-muted text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-1.5 mt-1 pt-3 border-t border-border-light">
                  <MapPin className="w-3 h-3 text-accent shrink-0" />
                  <span className="text-[11px] font-semibold text-accent">{t.trip}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 7. BOTTOM CTA                                                       */}
      {/* ================================================================= */}
      <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2A5C 55%, #14141F 100%)' }}>
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        {/* Top border shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center space-y-6"
          variants={fadeUpItem}
          {...scrollProps}
        >
          <h2 className="text-display-lg font-extrabold text-white text-[clamp(1.9rem,3.5vw,2.8rem)] leading-tight">
            Ready to plan your next adventure?
          </h2>
          <p className="text-white/90 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Join thousands of travelers building smarter, beautifully organized multi-city trips. Free to start, no credit card required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handlePrimaryCTA}
              className="bg-white hover:bg-surface-raised text-text-main font-bold text-sm sm:text-base rounded-btn px-8 py-3.5 shadow-xl active:scale-[0.97] transition-all duration-150"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-white/40 hover:border-white/70 hover:bg-white/10 text-white font-bold text-sm sm:text-base rounded-btn px-8 py-3.5 active:scale-[0.97] transition-all duration-150"
              >
                Log in instead
              </button>
            )}
          </div>
          <p className="text-white/60 text-xs pt-1">No credit card required · Cancel anytime</p>
        </motion.div>
      </section>

      {/* ================================================================= */}
      {/* 8. FOOTER                                                           */}
      {/* ================================================================= */}
      <footer className="bg-[#14141F] text-white py-14 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-wrap justify-between items-start gap-10">
            <div>
              <Link to="/" className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-btn-accent">
                  <AirplaneIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-lg tracking-tight text-white">
                  Globe<span className="text-accent">Trotter</span>
                </span>
              </Link>
              <p className="text-text-light text-xs sm:text-sm mt-2 font-medium">Your journey, beautifully planned.</p>
            </div>
            <div className="flex flex-wrap gap-12 sm:gap-16">
              <div>
                <h4 className="text-white text-xs font-bold tracking-wider uppercase mb-3">Product</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-text-light">
                  <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                  <li><Link to="/trips" className="hover:text-white transition-colors">My Trips</Link></li>
                  <li><Link to="/trips/new" className="hover:text-white transition-colors">Plan a Trip</Link></li>
                  <li><Link to="/public/trips/summer-euro-expedition-2026" className="hover:text-white transition-colors">Sample Public Trip</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white text-xs font-bold tracking-wider uppercase mb-3">Account</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-text-light">
                  <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                  <li><Link to="/login" className="hover:text-white transition-colors">Log In</Link></li>
                  <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
                </ul>
              </div>
            </div>
            <div className="text-text-light text-xs md:text-right">Built for the Odoo × LDCE Hackathon</div>
          </div>
          <div className="border-t border-white/10 pt-6 flex items-center justify-between text-xs text-text-light">
            <p>© 2026 GlobeTrotter. All rights reserved.</p>
            <span className="text-accent">✦</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
