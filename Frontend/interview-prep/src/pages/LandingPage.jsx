import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";

import aiScreenshot1 from '../assets/Ai screenshot1.png';
import aiScreenshot2 from '../assets/Ai screenshot 2.png';
import { LuSparkles, LuSun, LuMoon, LuGithub, LuTwitter, LuLinkedin, LuChevronLeft, LuChevronRight, LuShieldCheck } from 'react-icons/lu';

import Modal from '../components/Modal';
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";
import { UserContext } from '../context/userContext';
import ProfileInfoCard from '../components/Cards/ProfileInfoCard';

const EXTENDED_FEATURES = [
  { id: 1, icon: "🎯", title: "Role-specific questions", description: "Get curated interview questions tailored to your target role — SWE, PM, design, data, and more. Practice exactly what hiring managers ask." },
  { id: 2, icon: "🧠", title: "AI answer expansion", description: "Stuck on an answer? Expand any question to get an AI-generated model response, key talking points, and depth cues to personalise." },
  { id: 3, icon: "📐", title: "Body posture detection", description: "Real-time webcam analysis tracks your posture, shoulder alignment, and eye contact during mock interviews — just like a real interviewer would." },
  { id: 4, icon: "🗣️", title: "Speech & filler word coach", description: "Detects filler words (um, uh, like), speaking pace, and vocal clarity. Get a confidence score after every mock session and track improvement over time." },
  { id: 5, icon: "🗂️", title: "Concept deep-dive mode", description: "Tap any topic to enter deep-dive mode — explore related concepts, watch how answers chain, and build lasting understanding, not just rote answers." },
  { id: 6, icon: "📊", title: "Progress dashboard", description: "Track your prep streak, category coverage, and improvement over time. See which topics need more practice and celebrate milestones as you grow." },
  { id: 7, icon: "🗃️", title: "Smart organisation", description: "Bookmark, tag, and group questions into custom decks. Organise by company, role, difficulty, or topic — your prep, your structure, your way." },
];

const STATS = [
  { num: "100+", label: "Mock Interviews" },
  { num: "98%",  label: "Accuracy Rate" },
  { num: "Live", label: "Speech Analysis" },
  { num: "24/7", label: "AI Availability" },
];

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [openAuthModal, setOpenAuthModel] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");
  const [dark, setDark] = useState(false);

  // --- SLIDER LOGIC ---
  const [activeIndex, setActiveIndex] = useState(0);
  const screenshots = [
    { src: aiScreenshot1, alt: "AI Interview Dashboard" },
    { src: aiScreenshot2, alt: "Analytics View" },
  ];

  const handleNext = () => {
    if (activeIndex < screenshots.length - 1) setActiveIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (activeIndex > 0) setActiveIndex(prev => prev - 1);
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") setDark(true);
  }, []);
  
  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const handleCTA = () => {
    if (!user) setOpenAuthModel(true);
    else navigate("/dashboard");
  };

  const t = dark ? darkTokens : lightTokens;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        html { scroll-behavior: smooth; }
        
        .lp-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.4s ease, color 0.4s ease;
          min-height: 100vh;
          overflow-x: hidden;
          
          
          
          
        }

        .orb { position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none; z-index: 0; opacity: 0.6; }
        .orb-1 { width: 600px; height: 600px; top: -150px; left: -10%; background: radial-gradient(circle, #3b82f6 0%, transparent 70%); animation: orbA 15s ease-in-out infinite alternate; }
        .orb-2 { width: 450px; height: 450px; top: 20%; right: -5%; background: radial-gradient(circle, #6366f1 0%, transparent 70%); animation: orbB 18s ease-in-out infinite alternate; }
        @keyframes orbA { 0% {transform: translate(0,0) scale(1)} 100% {transform: translate(100px, 50px) scale(1.2)} }
        @keyframes orbB { 0% {transform: translate(0,0) scale(1)} 100% {transform: translate(-80px, 40px) scale(0.8)} }

        .lp-nav { 
          position: sticky; top: 0; z-index: 50; 
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid ${t.border};
          background: ${dark ? 'rgba(11, 15, 25, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
          padding: 14px 0;
        }
        .lp-nav-container { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .lp-logo { font-family:'Sora',sans-serif; font-weight:800; font-size:1.4rem; display:flex; align-items:center; gap:10px; letter-spacing:-0.5px; text-decoration: none;}
        .lp-logo-dot { width:12px; height:12px; border-radius:4px; background:linear-gradient(135deg, #3b82f6, #6366f1); transform: rotate(45deg); box-shadow:0 0 15px rgba(59,130,246,0.5); }
        
        .theme-toggle {
          width:42px; height:42px; border-radius:12px; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:all 0.3s ease; border: 1px solid ${t.border}; background: ${t.surface};
        }
        .theme-toggle:hover { border-color:#3b82f6; color:#3b82f6; transform: translateY(-2px); }

        .btn-auth {
          font-family:'Sora',sans-serif; font-size:0.85rem; font-weight:600;
          padding:10px 24px; border-radius:12px; cursor:pointer;
          transition:all 0.3s ease; border: 1px solid ${t.border};
        }
        .btn-auth:hover { background: #3b82f6; color: white; border-color: #3b82f6; transform: translateY(-2px); }

        .hero { display:flex; gap:64px; align-items:center; padding: 100px 24px 100px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 10;}
        @media(max-width:850px) { .hero {flex-direction:column; gap:60px; text-align: center; padding-top: 60px;} }
        
        .badge {
          display:inline-flex; align-items:center; gap:8px;
          font-family:'Sora',sans-serif; font-size:0.75rem; font-weight:700;
          letter-spacing:0.05em; text-transform:uppercase;
          padding:8px 16px; border-radius:100px; margin-bottom:24px;
          border: 1px solid rgba(59,130,246,0.2);
          background: rgba(59,130,246,0.1); color: #3b82f6;
        }

        .hero-h1 {
          font-family:'Sora',sans-serif;
          font-size:clamp(2.8rem, 6vw, 4.2rem);
          font-weight:800; line-height:1.05; letter-spacing:-2px;
          margin-bottom: 24px;
        }
        .shine-text {
          display:inline-block;
          background:linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #2dd4bf 100%);
          background-size:200%; -webkit-background-clip:text;
          -webkit-text-fill-color:transparent; background-clip:text;
          animation:shine 5s linear infinite;
        }
        @keyframes shine { 0%{background-position:0% center} 100%{background-position:200% center} }
        .hero-desc { font-size:1.15rem; line-height:1.7; max-width:540px; margin-bottom:40px; opacity: 0.8; }

        .btn-cta {
          font-family:'Sora',sans-serif; font-size:1rem; font-weight:700;
          padding:18px 40px; border-radius:14px; cursor:pointer;
          transition:all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          display:inline-flex; align-items:center; gap:12px;
          border:none; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #FFF;
          box-shadow: 0 10px 30px rgba(59,130,246,0.4);
        }
        .btn-cta:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(59,130,246,0.5); }

        .slider-section {
          max-width: 1100px; margin: 0 auto; padding: 40px 24px 100px;
          display: flex; align-items: center; gap: 24px; position: relative; z-index: 10;
        }

        .viewport {
          flex: 1; aspect-ratio: 16 / 10; position: relative; overflow: hidden;
          border-radius: 28px; border: 1px solid ${t.border};
          background: ${t.surface}; box-shadow: 0 40px 80px -15px rgba(0, 0, 0, 0.3);
        }

        .nav-btn {
          width: 56px; height: 56px; border-radius: 16px;
          border: 1px solid ${t.border}; background: ${t.surface}; color: ${t.ink};
          display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s;
        }
        .nav-btn:hover:not(:disabled) { background: #3b82f6; color: white; border-color: #3b82f6; transform: scale(1.05); }

        .dot.active { width: 30px; border-radius: 6px; background: #3b82f6; opacity: 1; }

        .stats-strip { 
          display:flex; justify-content: center; flex-wrap: wrap; 
          border-top: 1px solid ${t.border}; border-bottom: 1px solid ${t.border}; 
          background: ${t.surface2}; padding: 40px 0;
        }
        .stat-num { font-family:'Sora',sans-serif; font-size:2.5rem; font-weight:800; background: linear-gradient(to bottom, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 4px; }

        .feat-card {
          border-radius:24px; padding:40px; border: 1px solid ${t.border}; background: ${t.cardBg};
          transition:all 0.4s ease; position: relative; overflow: hidden;
        }
        .feat-card:hover { transform:translateY(-10px); border-color: #3b82f6; box-shadow: 0 20px 40px rgba(59,130,246,0.1); }
        .feat-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:4px; background: linear-gradient(to right, #3b82f6, #6366f1); opacity:0; transition:0.3s; }
        .feat-card:hover::before { opacity:1; }

        .ui-banner {
        display:flex; justify-content: center;  background: #3b82f6; color: white; }

        .fade-up { opacity:0; transform:translateY(40px); animation:fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeUp { to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="lp-root" style={{ background: t.bg, color: t.ink }}>
        
        <div className="ui-banner">
          <LuShieldCheck size={14} /> ✦ Secure AI Interview Coaching — Free for Students ✦
        </div>

        <nav className="lp-nav">
          <div className="lp-nav-container">
            <a href="#" className="lp-logo" style={{ color: t.ink }}>
              <span className="lp-logo-dot" />
              Interview Prep AI
            </a>
            <div className="header-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button className="theme-toggle" onClick={() => setDark(d => !d)}>
                {dark ? <LuSun size={20} /> : <LuMoon size={20} />}
              </button>
              {user ? <ProfileInfoCard /> : <button className="btn-auth" style={{ color: t.ink }} onClick={() => setOpenAuthModel(true)}>Sign In</button>}
            </div>
          </div>
        </nav>

        <div style={{ position: "relative" }}>
          <div className="orb orb-1" />
          <div className="orb orb-2" />

          <div className="hero fade-up">
            <div className="hero-l">
              <div className="badge">
                <LuSparkles size={14} /> Next-Gen Interview Prep
              </div>
              <h1 className="hero-h1" style={{ color: t.ink }}>
                Master the Art of <br/>
                <span className="shine-text">Interviewing</span>
              </h1>
              <p className="hero-desc" style={{ color: t.ink2 }}>
                Elevate your career with BluePrint AI. Real-time speech analysis, dynamic role-based simulations, and professional feedback tailored for the modern job market.
              </p>
              <button className="btn-cta" onClick={handleCTA}>
                Start Journey Now <LuChevronRight size={20} />
              </button>
            </div>
            <div className="hero-r" />
          </div>
        </div>

        <div style={{ background: `linear-gradient(180deg, transparent 0%, ${t.surface2} 100%)` }}>
          <div className="slider-section fade-up">
            <button className="nav-btn" onClick={handlePrev} disabled={activeIndex === 0}>
              <LuChevronLeft size={28} />
            </button>

            <div className="viewport">
              <div className="slider-track" style={{ display: 'flex', transition: '0.7s cubic-bezier(0.23, 1, 0.32, 1)', transform: `translateX(-${activeIndex * 100}%)` }}>
                {screenshots.map((s, i) => (
                  <div className="slide" key={i} style={{ minWidth: '100%' }}>
                    <img src={s.src} alt={s.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>

            <button className="nav-btn" onClick={handleNext} disabled={activeIndex === screenshots.length - 1}>
              <LuChevronRight size={28} />
            </button>
          </div>
          
          <div className="dots" style={{ display: 'flex', justifyContent: 'center', gap: '8px', paddingBottom: '60px' }}>
            {screenshots.map((_, i) => (
              <div 
                key={i} 
                className={`dot ${activeIndex === i ? 'active' : ''}`} 
                style={{ height: '8px', background: activeIndex === i ? '#3b82f6' : t.ink, opacity: activeIndex === i ? 1 : 0.2, borderRadius: '10px', transition: '0.3s', cursor: 'pointer', width: activeIndex === i ? '24px' : '8px' }}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        </div>

        <div className="stats-strip">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item" style={{ borderRight: i === STATS.length - 1 ? 'none' : `1px solid ${t.border}`, flex: 1, textAlign: 'center', padding: '0 20px' }}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label" style={{ color: t.ink3, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <section className="feat-section" style={{ padding: '120px 24px', maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ color: '#3b82f6', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Features</p>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: '80px', letterSpacing: '-1.5px' }}>Built for Professional Success.</h2>

          <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
            {EXTENDED_FEATURES.map((f, i) => (
              <div key={f.id} className="feat-card">
                <div style={{ fontSize: '40px', marginBottom: '24px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>{f.title}</h3>
                <p style={{ opacity: 0.7, lineHeight: 1.6 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <footer style={{ background: t.footerBg, color: '#94a3b8', padding: '100px 24px 50px', borderTop: `1px solid ${t.border}` }}>
          <div className="footer-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '60px' }}>
            <div>
              <div className="lp-logo" style={{ color: 'white', marginBottom: '24px' }}>
                <span className="lp-logo-dot" /> Interview Prep AI
              </div>
              <p style={{ marginBottom: '32px' }}>The industry-leading AI interview platform designed to help students and professionals conquer their career goals.</p>
              <div className="footer-socials" style={{ display: 'flex', gap: '20px' }}>
                
                <a href="https://github.com/Sharma0Utkarsh" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration:   'none' }}><LuGithub size={24} /></a>
              </div>
            </div>
            {[ 'Resources'].map((col) => (
              <div key={col}>
                <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '24px' }}>{col}</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '12px' }}>
                  <a href="https://cloud.mongodb.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8',           textDecoration: 'none' }}>
    MongoDB Cloud
                </a>
                </li>

                <li style={{ marginBottom: '12px' }}>
                <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration:   'none' }}>
                ChatGPT
                </a>
                </li>

              <li style={{ marginBottom: '12px' }}>
              <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              Google AI Studio
              </a>
              </li>

              <li style={{ marginBottom: '12px' }}>
              <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              React Docs
              </a>
              </li>

              <li style={{ marginBottom: '12px' }}>
               <a href="https://www.postman.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>
               Postman
              </a>
              </li>
                </ul>
              </div>
            ))}

              {[ 'Developers'].map((col) => (
              <div key={col}>
                <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '24px' }}>{col}</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '12px' }}>
                    <a 
                      href="https://www.linkedin.com/in/utkarsh-sharma17/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'inherit' }}
                      >
                        <LuLinkedin size={24}/>
                    </a>
                  </li>
                  <li style={{ marginBottom: '12px' }}>
                    <a 
                      href="https://www.linkedin.com/in/ajayveer-singh153/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'inherit' }}
                      >
                        <LuLinkedin size={24} />
                    </a>
                  </li>

                     <li style={{ marginBottom: '12px' }}><a 
                      href="https://www.linkedin.com/in/4444harsh/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'inherit' }}
                      >
                        <LuLinkedin size={24} />
                    </a>
                    </li>

                     <li style={{ marginBottom: '12px' }}><a 
                      href="https://www.linkedin.com/in/abhishekawasthi151aaa/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'inherit' }}
                      >
                        <LuLinkedin size={24} />
                    </a>
                    </li>
                    <li style={{ marginBottom: '12px' }}><a 
                      href="https://www.linkedin.com/in/pragyadeep-singh-1816b926b/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'inherit' }}
                      >
                        <LuLinkedin size={24} />
                    </a>
                    </li>
                </ul>
              </div>
            ))}

          </div>
        </footer>

        <Modal isOpen={openAuthModal} onClose={() => { setOpenAuthModel(false); setCurrentPage("login"); }} hideHeader>
          <div style={{ padding: '20px' }}>
            {currentPage === "login" && <Login setCurrentPage={setCurrentPage} />}
            {currentPage === "signup" && <SignUp setCurrentPage={setCurrentPage} />}
          </div>
        </Modal>
      </div>
    </>
  );
};

const lightTokens = {
  bg: "#FFFFFF", surface: "#F8FAFC", surface2: "#F1F5F9", cardBg: "#FFFFFF",
  ink: "#0F172A", ink2: "#475569", ink3: "#64748B", border: "#E2E8F0",
  badgeBg: "rgba(59,130,246,0.1)", badgeColor: "#3b82f6", footerBg: "#0F172A", footerColor:"#94A3B8",
};

const darkTokens = {
  bg: "#020617", surface: "#0F172A", surface2: "#1E293B", cardBg: "#0F172A",
  ink: "#F8FAFC", ink2: "#94A3B8", ink3: "#64748B", border: "#1E293B",
  badgeBg: "rgba(59,130,246,0.1)", badgeColor: "#60A5FA", footerBg: "#020617", footerColor:"#64748B",
};

export default LandingPage;