import React, { useEffect, useRef, useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { LuX, LuLoader, LuChevronsLeft, LuChevronsRight, LuChevronDown, LuDownload } from 'react-icons/lu';
import { FiAlertOctagon } from 'react-icons/fi';
import { PoseLandmarker, FaceDetector, FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import AIResponsePreview from '../InterviewPrep/components/AIResponsePreview';
import jsPDF from 'jspdf';
import { UserContext } from '../../context/userContext';

// --- CORRECTED Helper Functions ---

function analyzePosture(landmarks) {
  if (!landmarks || landmarks.length === 0) {
    return { text: "No posture data", color: "text-gray-400", isWarning: false };
  }

  const pose = landmarks[0];
  
  // Key landmarks for posture analysis
  const leftShoulder = pose[11];
  const rightShoulder = pose[12];
  const nose = pose[0];
  const leftHip = pose[23];
  const rightHip = pose[24];

  const minVisibility = 0.5;

  // Check if essential landmarks are visible
  if (!leftShoulder || !rightShoulder || leftShoulder.visibility < minVisibility || rightShoulder.visibility < minVisibility) {
    return { text: "Move into frame", color: "text-yellow-400", isWarning: true };
  }

  // 1. Check shoulder levelness (sideways leaning)
  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
  if (shoulderTilt > 0.08) {
    return { text: "Straighten shoulders", color: "text-red-400", isWarning: true };
  }

  // 2. Check forward/backward lean using shoulder-hip alignment
  if (leftHip && rightHip && leftHip.visibility > minVisibility && rightHip.visibility > minVisibility) {
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const avgHipY = (leftHip.y + rightHip.y) / 2;
    
    const shoulderHipDistance = Math.abs(avgShoulderY - avgHipY);
    
    if (shoulderHipDistance < 0.15) {
      return { text: "Sit up straight", color: "text-red-400", isWarning: true };
    }
  }

  // 3. Check if facing camera properly using shoulder width
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
  if (shoulderWidth < 0.1) {
    return { text: "Face the camera", color: "text-yellow-400", isWarning: true };
  }

  // 4. Check head position relative to shoulders
  if (nose.visibility > minVisibility) {
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const headPosition = nose.y - avgShoulderY;
    
    if (headPosition > 0.2) {
      return { text: "Lift your head up", color: "text-red-400", isWarning: true };
    }
  }

  return { text: "Good posture", color: "text-green-400", isWarning: false };
}

function analyzeGaze(blendshapes, faceLandmarks) {
  if (!blendshapes || blendshapes.length === 0) {
    return { text: "No gaze data", color: "text-gray-400", isWarning: false };
  }

  const eyeLookThreshold = 0.4;
  const headYawThreshold = 0.4;
  const headPitchThreshold = 0.3;

  // Get eye direction blendshapes
  const eyeLookOutLeft = blendshapes.find(s => s.categoryName === 'eyeLookOutLeft')?.score || 0;
  const eyeLookOutRight = blendshapes.find(s => s.categoryName === 'eyeLookOutRight')?.score || 0;
  const eyeLookInLeft = blendshapes.find(s => s.categoryName === 'eyeLookInLeft')?.score || 0;
  const eyeLookInRight = blendshapes.find(s => s.categoryName === 'eyeLookInRight')?.score || 0;
  const eyeLookUpLeft = blendshapes.find(s => s.categoryName === 'eyeLookUpLeft')?.score || 0;
  const eyeLookUpRight = blendshapes.find(s => s.categoryName === 'eyeLookUpRight')?.score || 0;
  const eyeLookDownLeft = blendshapes.find(s => s.categoryName === 'eyeLookDownLeft')?.score || 0;
  const eyeLookDownRight = blendshapes.find(s => s.categoryName === 'eyeLookDownRight')?.score || 0;

  // Calculate average eye movement scores
  const avgLookLeft = (eyeLookOutLeft + eyeLookInRight) / 2;
  const avgLookRight = (eyeLookOutRight + eyeLookInLeft) / 2;
  const avgLookUp = (eyeLookUpLeft + eyeLookUpRight) / 2;
  const avgLookDown = (eyeLookDownLeft + eyeLookDownRight) / 2;

  // Check if eyes are looking away from center (screen)
  const isLookingAway_Eyes = 
    avgLookLeft > eyeLookThreshold ||
    avgLookRight > eyeLookThreshold ||
    avgLookUp > eyeLookThreshold ||
    avgLookDown > eyeLookThreshold;

  // Check head rotation
  const headYaw = blendshapes.find(s => s.categoryName === 'headYaw')?.score || 0;
  const headPitch = blendshapes.find(s => s.categoryName === 'headPitch')?.score || 0;

  const isLookingAway_Yaw = Math.abs(headYaw) > headYawThreshold;
  const isLookingAway_Pitch = Math.abs(headPitch) > headPitchThreshold;

  // Determine feedback
  if (isLookingAway_Eyes || isLookingAway_Yaw || isLookingAway_Pitch) {
    return { text: "Look at screen", color: "text-yellow-400", isWarning: true };
  }

  return { text: "Good eye contact", color: "text-green-400", isWarning: false };
}

function analyzeMultipleFaces(detections) {
  if (!detections || !Array.isArray(detections)) {
    return { text: "Checking...", color: "text-gray-400", isWarning: false };
  }
  
  if (detections.length === 0) {
    return { text: "No face detected", color: "text-yellow-400", isWarning: true };
  }
  
  if (detections.length > 1) {
    return { text: "Multiple faces detected", color: "text-red-400", isWarning: true };
  }
  
  return { text: "Single face", color: "text-green-400", isWarning: false };
}

// --- React Component ---
const GAZE_THRESHOLD = 15;        // Reduced to 0.5 seconds at 30 fps
const POSTURE_THRESHOLD = 15;     // Reduced to 0.5 seconds at 30 fps
const MULTI_FACE_THRESHOLD = 10;  // Reduced to 0.3 seconds at 30 fps
const NO_FACE_THRESHOLD = 20;     // Reduced to 0.7 seconds at 30 fps

const PracticeRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const drawingUtilsRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [feedback, setFeedback] = useState({
    posture: { text: "Initializing...", color: "text-gray-400", isWarning: false },
    gaze: { text: "Initializing...", color: "text-gray-400", isWarning: false },
    multipleFaces: { text: "Initializing...", color: "text-gray-400", isWarning: false },
  });

  // Use state for report to ensure proper updates
  const [report, setReport] = useState({
    gazeWarnings: 0,
    postureWarnings: 0,
    multiFaceWarnings: 0,
    noFaceWarnings: 0,
  });

  // Track current warning states
  const [currentWarnings, setCurrentWarnings] = useState({
    gaze: false,
    posture: false,
    multiFace: false,
    noFace: false
  });

  const trackerRef = useRef({
    gazeCount: 0,
    postureCount: 0,
    multiFaceCount: 0,
    noFaceCount: 0,
  });

  // Fetch Session Data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));
        if (response.data && response.data.session) {
          setSessionData(response.data.session);
        } else {
          setError("Could not load session data.");
        }
      } catch (err) {
        setError("Failed to fetch session. Please try again.");
        console.error(err);
      }
    };
    fetchSession();
  }, [sessionId]);

  // Initialize MediaPipe
  useEffect(() => {
    let isMounted = true;
    let frameCount = 0;
    
    const predictWebcam = () => {
      const video = videoRef.current;
      if (!isMounted || !video || video.readyState < 2 || 
          !poseLandmarkerRef.current || !faceDetectorRef.current || 
          !faceLandmarkerRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
        return;
      }

      const poseLandmarker = poseLandmarkerRef.current;
      const faceDetector = faceDetectorRef.current;
      const faceLandmarker = faceLandmarkerRef.current;
      const startTimeMs = performance.now();
      
      try {
        // Get all detection results
        const poseResults = poseLandmarker.detectForVideo(video, startTimeMs);
        const faceResults = faceDetector.detectForVideo(video, startTimeMs);
        const faceLandmarkResults = faceLandmarker.detectForVideo(video, startTimeMs);

        // Clear canvas
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Analyze Results
        const faceDetections = faceResults.detections || [];
        
        const multiFaceFeedback = analyzeMultipleFaces(faceDetections);
        const postureFeedback = analyzePosture(poseResults.landmarks);
        
        let gazeFeedback;
        if (faceLandmarkResults.faceBlendshapes && faceLandmarkResults.faceBlendshapes.length > 0) {
          const faceLandmarks = faceLandmarkResults.faceLandmarks ? faceLandmarkResults.faceLandmarks[0] : null;
          gazeFeedback = analyzeGaze(faceLandmarkResults.faceBlendshapes[0].categories, faceLandmarks);
        } else if (faceDetections.length > 0) {
          gazeFeedback = { text: "Analyzing gaze...", color: "text-gray-400", isWarning: false };
        } else {
          gazeFeedback = { text: "No face detected", color: "text-gray-400", isWarning: false };
        }

        // Draw Landmarks for Visual Feedback
        if (poseResults.landmarks && poseResults.landmarks.length > 0) {
          drawingUtilsRef.current.drawLandmarks(
            poseResults.landmarks[0], 
            { color: '#00FF00', radius: 2 }
          );
          drawingUtilsRef.current.drawConnectors(
            poseResults.landmarks[0], 
            PoseLandmarker.POSE_CONNECTIONS, 
            { color: '#00FF00', lineWidth: 2 }
          );
        }

        // Update feedback for real-time display
        setFeedback({
          posture: postureFeedback,
          gaze: gazeFeedback,
          multipleFaces: multiFaceFeedback,
        });

        // Track warnings and update counts
        frameCount++;
        
        // Update current warnings state
        const newWarnings = {
          gaze: gazeFeedback.isWarning,
          posture: postureFeedback.isWarning,
          multiFace: multiFaceFeedback.isWarning && multiFaceFeedback.color === 'text-red-400',
          noFace: multiFaceFeedback.isWarning && multiFaceFeedback.color === 'text-yellow-400'
        };

        setCurrentWarnings(newWarnings);

        // Process tracking for each metric
        const tracker = trackerRef.current;

        // Gaze Tracking
        if (gazeFeedback.isWarning) {
          tracker.gazeCount++;
          if (tracker.gazeCount >= GAZE_THRESHOLD) {
            setReport(prev => ({ 
              ...prev, 
              gazeWarnings: prev.gazeWarnings + 1 
            }));
            tracker.gazeCount = 0; // Reset counter
          }
        } else {
          tracker.gazeCount = 0;
        }

        // Posture Tracking
        if (postureFeedback.isWarning) {
          tracker.postureCount++;
          if (tracker.postureCount >= POSTURE_THRESHOLD) {
            setReport(prev => ({ 
              ...prev, 
              postureWarnings: prev.postureWarnings + 1 
            }));
            tracker.postureCount = 0;
          }
        } else {
          tracker.postureCount = 0;
        }

        // Multiple Face Tracking
        if (multiFaceFeedback.isWarning && multiFaceFeedback.color === 'text-red-400') {
          tracker.multiFaceCount++;
          if (tracker.multiFaceCount >= MULTI_FACE_THRESHOLD) {
            setReport(prev => ({ 
              ...prev, 
              multiFaceWarnings: prev.multiFaceWarnings + 1 
            }));
            tracker.multiFaceCount = 0;
          }
        } else {
          tracker.multiFaceCount = 0;
        }

        // No Face Tracking
        if (multiFaceFeedback.isWarning && multiFaceFeedback.color === 'text-yellow-400') {
          tracker.noFaceCount++;
          if (tracker.noFaceCount >= NO_FACE_THRESHOLD) {
            setReport(prev => ({ 
              ...prev, 
              noFaceWarnings: prev.noFaceWarnings + 1 
            }));
            tracker.noFaceCount = 0;
          }
        } else {
          tracker.noFaceCount = 0;
        }

        // Log warnings every 100 frames for debugging
        if (frameCount % 100 === 0) {
          console.log('Current Warnings:', {
            gaze: newWarnings.gaze,
            posture: newWarnings.posture,
            multiFace: newWarnings.multiFace,
            noFace: newWarnings.noFace,
            counts: trackerRef.current
          });
          console.log('Total Report:', report);
        }

      } catch (err) {
        console.error("Error during detection:", err);
      }
      
      animationFrameIdRef.current = requestAnimationFrame(predictWebcam);
    };

    // Webcam Start Function
    const startWebcam = async () => {
      setIsLoading(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play(); 
          videoRef.current.addEventListener("loadeddata", () => {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            predictWebcam();
          });
        }
      } catch (err) { 
        console.error("Failed to access webcam:", err);
        setError("Webcam access is required. Please enable it and refresh the page.");
      }
      setIsLoading(false);
    };

    // MediaPipe Models Initialization
    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        
        const faceDetector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
        });

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO",
          numFaces: 2
        });
        
        if (isMounted) {
          poseLandmarkerRef.current = poseLandmarker;
          faceDetectorRef.current = faceDetector;
          faceLandmarkerRef.current = faceLandmarker;
          drawingUtilsRef.current = new DrawingUtils(canvasRef.current.getContext("2d"));
          startWebcam();
        }

      } catch (err) {
        console.error("Failed to create models:", err);
        setError("Failed to load AI models. Please refresh.");
      }
    };

    initializeMediaPipe();

    // Cleanup Function
    return () => {
      isMounted = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
      if (faceDetectorRef.current) {
        faceDetectorRef.current.close();
      }
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, [sessionId]);

  // Debug effect to log report changes
  useEffect(() => {
    console.log('Report Updated:', report);
  }, [report]);

  // --- Camera/Session Stop Functions ---
  const stopCamera = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleEndSession = () => {
    stopCamera();
    navigate(`/interview-prep/${sessionId}`);
  };

  // --- Question Navigation ---
  const goToNextQuestion = () => {
    if (sessionData && currentQuestionIndex < sessionData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const currentQuestion = sessionData?.questions?.[currentQuestionIndex];

  // --- PDF Generate Function ---
  const generatePDFReport = () => {
    stopCamera();
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    const finalReport = report;

    console.log('Generating PDF with report:', finalReport);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AI Interview Report", 105, 20, { align: "center" });

    // Session Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Role: ${sessionData?.role || "N/A"}`, 20, 35);
    doc.text(`Date: ${date}`, 20, 42);
    
    // User Info
    doc.setFont("helvetica", "bold");
    doc.text("User Details", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${user?.name || "N/A"}`, 20, 62);
    doc.text(`Email: ${user?.email || "N/A"}`, 20, 69);

    // Performance Summary
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Performance Summary", 20, 85);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    const feedbackData = [
      {
        metric: "Posture Warnings",
        count: finalReport.postureWarnings,
        tip: "Poor posture detected (slouching, leaning, or not facing camera).",
      },
      {
        metric: "Eye Contact Warnings",
        count: finalReport.gazeWarnings,
        tip: "Eyes or head turned away from screen for extended period.",
      },
      {
        metric: "Multiple Face Warnings",
        count: finalReport.multiFaceWarnings,
        tip: "More than one face detected in frame.",
      },
      {
        metric: "No Face Warnings",
        count: finalReport.noFaceWarnings,
        tip: "Face not visible in frame for extended period.",
      },
    ];

    let yPos = 95;
    feedbackData.forEach(item => {
      doc.setFont("helvetica", "bold");
      doc.text(item.metric + ":", 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(String(item.count) + " time(s)", 70, yPos);
      yPos += 7;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text(`(${item.tip})`, 22, yPos);
      yPos += 10;
      doc.setFontSize(12);
    });

    // Add current warning status
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Current Status:", 20, yPos + 5);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Posture: ${feedback.posture.text}`, 22, yPos + 15);
    doc.text(`Eye Contact: ${feedback.gaze.text}`, 22, yPos + 22);
    doc.text(`Face Detection: ${feedback.multipleFaces.text}`, 22, yPos + 29);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Keep Practicing!", 105, yPos + 45, { align: "center" });

    doc.save(`AI_Interview_Report_${sessionData?.role?.replace(" ", "_") || "Session"}_${date}.pdf`);
  };

  // --- Render ---
  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900 text-white p-8">
        <FiAlertOctagon className="h-16 w-16 text-red-500" />
        <h1 className="mt-4 text-2xl font-bold">An Error Occurred</h1>
        <p className="mt-2 text-gray-400">{error}</p>
        <Link
          to={sessionId ? `/interview-prep/${sessionId}` : "/dashboard"}
          className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="flex h-16 w-full items-center justify-between px-6 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <h1 className="text-lg font-semibold">{sessionData?.role || "AI Mock Interview"}</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-300">
            Warnings: P({report.postureWarnings}) E({report.gazeWarnings}) F({report.multiFaceWarnings + report.noFaceWarnings})
          </div>
          <button
            onClick={handleEndSession}
            className="flex items-center gap-2 rounded-md bg-gray-700 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600"
          >
            <LuX className="h-4 w-4" />
            <span>End Session</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Left Side: Camera */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-2xl aspect-video bg-black rounded-lg shadow-lg">
            <video
              ref={videoRef}
              className="h-full w-full rounded-lg"
              autoPlay
              playsInline
              muted
              style={{ transform: "scaleX(-1)" }}
            ></video>
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 h-full w-full rounded-lg"
              style={{ transform: "scaleX(-1)" }}
            ></canvas>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <LuLoader className="h-12 w-12 animate-spin" />
              </div>
            )}
          </div>
          {/* Feedback Section */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="rounded-lg bg-gray-800 p-4 text-center">
              <span className="text-sm uppercase text-gray-400">Posture</span>
              <p className={`text-lg font-medium ${feedback.posture.color}`}>
                {feedback.posture.text}
              </p>
              {currentWarnings.posture && (
                <div className="text-xs text-red-400 mt-1">Warning Active</div>
              )}
            </div>
            <div className="rounded-lg bg-gray-800 p-4 text-center">
              <span className="text-sm uppercase text-gray-400">Eye Contact</span>
              <p className={`text-lg font-medium ${feedback.gaze.color}`}>
                {feedback.gaze.text}
              </p>
              {currentWarnings.gaze && (
                <div className="text-xs text-red-400 mt-1">Warning Active</div>
              )}
            </div>
            <div className="rounded-lg bg-gray-800 p-4 text-center">
              <span className="text-sm uppercase text-gray-400">Face Detection</span>
              <p className={`text-lg font-medium ${feedback.multipleFaces.color}`}>
                {feedback.multipleFaces.text}
              </p>
              {(currentWarnings.multiFace || currentWarnings.noFace) && (
                <div className="text-xs text-red-400 mt-1">Warning Active</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Question */}
        <div className="w-full md:w-1/3 bg-gray-800 p-6 border-l border-gray-700 overflow-y-auto flex flex-col">
          {!sessionData ? (
            <div className="flex items-center justify-center h-full">
              <LuLoader className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Question Content */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">
                  Question {currentQuestionIndex + 1} of {sessionData.questions.length}
                </h2>
                <div className="prose prose-invert max-w-none text-gray-300">
                  <p>{currentQuestion?.question || "Loading question..."}</p>
                </div>
                
                <details className="mt-4 group">
                  <summary className="flex items-center gap-2 text-sm font-medium text-gray-400 cursor-pointer hover:text-white">
                    <LuChevronDown className="group-open:rotate-180 transition-transform" />
                    Show Answer
                  </summary>
                  <div className="mt-2 pt-4 border-t border-gray-700">
                    <AIResponsePreview content={currentQuestion?.answer} />
                  </div>
                </details>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={goToPrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LuChevronsLeft className="h-4 w-4" />
                  <span>Prev</span>
                </button>
                
                {currentQuestionIndex === sessionData.questions.length - 1 ? (
                  <button
                    onClick={generatePDFReport}
                    className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    <LuDownload className="h-4 w-4" />
                    <span>Finish & Download Report</span>
                  </button>
                ) : (
                  <button
                    onClick={goToNextQuestion}
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <span>Next</span>
                    <LuChevronsRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeRoom;