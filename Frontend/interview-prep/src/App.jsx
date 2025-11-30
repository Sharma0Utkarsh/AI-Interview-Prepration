import React from "react";
    import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
    import { Toaster } from "react-hot-toast";
    
    import Login from "./pages/Auth/Login";
    import SignUp from "./pages/Auth/SignUp";
    import LandingPage from "./pages/LandingPage";
    import Dashboard from "./pages/Home/Dashboard";
    import InterviewPrep from "./pages/InterviewPrep/InterviewPrep";
    import UserProvider from "./context/userContext";
    
    // 1. (NEW) Import the new page
    import PracticeRoom from "./pages/PracticeRoom/PracticeRoom"; 
    
    
    const App = ()=>{
      return(
        <UserProvider>
    
      <div >
    
           <Router>
             <Routes>
               {/*Default Route*/}
               <Route path="/" element={<LandingPage />} />
               <Route path="/login" element={<Login />} />
               <Route path="/signup" element={<SignUp />} />
               <Route path="/dashboard" element={<Dashboard />} />
               <Route path="/interview-prep/:sessionId" element={<InterviewPrep />} />
               {/* 2. (NEW) Add the new route */}
               <Route path="/practice-room/:sessionId" element={<PracticeRoom />} />
             </Routes>
        </Router>
    
    
        <Toaster
        toastOptions={{
          className: "",
          style:{
            fontSize: "13px"
          },
        }}
        />
      </div>
      </UserProvider>
      )
    }
    
    export default App