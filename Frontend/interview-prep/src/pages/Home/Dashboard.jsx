import React, { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
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
import AIResponsePreview from "../InterviewPrep/components/AIResponsePreview"; // ✅ Import

const Dashboard = () => {
  const [openCreateModel, setOpenCreateModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [OpenDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  const fetchAllSessions = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData?._id));
      toast.success("Session Deleted");
      setOpenDeleteAlert({ open: false, data: null });
      fetchAllSessions();
    } catch (error) {
      console.error("error deleting session", error);
    }
  };

  useEffect(() => {
    fetchAllSessions();
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto pt-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          {sessions.map((data, index) => (
            <div
              key={data?._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-4"
            >
              {/* Session summary */}
              <SummaryCard
                colors={CARD_BG[index % CARD_BG.length]}
                role={data?.role || ""}
                topicsToFocus={data?.topicsToFocus || ""}
                experience={data?.experience || "-"}
                questions={data?.questions?.length || "-"}
                description={data?.description || ""}
                lastUpdated={
                  data?.updatedAt // Typo 'updateAt' fixed to 'updatedAt'
                    ? moment(data.updatedAt).format("Do MMM YYYY")
                    : ""
                }
                onDelete={() => setOpenDeleteAlert({ open: true, data })}
                sessionId={data?._id} // <-- 1. YEH LINE ADD KI GAYI HAI
              />

              {/* Questions with inline preview */}
              <div className="mt-4 space-y-3">
                {data?.questions?.map((q, i) => (
                  <details
                    key={i}
                    className="border rounded-md p-3 bg-gray-50 open:bg-white open:shadow"
                  >
                    <summary className="cursor-pointer font-medium text-gray-800">
                      {q.question}
                    </summary>
                    <div className="mt-2">
                      <AIResponsePreview content={q.answer} />
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Add button */}
        <button
          className="h-12 flex items-center justify-center gap-3 bg-gradient-to-r from-[#2d98f0] to-[#0f82ed] text-sm font-semibold text-white px-7 rounded-full hover:bg-black hover:text-white transition-colors cursor-pointer hover:shadow-2xl hover:shadow-blue-500 fixed bottom-10 right-10"
          onClick={() => setOpenCreateModal(true)}
        >
          <LuPlus className="text-2xl text-white" />
          Add New
        </button>
      </div>

      {/* Create Session Modal */}
      <Modal
        isOpen={openCreateModel}
        onClose={() => setOpenCreateModal(false)}
        hideHeader
      >
        <CreateSessionForm />
      </Modal>

      {/* Delete Session Modal */}
      <Modal
        isOpen={OpenDeleteAlert?.open}
        onClose={() => setOpenDeleteAlert({ open: false, data: null })}
        title="Delete Alert"
      >
        <div className="w-[30vw]">
          <DeleteAlertContent
            content="Are you sure you want to delete this session?"
            onDelete={() => deleteSession(OpenDeleteAlert.data)}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Dashboard;