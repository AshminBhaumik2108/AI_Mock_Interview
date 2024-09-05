import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../utils/db';
import { MockInterview } from '../../../utils/schema';
import { eq } from 'drizzle-orm';

function Interview() {
  const [error, setError] = useState(null);
  const params = useParams();
  const mockId = params?.interviewId;
  const [interviewData, setInterviewData] = useState(null);

  // Webcam ref to handle video stream
  const videoRef = useRef(null);

  useEffect(() => {
    async function GetInterviewDetails() {
      try {
        const response = await db
          .select()
          .from(MockInterview)
          .where(eq(MockInterview.mockId, mockId)); // Fetch details based on mockId

        if (response.length === 0) {
          throw new Error('No interview details found.');
        }

        const data = response[0];
        // Parse JSON data from jsonMockResp
        const parsedData = JSON.parse(data.jsonMockResp);
        setInterviewData({ ...data, ...parsedData });
      } catch (error) {
        setError(error.message);
      }
    }

    // Start webcam stream
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    if (mockId) {
      GetInterviewDetails();
      startWebcam();
    }

    // Cleanup the webcam stream on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        let tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [mockId]);

  return (
    <div className="flex flex-col items-center mt-6">
      <h1 className="text-4xl font-bold font-mono mb-6 text-center text-gray-800">Let's Get Started</h1>
      <div className="flex flex-col md:flex-row w-full max-w-screen-lg mt-8 gap-8">
        {/* Job details */}
        <div className="w-full md:w-3/4">
          <div className="bg-white p-10 rounded-lg shadow-lg border border-gray-300 mb-6">
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
        {/* Webcam feed */}
        <div className="w-full md:w-1/3">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full rounded-lg shadow-lg border-4 border-gray-300"
          ></video>
        </div>
      </div>
      {/* Start Interview Button */}
      <div className="mt-8">
        <button 
          className="px-9 py-3 bg-black text-white text-lg font-bold font-mono rounded-lg shadow-md hover:bg-gray-800 transition-all"
        >
          Start Interview
        </button>
      </div>
    </div>
  );
}

export default Interview;
