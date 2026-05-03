import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LuX, LuLoader, LuChevronsLeft, LuChevronsRight, 
  LuChevronDown, LuChevronUp, LuDownload, 
  LuVolume2, LuMic, LuMicOff, LuPlay
} from 'react-icons/lu';
import { PoseLandmarker, FaceDetector, FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import AIResponsePreview from '../InterviewPrep/components/AIResponsePreview';
import jsPDF from 'jspdf';
import { UserContext } from '../../context/userContext';

// --- HELPER FUNCTIONS ---
function analyzePosture(landmarks) {
  if (!landmarks || landmarks.length === 0) return { text: "No posture data", color: "text-gray-400", isWarning: false };
  const pose = landmarks[0];
  const leftShoulder = pose[11];
  const rightShoulder = pose[12];
  const nose = pose[0];
  const minVisibility = 0.5;

  if (!leftShoulder || !rightShoulder || leftShoulder.visibility < minVisibility || rightShoulder.visibility < minVisibility) {
    return { text: "Move into frame", color: "text-yellow-400", isWarning: true };
  }
  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
  if (shoulderTilt > 0.08) return { text: "Straighten shoulders", color: "text-red-400", isWarning: true };
  
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
  if (shoulderWidth < 0.1) return { text: "Face the camera", color: "text-yellow-400", isWarning: true };

  if (nose.visibility > minVisibility) {
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    if (nose.y - avgShoulderY > 0.2) return { text: "Lift your head up", color: "text-red-400", isWarning: true };
  }
  return { text: "Good posture", color: "text-green-400", isWarning: false };
}

function analyzeGaze(blendshapes) {
  if (!blendshapes || blendshapes.length === 0) return { text: "No gaze data", color: "text-gray-400", isWarning: false };
  const headYaw = blendshapes.find(s => s.categoryName === 'headYaw')?.score || 0;
  if (Math.abs(headYaw) > 0.4) {
    return { text: "Look at screen", color: "text-yellow-400", isWarning: true };
  }
  return { text: "Good eye contact", color: "text-green-400", isWarning: false };
}

function analyzeMultipleFaces(detections) {
  if (!detections) return { text: "Checking...", color: "text-gray-400", isWarning: false };
  if (detections.length === 0) return { text: "No face detected", color: "text-yellow-400", isWarning: true };
  if (detections.length > 1) return { text: "Multiple faces detected", color: "text-red-400", isWarning: true };
  return { text: "Single face", color: "text-green-400", isWarning: false };
}

// --- MAIN COMPONENT ---
const PracticeRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  const user = userContext ? userContext.user : {};

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const drawingUtilsRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const recognitionRef = useRef(null);
  const trackerRef = useRef({ gazeCount: 0, postureCount: 0, multiFaceCount: 0, noFaceCount: 0 });

  // State
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [captions, setCaptions] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState({
    posture: { text: "Ready", color: "text-gray-400" },
    gaze: { text: "Ready", color: "text-gray-400" },
    multipleFaces: { text: "Ready", color: "text-gray-400" },
  });
  const [report, setReport] = useState({
    gazeWarnings: 0, postureWarnings: 0, multiFaceWarnings: 0, noFaceWarnings: 0,
  });
  
  const [userAnswers, setUserAnswers] = useState({});

  // --- 1. SETUP SPEECH RECOGNITION ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (!event.results[i].isFinal) {
            interimTranscript += event.results[i][0].transcript;
          } else {
             const finalTranscript = event.results[i][0].transcript;
             setUserAnswers(prev => ({
                 ...prev,
                 [currentQuestionIndex]: (prev[currentQuestionIndex] || "") + " " + finalTranscript
             }));
          }
        }
        if (interimTranscript) {
          setCaptions(interimTranscript);
          setTimeout(() => setCaptions(""), 3000);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [currentQuestionIndex]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // --- 2. TEXT TO SPEECH ---
  const speakQuestion = useCallback((text) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    if (isListening && recognitionRef.current) recognitionRef.current.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
        setIsSpeaking(false);
        if (hasStarted && recognitionRef.current) {
            try { recognitionRef.current.start(); setIsListening(true); } catch(e) {}
        }
    };
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [isListening, hasStarted]);

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // --- 3. FETCH SESSION DATA ---
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));
        if (response.data?.session) {
          setSessionData(response.data.session);
        } else {
          setError("Could not load session data.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch session.");
      }
    };
    fetchSession();
  }, [sessionId]);

  // --- 4. START INTERVIEW HANDLER ---
  const handleStartInterview = async () => {
    setHasStarted(true);
    setIsLoading(true);

    try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
        
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`, delegate: "GPU" },
            runningMode: "VIDEO", numPoses: 1
        });
        poseLandmarkerRef.current = poseLandmarker;

        const faceDetector = await FaceDetector.createFromOptions(vision, {
            baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`, delegate: "GPU" },
            runningMode: "VIDEO"
        });
        faceDetectorRef.current = faceDetector;

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`, delegate: "GPU" },
            outputFaceBlendshapes: true, runningMode: "VIDEO", numFaces: 2
        });
        faceLandmarkerRef.current = faceLandmarker;

        if(canvasRef.current) drawingUtilsRef.current = new DrawingUtils(canvasRef.current.getContext("2d"));

        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener("loadeddata", () => {
                if (canvasRef.current && videoRef.current) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    predictWebcam();
                }
            });
        }

        if(recognitionRef.current) {
            recognitionRef.current.start();
            setIsListening(true);
        }

        if (sessionData?.questions?.[0]) {
            setTimeout(() => {
                speakQuestion(sessionData.questions[0].question);
            }, 1000);
        }

        setIsLoading(false);

    } catch (err) {
        console.error("AI Initialization Failed:", err);
        setIsLoading(false); 
        alert("Camera AI failed to load. Please refresh or check permissions.");
    }
  };

  // --- 5. AI PREDICTION LOOP ---
  const predictWebcam = () => {
      const video = videoRef.current;
      const poseLandmarker = poseLandmarkerRef.current;

      if (!video || video.readyState < 2 || !poseLandmarker) {
          animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
          return;
      }
      
      const startTimeMs = performance.now();
      
      try {
          const poseResults = poseLandmarker.detectForVideo(video, startTimeMs);
          const faceResults = faceDetectorRef.current?.detectForVideo(video, startTimeMs);
          const faceLandmarkResults = faceLandmarkerRef.current?.detectForVideo(video, startTimeMs);

          const canvas = canvasRef.current;
          if(canvas && drawingUtilsRef.current){
              const ctx = canvas.getContext("2d");
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              if (poseResults.landmarks && poseResults.landmarks.length > 0) {
                drawingUtilsRef.current.drawLandmarks(poseResults.landmarks[0], { color: '#00FF00', radius: 2 });
                drawingUtilsRef.current.drawConnectors(poseResults.landmarks[0], PoseLandmarker.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
              }
          }

          const multiFaceFeedback = analyzeMultipleFaces(faceResults?.detections || []);
          const postureFeedback = analyzePosture(poseResults.landmarks);
          let gazeFeedback = { text: "No face detected", color: "text-gray-400", isWarning: false };
          
          if (faceLandmarkResults?.faceBlendshapes?.length > 0) {
            gazeFeedback = analyzeGaze(faceLandmarkResults.faceBlendshapes[0].categories);
          }

          setFeedback({ posture: postureFeedback, gaze: gazeFeedback, multipleFaces: multiFaceFeedback });

          if (postureFeedback.isWarning) {
             trackerRef.current.postureCount++;
             if (trackerRef.current.postureCount > 20) {
                setReport(prev => ({...prev, postureWarnings: prev.postureWarnings + 1}));
                trackerRef.current.postureCount = 0;
             }
          } else trackerRef.current.postureCount = 0;

          if (gazeFeedback.isWarning) {
             trackerRef.current.gazeCount++;
             if (trackerRef.current.gazeCount > 20) {
                setReport(prev => ({...prev, gazeWarnings: prev.gazeWarnings + 1}));
                trackerRef.current.gazeCount = 0;
             }
          } else trackerRef.current.gazeCount = 0;

      } catch (e) {
          console.warn("Frame prediction dropped", e);
      }

      animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (poseLandmarkerRef.current) poseLandmarkerRef.current.close();
      if (faceDetectorRef.current) faceDetectorRef.current.close();
      if (faceLandmarkerRef.current) faceLandmarkerRef.current.close();
    };
  }, []);

  const handleNext = () => {
    stopSpeaking();
    if (sessionData && currentQuestionIndex < sessionData.questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setShowAnswer(false);
        if (hasStarted) {
             setTimeout(() => speakQuestion(sessionData.questions[nextIndex].question), 500);
        }
    }
  };

  const handlePrev = () => {
    stopSpeaking();
    if (currentQuestionIndex > 0) {
        const prevIndex = currentQuestionIndex - 1;
        setCurrentQuestionIndex(prevIndex);
        setShowAnswer(false);
        if (hasStarted) {
             setTimeout(() => speakQuestion(sessionData.questions[prevIndex].question), 500);
        }
    }
  };

  // --- HARD NAVIGATION EXIT ---
  const handleEndSession = () => {
    stopSpeaking();
    // Force a full page reload to clear AI memory/camera
    window.location.href = '/dashboard'; 
  };

  const generatePDFReport = () => {
    stopSpeaking();
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text("AI Interview Performance Report", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Candidate: ${user?.name || "Guest User"}`, 20, 40);
    doc.text(`Role: ${sessionData?.role || "Practice Session"}`, 20, 48);
    doc.text(`Date: ${date}`, 20, 56);

    doc.setDrawColor(200);
    doc.line(20, 65, 190, 65);
    
    doc.setFont("helvetica", "bold");
    doc.text("Session Statistics", 20, 75);
    doc.setFont("helvetica", "normal");
    doc.text(`Questions Attempted: ${Object.keys(userAnswers).length} / ${sessionData?.questions?.length || 0}`, 20, 85);
    doc.text(`Posture Warnings: ${report.postureWarnings}`, 20, 93);
    doc.text(`Eye Contact Warnings: ${report.gazeWarnings}`, 20, 101);

    doc.line(20, 110, 190, 110);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Question & Answer Log", 20, 120);
    
    let yPos = 130;

    sessionData?.questions?.forEach((q, index) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        const questionText = `Q${index + 1}: ${q.question}`;
        const splitQuestion = doc.splitTextToSize(questionText, 170);
        doc.text(splitQuestion, 20, yPos);
        yPos += (splitQuestion.length * 5) + 3;

        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const userAnswer = userAnswers[index] ? `Answer: ${userAnswers[index].trim()}` : "Answer: (No recording)";
        const splitAnswer = doc.splitTextToSize(userAnswer, 170);
        doc.text(splitAnswer, 20, yPos);
        yPos += (splitAnswer.length * 5) + 10;
    });

    doc.save(`Interview_Report_${date.replace(/\//g, "-")}.pdf`);
    
    // Force exit after download
    setTimeout(() => {
        window.location.href = '/dashboard';
    }, 1500);
  };

  // --- RENDER ---
  if (error) return <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-red-500">{error}</div>;

  const currentQ = sessionData?.questions?.[currentQuestionIndex];

  return (
    <div className="flex h-screen w-full flex-col bg-gray-900 text-white overflow-hidden relative">
      
      {/* START OVERLAY */}
      {!hasStarted ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm">
             <div className="w-full max-w-lg p-8 bg-gray-800 rounded-2xl shadow-2xl text-center border border-gray-700">
                <h1 className="text-3xl font-bold mb-4 text-white">Ready for your Interview?</h1>
                <p className="text-gray-400 mb-8">
                  Check your camera and microphone. We will analyze your posture and record your answers for the report.
                </p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => window.location.href='/dashboard'} className="px-6 py-3 rounded-full font-semibold bg-gray-700 hover:bg-gray-600 transition">
                      Cancel
                  </button>
                  <button 
                    onClick={handleStartInterview}
                    disabled={!sessionData}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold shadow-lg transition-transform hover:scale-105 disabled:opacity-50">
                      <LuPlay className="fill-current" /> Start Now
                  </button>
                </div>
             </div>
          </div>
      ) : null}

      {/* TOP SECTION: QUESTION */}
      <div className="flex flex-col items-center justify-center bg-gray-800 p-4 shadow-lg z-10 transition-all duration-300">
        <div className="w-full max-w-4xl flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-400">
                Question {currentQuestionIndex + 1} of {sessionData?.questions?.length || 0}
            </span>
            <div className="flex gap-2">
                <button onClick={() => isSpeaking ? stopSpeaking() : speakQuestion(currentQ?.question)} 
                   className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition">
                   {isSpeaking ? <span className="text-xs font-bold text-red-400 px-1">STOP AUDIO</span> : <LuVolume2 />}
                </button>
                <button onClick={toggleListening} 
                   className={`p-2 rounded transition flex items-center gap-2 ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-gray-700 text-gray-400'}`}>
                   {isListening ? <><LuMic /> <span className="text-xs font-bold animate-pulse">REC</span></> : <LuMicOff />}
                </button>
            </div>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-center max-w-4xl mb-2 leading-relaxed">
           {currentQ?.question || "Loading..."}
        </h1>

        <button onClick={() => setShowAnswer(!showAnswer)} className="text-gray-400 text-xs uppercase tracking-wider flex items-center gap-1 hover:text-white transition mt-2">
            {showAnswer ? "Hide Suggested Answer" : "View Suggested Answer"} {showAnswer ? <LuChevronUp/> : <LuChevronDown/>}
        </button>

        {showAnswer && (
             <div className="w-full max-w-4xl bg-gray-700/50 border border-gray-600 mt-3 p-4 rounded-lg max-h-40 overflow-y-auto">
                 <AIResponsePreview content={currentQ?.answer} />
             </div>
        )}
      </div>

      {/* MIDDLE SECTION: CAMERA */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
         <div className="relative h-full w-full max-w-5xl">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-contain" style={{transform: "scaleX(-1)"}} />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" style={{transform: "scaleX(-1)"}} />
            
            {/* Live Captions */}
            {captions && (
                <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none z-20">
                    <div className="bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-2xl text-lg font-medium border border-white/10 shadow-xl">
                        {captions}
                    </div>
                </div>
            )}
            
            {/* AI Feedback Indicators */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
                <div className={`px-3 py-1.5 rounded-lg backdrop-blur-md text-xs font-bold border ${feedback.posture.color === 'text-green-400' ? 'bg-green-900/40 border-green-500/30 text-green-400' : 'bg-red-900/60 border-red-500/50 text-red-200'}`}>
                   Posture: {feedback.posture.text}
                </div>
                <div className={`px-3 py-1.5 rounded-lg backdrop-blur-md text-xs font-bold border ${feedback.gaze.color === 'text-green-400' ? 'bg-green-900/40 border-green-500/30 text-green-400' : 'bg-red-900/60 border-red-500/50 text-red-200'}`}>
                   Eye Contact: {feedback.gaze.text}
                </div>
            </div>

            {isLoading && (
               <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white z-50">
                  <LuLoader className="animate-spin h-10 w-10 mb-4 text-blue-500"/>
                  <p className="animate-pulse">Initializing AI Models...</p>
               </div>
            )}
         </div>
      </div>

      {/* BOTTOM SECTION: CONTROLS */}
      <div className="bg-gray-800 border-t border-gray-700 p-4 flex justify-between items-center z-20">
         <button onClick={handleEndSession} className="bg-gray-700 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/50 border border-transparent text-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all">
            <LuX className="h-4 w-4" /> End Session
         </button>
         
         <div className="flex gap-4">
             <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all">
                <LuChevronsLeft className="h-4 w-4" /> Previous
             </button>
             
             {currentQuestionIndex === (sessionData?.questions?.length || 0) - 1 ? (
                 <button onClick={generatePDFReport} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-green-900/20 flex items-center gap-2 transition-all">
                    <LuDownload className="h-4 w-4" /> Finish & Download Report
                 </button>
             ) : (
                 <button onClick={handleNext} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all">
                    Next Question <LuChevronsRight className="h-4 w-4" />
                 </button>
             )}
         </div>
      </div>
    </div>
  );
};

export default PracticeRoom;