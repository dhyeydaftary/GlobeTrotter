import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInView } from '../hooks/useInView';
import { Sparkles, MapPin, DollarSign, Share2, Compass } from 'lucide-react';
import {
  HERO_PARIS,
  HERO_BALI,
  HERO_TOKYO,
  TRIP_CARD_FALLBACK,
  LANDING_SANTORINI,
  LANDING_KYOTO,
  LANDING_LISBON,
} from '../constants/images';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
    <div className="min-h-screen bg-surface font-body text-text-main selection:bg-accent-light selection:text-accent overflow-x-hidden">
      {/* 1. Hero Section (Dark Indigo Theme) */}
      <section
        ref={heroRef}
        className="relative pt-16 flex flex-col overflow-hidden bg-gradient-to-br from-[#1A1A2E] via-[#2D2A5C] to-[#14141F]"
      >
        {/* Ambient Subtle Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

        {/* Dot Grid Pattern */}
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
            <div className="w-full lg:w-[56%] space-y-5 sm:space-y-6">
              {/* Badge */}
              <div
                className={`inline-flex items-center space-x-2 bg-accent/20 border border-accent/40 rounded-full px-4 py-1.5 backdrop-blur-sm ${
                  heroInView ? 'animate-fadeIn' : 'opacity-0'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="text-accent-light text-xs font-semibold tracking-wide uppercase">
                  AI-Powered Travel Planner
                </span>
              </div>

              {/* Display Headline */}
              <h1
                className={`font-display text-display-lg font-extrabold text-white leading-tight ${
                  heroInView ? 'animate-fadeInUp delay-100' : 'opacity-0'
                }`}
                style={{ fontSize: 'clamp(2.2rem, 4.8vw, 3.8rem)' }}
              >
                Plan Your{' '}
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  Dream
                  <svg
                    style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%' }}
                    height="6"
                    viewBox="0 0 200 6"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0,3 Q25,0 50,3 Q75,6 100,3 Q125,0 150,3 Q175,6 200,3"
                      stroke="#5B5BF6"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <br />
                Journey, City by City.
              </h1>

              <p
                className={`text-text-light text-base sm:text-lg leading-relaxed max-w-[520px] ${
                  heroInView ? 'animate-fadeInUp delay-200' : 'opacity-0'
                }`}
              >
                Build multi-city itineraries, assign activities to each day, track your budget live — then share it with one clean link.
              </p>

              <div
                className={`flex flex-wrap items-center gap-3 pt-2 ${
                  heroInView ? 'animate-fadeInUp delay-300' : 'opacity-0'
                }`}
              >
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
              </div>

              {/* Stats Bar */}
              <div
                className={`pt-6 border-t border-white/15 flex flex-wrap items-center gap-x-8 gap-y-3 ${
                  heroInView ? 'animate-fadeInUp delay-400' : 'opacity-0'
                }`}
              >
                <div>
                  <p className="font-display font-extrabold text-white text-2xl leading-tight">2,400+</p>
                  <p className="text-xs text-text-light font-medium mt-0.5">Trips Planned</p>
                </div>
                <div className="w-px h-8 bg-white/15 hidden sm:block" />
                <div>
                  <p className="font-display font-extrabold text-white text-2xl leading-tight">60+</p>
                  <p className="text-xs text-text-light font-medium mt-0.5">Cities Seeded</p>
                </div>
                <div className="w-px h-8 bg-white/15 hidden sm:block" />
                <div>
                  <p className="font-display font-extrabold text-white text-2xl leading-tight">AI-Ranked</p>
                  <p className="text-xs text-text-light font-medium mt-0.5">Semantic Ideas</p>
                </div>
              </div>
            </div>

            {/* Desktop Visual Photography Stack */}
            <div className="hidden lg:block w-[44%] relative h-[320px] pointer-events-none">
              <div className="relative w-full h-full">
                <div
                  className="w-[175px] h-[230px] rounded-card border-2 border-white/20 shadow-2xl overflow-hidden absolute right-[88px] top-[10px] pointer-events-auto bg-slate-900 z-10 hover:scale-105 transition-transform duration-300"
                  style={{ transform: 'rotate(-8deg)' }}
                >
                  <img
                    src={HERO_PARIS}
                    alt="Paris"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = TRIP_CARD_FALLBACK;
                    }}
                  />
                  <div className="absolute bottom-3 left-3 bg-accent text-white text-xs font-bold rounded-full px-2.5 py-0.5 shadow-md">
                    Paris
                  </div>
                </div>

                <div
                  className="w-[175px] h-[230px] rounded-card border-2 border-white/20 shadow-2xl overflow-hidden absolute right-[44px] top-[44px] pointer-events-auto bg-slate-900 z-20 hover:scale-105 transition-transform duration-300"
                  style={{ transform: 'rotate(-2deg)' }}
                >
                  <img
                    src={HERO_BALI}
                    alt="Bali"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = TRIP_CARD_FALLBACK;
                    }}
                  />
                  <div className="absolute bottom-3 left-3 bg-accent text-white text-xs font-bold rounded-full px-2.5 py-0.5 shadow-md">
                    Bali
                  </div>
                </div>

                <div
                  className="w-[175px] h-[230px] rounded-card border-2 border-white/20 shadow-2xl overflow-hidden absolute right-[0px] top-[76px] pointer-events-auto bg-slate-900 z-30 hover:scale-105 transition-transform duration-300"
                  style={{ transform: 'rotate(5deg)' }}
                >
                  <img
                    src={HERO_TOKYO}
                    alt="Tokyo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = TRIP_CARD_FALLBACK;
                    }}
                  />
                  <div className="absolute bottom-3 left-3 bg-accent text-white text-xs font-bold rounded-full px-2.5 py-0.5 shadow-md">
                    Tokyo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Section (Light Surface) */}
      <section id="features" ref={featuresRef} className="bg-surface-card py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center max-w-[580px] mx-auto ${featuresInView ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <p className="text-accent text-xs font-bold tracking-widest uppercase mb-2">
              EVERYTHING YOU NEED
            </p>
            <h2 className="text-display-lg font-extrabold text-text-main text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight">
              Travel planning, finally done right.
            </h2>
            <p className="text-text-muted text-base sm:text-lg mt-3.5 leading-relaxed">
              GlobeTrotter brings your entire trip — cities, activities, budget, sharing — into one unified, elegant workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14 sm:mt-18">
            {[
              {
                title: 'Build Your Itinerary',
                body: 'Add city stops, assign activities to specific days and times, and reorder everything effortlessly.',
                delay: 'delay-100',
                icon: <MapPin className="w-6 h-6 text-accent" />,
              },
              {
                title: 'Live Budget Tracking',
                body: 'Every activity you add updates the total instantly. See cost breakdowns by category and by day.',
                delay: 'delay-200',
                icon: <DollarSign className="w-6 h-6 text-accent" />,
              },
              {
                title: 'Share Your Adventure',
                body: 'Toggle public visibility to get a link anyone can view — or let them copy your trip into their own account.',
                delay: 'delay-300',
                icon: <Share2 className="w-6 h-6 text-accent" />,
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`gt-card p-8 text-left hover:border-accent/40 ${
                  featuresInView ? `animate-scaleIn ${card.delay}` : 'opacity-0'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center mb-6 shadow-sm">
                  {card.icon}
                </div>
                <h3 className="text-display-md font-bold text-lg text-text-main mb-2">{card.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How It Works Flow Section */}
      <section id="how-it-works" ref={howItWorksRef} className="bg-surface py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-y border-border-light">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center max-w-[580px] mx-auto mb-16 ${howItWorksInView ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <p className="text-accent text-xs font-bold tracking-widest uppercase mb-2">THE FLOW</p>
            <h2 className="text-display-lg font-extrabold text-text-main text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight">
              From idea to itinerary in minutes.
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] border-t-2 border-dashed border-border-light z-0" />
            {[
              {
                n: '01',
                title: 'Create Your Trip',
                body: 'Give your trip a name, set your travel dates, and add your first city destination.',
                delay: 'delay-100',
              },
              {
                n: '02',
                title: 'Build the Itinerary',
                body: 'Search activities for each city, assign them to specific dates and times, and set your estimated costs.',
                delay: 'delay-200',
              },
              {
                n: '03',
                title: 'Share or Keep Private',
                body: 'Toggle public visibility to generate a shareable link that fellow travelers can view and copy.',
                delay: 'delay-300',
              },
            ].map((step) => (
              <div
                key={step.n}
                className={`relative z-10 gt-card p-8 sm:p-9 ${howItWorksInView ? `animate-fadeInUp ${step.delay}` : 'opacity-0'}`}
              >
                <div className="font-display font-extrabold text-[64px] text-accent/10 leading-none select-none -mb-3">
                  {step.n}
                </div>
                <h3 className="text-display-md font-bold text-xl text-text-main relative z-10">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed mt-2.5">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AI Recommendations Highlight (Indigo Dark Gradient) */}
      <section
        ref={aiRef}
        className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 text-white bg-gradient-to-br from-[#1A1A2E] via-[#2D2A5C] to-[#14141F] relative overflow-hidden"
      >
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 items-center relative z-10">
          <div className={`space-y-6 ${aiInView ? 'animate-fadeInUp' : 'opacity-0'}`}>
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
          </div>

          <div
            className={`gt-glass-dark border border-white/15 rounded-card p-6 sm:p-7 shadow-glass space-y-4 ${
              aiInView ? 'animate-scaleIn delay-200' : 'opacity-0'
            }`}
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
              <div
                key={row.name}
                className={`flex items-center justify-between gap-3.5 py-2.5 ${i < 2 ? 'border-b border-white/10' : ''}`}
              >
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
          </div>
        </div>
      </section>

      {/* 5. Bottom CTA Banner */}
      <section ref={ctaRef} className="relative bg-accent py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden text-white">
        <div className={`relative z-10 max-w-4xl mx-auto text-center space-y-6 ${ctaInView ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <h2 className="text-display-lg font-extrabold text-white text-[clamp(1.9rem,3.5vw,2.8rem)] leading-tight">
            Ready to plan your next adventure?
          </h2>
          <p className="text-white/90 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Join thousands of travelers building smarter, beautifully organized multi-city trips.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handlePrimaryCTA}
              className="bg-white text-text-main hover:bg-surface-raised font-bold text-sm sm:text-base rounded-btn px-8 py-3.5 shadow-lg active:scale-[0.97] transition-all duration-150"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-white/50 hover:bg-white/10 text-white font-bold text-sm sm:text-base rounded-btn px-8 py-3.5 active:scale-[0.97] transition-all duration-150"
              >
                Log in instead
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-[#14141F] text-white py-14 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-wrap justify-between items-start gap-10">
            <div>
              <Link to="/" className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-btn-accent">
                  <Compass className="w-4 h-4 text-white" />
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
                  <li>
                    <Link to="/public/trips/summer-euro-expedition-2026" className="hover:text-white transition-colors">
                      Sample Public Trip
                    </Link>
                  </li>
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
