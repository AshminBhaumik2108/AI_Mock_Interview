import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../../utils/db'; // Assuming you have a db util
import { MockInterview } from '../../../utils/schema';
import { eq } from 'drizzle-orm'; // Adjust imports as per your setup


function Interview() {
  const [error, setError] = useState(null);
  const params = useParams();
  const mockId = params?.interviewId;
  const [interviewData, setInterviewData] = useState(null);
  const navigate = useNavigate();

  // Webcam, microphone refs, and audio analyzer
  const videoRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [micLevel, setMicLevel] = useState(0); // Mic level for visual bar
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const micStreamRef = useRef(null);

  useEffect(() => {
    async function GetInterviewDetails() {
      try {
        const response = await db
          .select()
          .from(MockInterview)
          .where(eq(MockInterview.mockId, mockId));

        if (response.length === 0) {
          throw new Error('No interview details found.');
        }

        const data = response[0];
        const parsedData = JSON.parse(data.jsonMockResp);
        setInterviewData({ ...data, ...parsedData });
      } catch (error) {
        setError(error.message);
      }
    }

    const startWebcamAndMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Initialize audio context and analyzer for mic level
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 256;

        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyzerRef.current);
        micStreamRef.current = stream;

        const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);

        // Check if the microphone is receiving data
        const updateMicLevel = () => {
          if (isMicOn && analyzerRef.current) {
            analyzerRef.current.getByteFrequencyData(dataArray);

            const micVolume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            setMicLevel(micVolume / 255); // Normalize to [0, 1]
          } else {
            setMicLevel(0); // No mic input
          }
          requestAnimationFrame(updateMicLevel);
        };

        updateMicLevel();
      } catch (error) {
        console.error('Error accessing webcam or microphone:', error);
      }
    };

    // Fetch data and start webcam & mic if mockId is available
    if (mockId) {
      GetInterviewDetails();
      if (isCameraOn) {
        startWebcamAndMic();
      }
    }

    // Cleanup the webcam and mic stream on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        let tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [mockId, isMicOn, isCameraOn]);

  const toggleCamera = async () => {
    if (isCameraOn && videoRef.current && videoRef.current.srcObject) {
      let tracks = videoRef.current.srcObject.getVideoTracks();
      tracks.forEach(track => track.stop());
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    }
    setIsCameraOn(prev => !prev);
  };

  const toggleMic = () => {
    setIsMicOn((prev) => !prev);
    let audioTracks = videoRef.current?.srcObject?.getAudioTracks();
    audioTracks?.forEach(track => track.enabled = !track.enabled);
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <h1 className="text-6xl font-bold font-mono mb-6 text-center text-gray-800">Let's Get Started</h1>
      <div className="flex flex-col md:flex-row w-full max-w-screen-lg mt-8 gap-8">
        {/* Job details */}
        <div className="w-full md:w-18/4">
          <div className="bg-white p-10 rounded-lg shadow-lg border border-gray-300 mb-10">
            <h2 className="text-2xl font-bold font-mono mb-4 text-gray-900">Job Details</h2>
            {interviewData ? (
              <div>
                <p className="text-lg mb-4"><strong className="text-gray-700">Job Description:</strong> {interviewData.jobDesc}</p>
                <p className="text-lg mb-4"><strong className="text-gray-700">Job Experience:</strong> {interviewData.jobExperience} years</p>
                <p className="text-lg mb-4"><strong className="text-gray-700">Job Position:</strong> {interviewData.jobPosition}</p>
              </div>
            ) : (
              <p>Loading details...</p>
            )}
          </div>
        </div>
        {/* Webcam feed and mic tester */}
        <div className="w-full md:w-2/3 flex flex-col items-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full rounded-lg shadow-lg border-4 border-gray-300 mb-4"
          ></video>
          {/* Microphone tester */}
          <div className="w-full h-6 bg-gray-300 rounded-full relative">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-300"
              style={{ width: `${micLevel * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-row mt-8 space-x-4">
        <button 
          className={`px-10 py-3 ${isCameraOn ? 'bg-black' : 'bg-red-600'} text-white text-lg font-bold font-mono rounded-lg shadow-md hover:bg-gray-800 transition-all`}
          onClick={toggleCamera}
        >
          {isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        </button>
        <button 
          className={`px-10 py-3 ${isMicOn ? 'bg-black' : 'bg-red-600'} text-white text-lg font-bold font-mono rounded-lg shadow-md hover:bg-gray-800 transition-all`}
          onClick={toggleMic}
        >
          {isMicOn ? 'Turn Mic Off' : 'Turn Mic On'}
        </button>
        <button 
          className="px-10 py-3 bg-black text-white text-lg font-bold font-mono rounded-lg shadow-md hover:bg-gray-800 transition-all"
          onClick={() => {
            navigate(`/interview/${mockId}/session`); // Use dynamic mockId in the URL
          }}
        >
          Start Interview
        </button>
      </div>
    </div>
  );
}

export default Interview;
