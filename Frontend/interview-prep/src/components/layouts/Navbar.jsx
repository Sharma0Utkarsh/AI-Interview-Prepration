import React from 'react';
import ProfileInfoCard from '../Cards/ProfileInfoCard';
import { Link, useLocation } from "react-router-dom";
import { LuLayoutDashboard, LuZap } from "react-icons/lu"; // Aesthetic icons

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className='sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          
          {/* Left Side: Logo & Brand */}
          <div className='flex items-center gap-8'>
            <Link 
              to="/dashboard" 
              className='flex items-center gap-2 group transition-transform active:scale-95'
            >
              <div className='w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform'>
                <LuZap className="text-white text-lg fill-white/20" />
              </div>
              <h2 className='text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 tracking-tight'>
                Interview<span className="text-blue-600">Prep</span>
              </h2>
            </Link>

            
          </div>

          {/* Right Side: Profile & Actions */}
          <div className='flex items-center gap-4'>
            <div className='h-8 w-[1px] bg-slate-200 hidden sm:block mx-2' /> {/* Elegant Divider */}
            <div className="hover:translate-x-1 transition-transform duration-300">
                <ProfileInfoCard />
            </div>
          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar;