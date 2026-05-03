import React, { useEffect, useState } from "react";
import { LuPlus, LuSearch, LuLayoutGrid, LuInbox } from "react-icons/lu";
import { CARD_BG } from "../../utils/data";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import SummaryCard from "../../components/Cards/SummaryCard";
import CreateSessionForm from "./CreateSessionForm";
import Modal from "../../components/Modal";
import DeleteAlertContent from "../../components/Loader/DeleteAlertContent";
import AIResponsePreview from "../InterviewPrep/components/AIResponsePreview";

const Dashboard = () => {
  // --- STATE MANAGEMENT ---
  const [openCreateModel, setOpenCreateModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Track search input
  const [OpenDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  // --- API CALLS ---
  const fetchAllSessions = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(response.data || []);
    } catch (error) {
      console.error("Error fetching session data:", error);
      toast.error("Failed to load sessions");
    }
  };

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData?._id));
      toast.success("Session Deleted Successfully");
      setOpenDeleteAlert({ open: false, data: null });
      fetchAllSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    fetchAllSessions();
  }, []);

  // --- SEARCH LOGIC ---
  // We filter the 'sessions' array based on the 'searchQuery'
  const filteredSessions = sessions.filter((session) => {
    const role = session?.role?.toLowerCase() || "";
    const topics = session?.topicsToFocus?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    
    return role.includes(query) || topics.includes(query);
  });

  return (
    <DashboardLayout>
      {/* 1. HEADER & SEARCH BAR */}
      <div className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Interview Dashboard
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Welcome back! Manage your AI prep sessions.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64 group">
               <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
               <input 
                type="text" 
                placeholder="Search by role or topic..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // UPDATES SEARCH STATE
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
               />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto pt-8 pb-24 px-6">
        {/* 2. RESULTS GRID */}
        {filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredSessions.map((data, index) => (
              <div
                key={data?._id}
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
              >
                <SummaryCard
                  colors={CARD_BG[index % CARD_BG.length]}
                  role={data?.role || ""}
                  topicsToFocus={data?.topicsToFocus || ""}
                  experience={data?.experience || "-"}
                  questions={data?.questions?.length || "-"}
                  description={data?.description || ""}
                  lastUpdated={
                    data?.updatedAt
                      ? moment(data.updatedAt).format("Do MMM YYYY")
                      : ""
                  }
                  onDelete={() => setOpenDeleteAlert({ open: true, data })}
                  sessionId={data?._id}
                />

                {/* Question Accordions */}
                <div className="mt-6 space-y-3">
                  {data?.questions?.map((q, i) => (
                    <details
                      key={i}
                      className="group/item border border-slate-100 rounded-xl bg-slate-50/50 overflow-hidden open:bg-white open:ring-1 open:ring-blue-100 transition-all duration-200"
                    >
                      <summary className="cursor-pointer list-none p-4 flex justify-between items-center font-semibold text-slate-700 text-sm">
                        <span><span className="text-blue-500 mr-2">Q{i + 1}.</span> {q.question}</span>
                        <span className="text-slate-400 group-open/item:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="px-4 pb-4 pt-0 border-t border-slate-50">
                        <div className="mt-3">
                          <AIResponsePreview content={q.answer} />
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 3. EMPTY STATE (Changes based on Search vs. No Data) */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
              {searchQuery ? (
                <LuSearch className="text-3xl text-slate-300" />
              ) : (
                <LuInbox className="text-3xl text-blue-500" />
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {searchQuery ? "No matching results" : "No Sessions Found"}
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              {searchQuery 
                ? `We couldn't find anything for "${searchQuery}". Try a different term.` 
                : "Your dashboard is looking a bit empty. Create a session to get started!"}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => setOpenCreateModal(true)}
                className="mt-6 text-blue-600 font-bold hover:text-blue-700 transition-colors"
              >
                + Create your first session
              </button>
            )}
          </div>
        )}

        {/* 4. FLOATING ACTION BUTTON */}
        <button
          className="fixed bottom-10 right-10 flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl shadow-blue-900/20 hover:bg-blue-600 hover:-translate-y-1 active:scale-95 transition-all duration-300 z-50 group"
          onClick={() => setOpenCreateModal(true)}
        >
          <LuPlus className="text-xl group-hover:rotate-90 transition-transform duration-300" />
          <span className="tracking-wide">New Session</span>
        </button>
      </div>

      {/* MODALS */}
      <Modal isOpen={openCreateModel} onClose={() => setOpenCreateModal(false)} hideHeader>
        <CreateSessionForm onRefresh={fetchAllSessions} /> 
      </Modal>

      <Modal isOpen={OpenDeleteAlert?.open} onClose={() => setOpenDeleteAlert({ open: false, data: null })} title="Delete Session">
        <div className="sm:w-[400px] p-2">
          <DeleteAlertContent
            content="This action is permanent and will delete all AI insights for this session."
            onDelete={() => deleteSession(OpenDeleteAlert.data)}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;