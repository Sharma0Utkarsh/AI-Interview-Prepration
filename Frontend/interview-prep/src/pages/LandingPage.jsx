import React, { useState } from 'react';
    import { useNavigate } from "react-router-dom";
    import  { useContext } from 'react';
    
    // Using a placeholder for the hero image
    const HERO_IMG = "https://placehold.co/1200x600/f0f0f0/333?text=AI+Interview+App+Screenshot";
    import { APP_FEATURES} from "../utils/data";
    import {LuSparkles} from 'react-icons/lu';

import Modal from '../components/Modal';
import Login from "../pages/Auth/Login";
import SignUp from "../pages/Auth/SignUp";
import { UserContext } from '../context/userContext';
import ProfileInfoCard from '../components/Cards/ProfileInfoCard';

const LandingPage = ()=>{

  const {user} = useContext(UserContext);
  const navigate = useNavigate();

  const [openAuthModal,setOpenAuthModel] = useState(false);
  const [currentPage, setCurrentPage] = useState("login")

  const handleCTA = ()=>{
    if(!user){
      setOpenAuthModel(true);

    }else{
      navigate("/dashboard");
    }
  };

  return(
      <>
    <div className='w-full min-h-full bg-white '>
      <div className='w-[500px] h-[500px] bg-amber-200/20 blur-[65px] absolute'/>

      <div className='container mx-auto px-4 pt-6 pb-[200px] relative z-10'>
        {/*Header*/}

        <header className='flex justify-between items-center mb-16'>
          <div className='text-xl text-black font-bold'>
            AI Interview Prep 
          </div>
          {user ? ( 
            <ProfileInfoCard/>
          ):(<button className='bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-sm  font-semibold text-white px-7 py-2.5 rounded-full hover:bg-black hover:text-white border border-white transition-colors cursor-pointer'
          onClick={()=> setOpenAuthModel(true)}>
            Login/Sign Up
          </button>)}
        </header>

        {/* Hero Content*/ }

        <div className='flex flex-col md:flex-row items-center'>
          <div className='w-full md:w-1/2 pr-4 mb-8 md:mb-0'>
            <div className='flex items-centre justify-left mb-2'>
              <div className='flex items-centre gap-2 text-[13px] text-amber-600 font-semibold bg-amber-100 px-3 py-1 rounded-full border border-amber-300]'>
                AI Powerd
              </div>
            </div>

            <h1 className='text-5xl text-black font-medium mb-6 leading-tight'> Ace Interview with <br/>
            <span className='text-transparent bg-clip-text bg-[radial-gradient(circle,_#FF9324_0%,_#FCD760_100%)] bg-[length:200%_200%] animate-text-shine font-semibold text-5xl'>
              <LuSparkles />  AI-powered
            </span>{" "}
            Learning
            </h1>
          </div>
          <div className='w-full md:w-1/2'>
            <p className='text-[17px] text-gray-900 mr-0 md:mr-20 mb-6'>
              Get role specific questions, expand answers when you need them, dive deeper into concepts and organize everything your way.
              From prepration to mastry - your ultimate tool kit is hero.
            </p>

            <button className='bg-black text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:bg-yellow-100 hover:text-black order border-yellow-50 hover:border-yellow-300 transition-colors cursor-pointer'
            onClick={handleCTA}>Get Started
            </button>
          </div>

        </div>
      </div>

      </div>

      <div className='w-full min-h-full relative z-10 '>
      <div>
        <section className='flex items-centre justify-center -mt-36'>
          <img 
            src= {HERO_IMG}
            all="Hero Image"
            className='w-[80vw] rounded-lg'
          />
        </section>
        </div>

        <div className='w-full min-h-full bg-white mt-10'>
          <div className='container mx-auto px-4 pt-10 pb-20'>
            <section className='mt-5'>
              <h2 className='text-2xl font-medium text-centre mb-12'>
                Features That Make You Shine
              </h2>
              <div className='flex flex-col itms-centre gap-8'>
                {/* First 3 Cards*/}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8 w-full'>
                  {
                    APP_FEATURES.slice(0,3).map((feature)=>(
                      <div
                       key={feature.id}
                       className='bg-white p-6 rounded-xl shadow-xs hover:shadow-lg shadow-blue-400 transition border border-blue-400'
                      >
                        <h3 className='text-base font-semibold mb-3'>
                          {feature.title}
                        </h3>
                        <p className='text-gray-600'>{feature.discription}</p>
                        </div>
                    ))
                  }
                </div>

                {/* Remaining 2 cards*/}
                <div className='grid grid-cols md:grid-cols-2 gap-8'>
                  {APP_FEATURES.slice(3).map ((feature)=>(
                    <div key = {feature.id}
                    className='bg-white p-6 rounded-xl shadows-xs hover:shadow-lg shadow-blue-400 transition border border-blue-200'
                    >
                      <h3 className='text-base font-semibold mb-3'>
                        {feature.title}
                      </h3>
                      <p className='text-gray-600'>
                        {feature.discription}
                      </p>
                      </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

          

      </div>
      <div className='text-sm bg-gray-200 text-secondary text-center p-5 mt-5'>
            Made for learning
      </div>

      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModel(false);
          setCurrentPage("login")
          }}
          hideHeader>
          <div >
            {currentPage === "login" && (
              <Login setCurrentPage ={setCurrentPage}/>
            )}
            {currentPage === "signup" && (
              <SignUp setCurrentPage = {setCurrentPage} />
            )}
          </div>
        </Modal>
    </>    
  );
};

export default LandingPage


