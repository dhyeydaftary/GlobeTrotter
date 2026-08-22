import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInView } from '../hooks/useInView';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Navbar background scroll trigger (>60px)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section inView observers for entrance animations
  const [heroRef, heroInView] = useInView();
  const [featuresRef, featuresInView] = useInView();
  const [howItWorksRef, howItWorksInView] = useInView();
  const [aiRef, aiInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  const handlePrimaryCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body text-textMain selection:bg-accent/20 selection:text-accent overflow-x-hidden">
      {/* SECTION 1 — Sticky Navbar (Height: 68px) */}
      <nav
        className="fixed top-0 left-0 right-0 h-[68px] z-[100] transition-all duration-300 flex items-center"
        style={{
          backgroundColor: scrolled ? 'rgba(30, 58, 95, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          {/* Logo Left */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-[34px] h-[34px] rounded-full bg-accent flex items-center justify-center shadow-accent-glow">
              <svg className="w-[22px] h-[22px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <span className="font-display text-[20px] tracking-tight">
              <span className="font-normal text-white">Globe</span>
              <span className="font-bold text-accent">Trotter</span>
            </span>
          </Link>

          {/* Right Side Links & Action Buttons */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Desktop Section Anchors */}
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden md:inline-block text-sm font-medium text-white/80 hover:text-white transition-opacity"
            >
              Features
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden md:inline-block text-sm font-medium text-white/80 hover:text-white transition-opacity"
            >
              How it works
            </button>

            {/* Vertical Divider */}
            <div className="hidden md:block w-px h-5 bg-white/20" />

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs sm:text-sm font-bold bg-accent hover:bg-accent-hover text-white rounded-lg px-4 py-2 hover:shadow-[0_4px_16px_rgba(255,107,107,0.4)] transition-all duration-200"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                {/* Log in button */}
                <button
                  onClick={() => navigate('/login')}
                  className="text-xs sm:text-sm font-semibold text-white border border-white/30 rounded-lg px-3 py-1.5 sm:px-5 sm:py-2 hover:bg-white hover:text-primary transition-all duration-200"
                >
                  Log in
                </button>

                {/* Get Started coral button */}
                <button
                  onClick={() => navigate('/signup')}
                  className="text-xs sm:text-sm font-bold bg-accent hover:bg-accent-hover text-white rounded-lg px-3.5 py-1.5 sm:px-5 sm:py-2 hover:shadow-[0_4px_16px_rgba(255,107,107,0.4)] transition-all duration-200"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* SECTION 2 — Hero */}
      <section
        ref={heroRef}
        className="relative min-h-screen pt-[68px] flex flex-col justify-between overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #162d4a 60%, #0f1f33 100%)',
        }}
      >
        {/* Decorative Grid Dots Background Texture */}
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

        {/* Main Hero Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Left Column (55% desktop, 100% mobile) */}
            <div className="w-full md:w-[55%] space-y-6 pt-10 pb-6">
              {/* Eyebrow Badge */}
              <div
                className={`inline-flex items-center space-x-2 bg-accent/15 border border-accent/30 rounded-full px-4 py-1.5 ${
                  heroInView ? 'animate-fadeIn' : 'opacity-0'
                }`}
              >
                <span className="text-accent text-xs">✦</span>
                <span className="text-accent text-xs font-medium tracking-wide">
                  AI-Powered Travel Planner
                </span>
              </div>

              {/* Headline with Wavy Underline SVG */}
              <h1
                className={`font-display font-extrabold text-white leading-[1.1] ${
                  heroInView ? 'animate-fadeInUp delay-100' : 'opacity-0'
                }`}
                style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)' }}
              >
                Plan Your{' '}
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  Dream
                  <svg
                    style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%' }}
                    height="6"
                    viewBox="0 0 200 6"
                    fill="none"
                  >
                    <path
                      d="M0,3 Q25,0 50,3 Q75,6 100,3 Q125,0 150,3 Q175,6 200,3"
                      stroke="#FF6B6B"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <br />
                Journey, City by City.
              </h1>

              {/* Subheadline */}
              <p
                className={`text-textLight text-base sm:text-lg leading-[1.7] max-w-[500px] mt-6 ${
                  heroInView ? 'animate-fadeInUp delay-200' : 'opacity-0'
                }`}
              >
                Build multi-city itineraries, assign activities to each day, track your budget live — then share it with one link.
              </p>

              {/* CTA Buttons Row */}
              <div
                className={`flex flex-wrap items-center gap-4 pt-4 ${
                  heroInView ? 'animate-fadeInUp delay-300' : 'opacity-0'
                }`}
              >
                <button
                  onClick={handlePrimaryCTA}
                  className="bg-accent hover:bg-accent-hover text-white rounded-[10px] px-7 py-3.5 font-semibold text-base shadow-accent-glow hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
                >
                  {isAuthenticated ? 'Go to Dashboard →' : 'Start Planning Free →'}
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="border-[1.5px] border-white/30 hover:bg-white/10 text-white rounded-[10px] px-7 py-3.5 font-semibold text-base transition-all duration-200"
                >
                  View a sample trip
                </button>
              </div>

              {/* Social Proof Row */}
              <div
                className={`pt-8 border-t border-white/15 flex items-center space-x-6 sm:space-x-8 ${
                  heroInView ? 'animate-fadeInUp delay-400' : 'opacity-0'
                }`}
              >
                <div>
                  <p className="font-display font-extrabold text-white text-[22px] leading-tight">2,400+</p>
                  <p className="text-[13px] text-[#94A3B8] font-medium mt-0.5">Trips Planned</p>
                </div>
                <div className="w-px h-[32px] bg-white/15" />
                <div>
                  <p className="font-display font-extrabold text-white text-[22px] leading-tight">60+</p>
                  <p className="text-[13px] text-[#94A3B8] font-medium mt-0.5">Cities Seeded</p>
                </div>
                <div className="w-px h-[32px] bg-white/15" />
                <div>
                  <p className="font-display font-extrabold text-white text-[22px] leading-tight">AI-Ranked</p>
                  <p className="text-[13px] text-[#94A3B8] font-medium mt-0.5">Recommendations</p>
                </div>
              </div>
            </div>

            {/* Right Column (45% desktop, hidden on mobile) — Tilted Photo Stack */}
            <div className="hidden md:block w-[45%] relative h-[420px] pointer-events-none">
              <div className="relative w-full h-full">
                {/* Card 1 (Back -8deg) */}
                <div
                  className="w-[200px] h-[260px] rounded-[20px] border-2 border-white/20 shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden absolute right-[80px] top-[10px] animate-float pointer-events-auto bg-slate-900 z-10"
                  style={{ '--rotate': '-8deg', animationDelay: '0s' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1499856871958-5b9357976b82?w=400&q=80"
                    alt="Paris"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80';
                    }}
                  />
                  <div className="absolute bottom-3 left-3 bg-accent text-white text-[12px] font-bold rounded-full px-2.5 py-1 shadow-md">
                    Paris
                  </div>
                </div>

                {/* Card 2 (Middle -2deg) */}
                <div
                  className="w-[200px] h-[260px] rounded-[20px] border-2 border-white/20 shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden absolute right-[40px] top-[50px] animate-float pointer-events-auto bg-slate-900 z-20"
                  style={{ '--rotate': '-2deg', animationDelay: '0.7s' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80"
                    alt="Bali"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80';
                    }}
                  />
                  <div className="absolute bottom-3 left-3 bg-accent text-white text-[12px] font-bold rounded-full px-2.5 py-1 shadow-md">
                    Bali
                  </div>
                </div>

                {/* Card 3 (Front 5deg) */}
                <div
                  className="w-[200px] h-[260px] rounded-[20px] border-2 border-white/20 shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden absolute right-[0px] top-[90px] animate-float pointer-events-auto bg-slate-900 z-30"
                  style={{ '--rotate': '5deg', animationDelay: '1.4s' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80"
                    alt="Tokyo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80';
                    }}
                  />
                  <div className="absolute bottom-3 left-3 bg-accent text-white text-[12px] font-bold rounded-full px-2.5 py-1 shadow-md">
                    Tokyo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Bouncing Chevron at Hero Bottom */}
        <div className="w-full flex justify-center pb-6 z-10">
          <svg className="w-6 h-6 text-white/40 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* SECTION 3 — Features (id="features") */}
      <section id="features" ref={featuresRef} className="bg-white py-[100px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className={`text-center max-w-[560px] mx-auto ${featuresInView ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <p className="text-accent text-[12px] font-semibold tracking-[0.12em] uppercase mb-2">
              EVERYTHING YOU NEED
            </p>
            <h2 className="font-display font-bold text-primary text-[clamp(1.8rem,3vw,2.5rem)] leading-tight">
              Travel planning, finally done right.
            </h2>
            <p className="text-textMuted text-[17px] mt-4 leading-relaxed max-w-[480px] mx-auto">
              GlobeTrotter brings your entire trip — cities, activities, budget, sharing — into one clean flow.
            </p>
          </div>

          {/* Three Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-[64px]">
            {/* Card 1 */}
            <div
              className={`bg-white border border-borderLight rounded-[20px] p-[36px_28px] text-left hover:border-accent hover:-translate-y-[6px] hover:shadow-[0_16px_40px_rgba(255,107,107,0.12)] transition-all duration-250 ${
                featuresInView ? 'animate-scaleIn delay-100' : 'opacity-0'
              }`}
            >
              <div className="w-[56px] h-[56px] rounded-full bg-[#FFF0F0] flex items-center justify-center mb-6">
                <svg className="w-[24px] h-[24px]" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-[19px] text-primary mb-2">
                Build Your Itinerary
              </h3>
              <p className="text-textMuted text-[15px] leading-[1.6]">
                Add city stops, assign activities to specific days and times, and reorder everything with a click.
              </p>
            </div>

            {/* Card 2 */}
            <div
              className={`bg-white border border-borderLight rounded-[20px] p-[36px_28px] text-left hover:border-accent hover:-translate-y-[6px] hover:shadow-[0_16px_40px_rgba(255,107,107,0.12)] transition-all duration-250 ${
                featuresInView ? 'animate-scaleIn delay-200' : 'opacity-0'
              }`}
            >
              <div className="w-[56px] h-[56px] rounded-full bg-[#FFF0F0] flex items-center justify-center mb-6">
                <svg className="w-[24px] h-[24px]" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2">
                  <line x1="12" y1="20" x2="12" y2="10" />
                  <line x1="18" y1="20" x2="18" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-[19px] text-primary mb-2">
                Live Budget Tracking
              </h3>
              <p className="text-textMuted text-[15px] leading-[1.6]">
                Every activity you add updates the total instantly. See cost breakdowns by category and by day.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className={`bg-white border border-borderLight rounded-[20px] p-[36px_28px] text-left hover:border-accent hover:-translate-y-[6px] hover:shadow-[0_16px_40px_rgba(255,107,107,0.12)] transition-all duration-250 ${
                featuresInView ? 'animate-scaleIn delay-300' : 'opacity-0'
              }`}
            >
              <div className="w-[56px] h-[56px] rounded-full bg-[#FFF0F0] flex items-center justify-center mb-6">
                <svg className="w-[24px] h-[24px]" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-[19px] text-primary mb-2">
                Share Your Adventure
              </h3>
              <p className="text-textMuted text-[15px] leading-[1.6]">
                Toggle public visibility to get a link anyone can view — or let them copy your trip into their own account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — How It Works (id="how-it-works") */}
      <section id="how-it-works" ref={howItWorksRef} className="bg-surface py-[100px] px-4 sm:px-6 lg:px-8 border-y border-borderLight">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className={`text-center max-w-[560px] mx-auto mb-16 ${howItWorksInView ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <p className="text-accent text-[12px] font-semibold tracking-[0.12em] uppercase mb-2">
              THE FLOW
            </p>
            <h2 className="font-display font-bold text-primary text-[clamp(1.8rem,3vw,2.5rem)] leading-tight">
              From idea to itinerary in minutes.
            </h2>
          </div>

          {/* Three Steps Grid */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Desktop Connector Dashed Line */}
            <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] border-t-2 border-dashed border-[#E5E7EB] z-0" />

            {/* Step 1 */}
            <div
              className={`relative z-10 bg-white rounded-[20px] p-8 border border-borderLight shadow-card ${
                howItWorksInView ? 'animate-fadeInUp delay-100' : 'opacity-0'
              }`}
            >
              <div className="font-display font-extrabold text-[72px] text-[#1E3A5F]/[0.08] leading-none select-none -mb-4">
                01
              </div>
              <h3 className="font-display font-bold text-[20px] text-primary relative z-10">
                Create Your Trip
              </h3>
              <p className="text-textMuted text-[15px] leading-[1.65] mt-3">
                Give your trip a name, set the start and end dates, and add your first city stop.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className={`relative z-10 bg-white rounded-[20px] p-8 border border-borderLight shadow-card ${
                howItWorksInView ? 'animate-fadeInUp delay-200' : 'opacity-0'
              }`}
            >
              <div className="font-display font-extrabold text-[72px] text-[#1E3A5F]/[0.08] leading-none select-none -mb-4">
                02
              </div>
              <h3 className="font-display font-bold text-[20px] text-primary relative z-10">
                Build the Itinerary
              </h3>
              <p className="text-textMuted text-[15px] leading-[1.65] mt-3">
                Search activities for each city, assign them to specific days and times, and set your estimated costs.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className={`relative z-10 bg-white rounded-[20px] p-8 border border-borderLight shadow-card ${
                howItWorksInView ? 'animate-fadeInUp delay-300' : 'opacity-0'
              }`}
            >
              <div className="font-display font-extrabold text-[72px] text-[#1E3A5F]/[0.08] leading-none select-none -mb-4">
                03
              </div>
              <h3 className="font-display font-bold text-[20px] text-primary relative z-10">
                Share or Keep Private
              </h3>
              <p className="text-textMuted text-[15px] leading-[1.65] mt-3">
                Toggle public to get a shareable link. Anyone can view your itinerary — or copy it into their own account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — AI Recommendation Callout */}
      <section
        ref={aiRef}
        className="py-[100px] px-4 sm:px-6 lg:px-8 text-white"
        style={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2A4F7C 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className={`space-y-6 ${aiInView ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <div className="inline-flex items-center space-x-2 bg-accent/15 border border-accent/30 rounded-full px-4 py-1.5">
              <span className="text-accent text-xs">✦</span>
              <span className="text-accent text-xs font-medium tracking-wide">AI-POWERED</span>
            </div>

            <h2 className="font-display font-bold text-[36px] text-white leading-tight">
              Get destination ideas tailored to you.
            </h2>

            <p className="text-textLight text-[16px] leading-[1.7] max-w-lg">
              Our recommendation engine uses semantic similarity to match cities and activities to your trip's vibe — not just popularity.
            </p>

            <div>
              <button
                onClick={handlePrimaryCTA}
                className="bg-accent hover:bg-accent-hover text-white font-semibold text-sm rounded-[10px] px-6 py-3.5 shadow-accent-glow hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
              >
                Try it on your trip →
              </button>
            </div>
          </div>

          {/* Right Column — Mock Recommendation Card */}
          <div
            className={`bg-white/10 border border-white/15 rounded-[20px] p-6 backdrop-blur-md shadow-2xl space-y-4 ${
              aiInView ? 'animate-scaleIn delay-200' : 'opacity-0'
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-white text-[14px] font-semibold">✦ Recommended for You</span>
              <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                AI
              </span>
            </div>

            {/* Row 1 */}
            <div className="flex items-center justify-between gap-3 py-2 border-b border-white/10">
              <img
                src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=200&q=80"
                alt="Santorini"
                className="w-[48px] h-[48px] rounded-[10px] object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-[15px] truncate">Santorini</p>
                <p className="text-[#94A3B8] text-[13px]">Greece</p>
                <p className="text-accent italic text-[12px]">Matches: beaches, scenery</p>
              </div>
              <div className="w-16 bg-white/20 h-[4px] rounded-full overflow-hidden shrink-0">
                <div className="bg-accent h-full w-[92%] rounded-full" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex items-center justify-between gap-3 py-2 border-b border-white/10">
              <img
                src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&q=80"
                alt="Kyoto"
                className="w-[48px] h-[48px] rounded-[10px] object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-[15px] truncate">Kyoto</p>
                <p className="text-[#94A3B8] text-[13px]">Japan</p>
                <p className="text-accent italic text-[12px]">Matches: culture, shrines</p>
              </div>
              <div className="w-16 bg-white/20 h-[4px] rounded-full overflow-hidden shrink-0">
                <div className="bg-accent h-full w-[78%] rounded-full" />
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex items-center justify-between gap-3 py-2">
              <img
                src="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=200&q=80"
                alt="Lisbon"
                className="w-[48px] h-[48px] rounded-[10px] object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-[15px] truncate">Lisbon</p>
                <p className="text-[#94A3B8] text-[13px]">Portugal</p>
                <p className="text-accent italic text-[12px]">Matches: food, historic rail</p>
              </div>
              <div className="w-16 bg-white/20 h-[4px] rounded-full overflow-hidden shrink-0">
                <div className="bg-accent h-full w-[65%] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — Final CTA Banner */}
      <section ref={ctaRef} className="relative bg-accent py-[80px] px-4 sm:px-6 lg:px-8 overflow-hidden text-white">
        {/* Tiled SVG Plus Crosshairs Pattern Background */}
        <div className="absolute inset-0 opacity-12 pointer-events-none">
          <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="crosshair-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 15 v10 M15 20 h10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#crosshair-pattern)" />
          </svg>
        </div>

        <div className={`relative z-10 max-w-4xl mx-auto text-center space-y-6 ${ctaInView ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <h2 className="font-display font-bold text-white text-[clamp(1.8rem,3.5vw,2.8rem)] leading-tight">
            Ready to plan your next adventure?
          </h2>
          <p className="text-white/85 text-[17px] max-w-xl mx-auto">
            Join thousands of travelers building smarter, better-planned trips.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handlePrimaryCTA}
              className="bg-white text-primary hover:bg-slate-100 font-bold text-base rounded-[10px] px-8 py-[14px] shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-white/50 hover:bg-white/12 text-white font-bold text-base rounded-[10px] px-8 py-[14px] transition-all duration-200"
              >
                Log in instead
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 7 — Footer */}
      <footer className="bg-[#1A1A2E] text-white py-[60px] pb-[40px] px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-start gap-10">
            {/* Left: Logo & Tagline */}
            <div>
              <Link to="/" className="flex items-center space-x-2.5">
                <div className="w-[34px] h-[34px] rounded-full bg-accent flex items-center justify-center">
                  <svg className="w-[20px] h-[20px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z" />
                  </svg>
                </div>
                <span className="font-display font-bold text-[20px] tracking-tight text-white">
                  Globe<span className="text-accent">Trotter</span>
                </span>
              </Link>
              <p className="text-[#6B7280] text-[14px] mt-2 font-medium">
                Your journey, beautifully planned.
              </p>
            </div>

            {/* Center: Product & Account Columns */}
            <div className="flex flex-wrap gap-12 sm:gap-16">
              <div>
                <h4 className="text-white text-[13px] font-semibold tracking-[0.08em] uppercase mb-4">
                  Product
                </h4>
                <ul className="space-y-2 text-[14px] text-[#9CA3AF]">
                  <li>
                    <Link to="/dashboard" className="hover:text-white transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/trips" className="hover:text-white transition-colors">
                      My Trips
                    </Link>
                  </li>
                  <li>
                    <Link to="/trips/new" className="hover:text-white transition-colors">
                      Plan a Trip
                    </Link>
                  </li>
                  <li>
                    <Link to="/public/trips/summer-euro-expedition-2026" className="hover:text-white transition-colors">
                      Public Trips
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white text-[13px] font-semibold tracking-[0.08em] uppercase mb-4">
                  Account
                </h4>
                <ul className="space-y-2 text-[14px] text-[#9CA3AF]">
                  <li>
                    <Link to="/signup" className="hover:text-white transition-colors">
                      Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="hover:text-white transition-colors">
                      Log In
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="hover:text-white transition-colors">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="hover:text-white transition-colors">
                      Settings
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Hackathon Tag */}
            <div className="text-[#6B7280] text-[13px] md:text-right">
              Built for the Odoo × LDCE Hackathon
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="border-t border-white/[0.06] mt-[48px] pt-[24px] flex items-center justify-between text-[13px] text-[#6B7280]">
            <p>© 2026 GlobeTrotter. All rights reserved.</p>
            <span className="text-accent">✦</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
