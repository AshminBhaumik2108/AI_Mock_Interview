import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../utils/db'; // Adjust as per your setup
import { MockInterview } from '../../../utils/schema';
import { eq } from 'drizzle-orm'; // Adjust as per your setup

function Session() {
  const [interviewData, setInterviewData] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const params = useParams();
  const mockId = params?.interviewId;

  // Webcam recording setup
  const videoRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  // Speech recognition setup
  const [recognizer, setRecognizer] = useState(null);

  // Function to generate feedback
  function generateFeedback(question, answer) {
    if (!question || !answer) {
      setFeedback('Please provide an answer to generate feedback.');
      return;
    }

    const expectedAnswer = question.expectedAnswer || ''; // Ensure expectedAnswer exists in your data

    if (answer.trim().toLowerCase() === expectedAnswer.trim().toLowerCase()) {
      setFeedback('Correct! Your answer matches the expected response.');
    } else {
      setFeedback('Incorrect. Please review your answer and try again.');
    }
  }

  useEffect(() => {
    async function fetchInterviewData() {
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

        // Extract and set the questions along with expected answers
        const questions = parsedData.questions.slice(0, 5); // Limit to 5 questions
        setInterviewData(questions);
        setSelectedQuestion(questions[0]); // Set initial question
      } catch (error) {
        console.error('Error fetching interview data:', error);
      }
    }

    async function startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    }

    function setupSpeechRecognition() {
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const result = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setTranscript(result);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
        };

        setRecognizer(recognition);
      } else {
        console.warn('Speech Recognition API is not supported in this browser.');
      }
    }

    fetchInterviewData();
    startWebcam();
    setupSpeechRecognition();

    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [mockId]);

  const startRecording = () => {
    if (!isRecording && videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const recorder = new MediaRecorder(stream);

      // Handle data available event
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      // Handle stop event
      recorder.onstop = () => {
        console.log('Recording stopped');
        if (selectedQuestion) {
          generateFeedback(selectedQuestion, transcript); // Generate feedback when recording stops
        }
      };

      // Handle error event
      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      if (recognizer) {
        recognizer.start();
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      if (recognizer) {
        recognizer.stop();
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Left side - Questions */}
      <div className="w-full md:w-1/2 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-4xl font-bold font-mono text-gray-900 mb-8">Interview Questions</h2>
        {interviewData ? (
          <div>
            {interviewData.map((question, index) => (
              <div
                key={index}
                className={`p-5 mb-6 cursor-pointer rounded-lg shadow-lg transition-transform transform ${
                  selectedQuestion === question ? 'bg-blue-100' : 'bg-white'
                } hover:bg-blue-50 hover:scale-105`}
                onClick={() => setSelectedQuestion(question)}
              >
                <p className="text-xl font-bold font-mono text-gray-800">Question {index + 1}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 font-bold font-mono">Loading questions...</p>
        )}

        {/* Display selected question */}
        {selectedQuestion && (
          <div className="mt-10 p-8 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-3xl font-bold font-mono mb-5 text-gray-900">Selected Question</h3>
            <p className="text-lg font-bold font-mono text-gray-700">{selectedQuestion.question}</p> {/* Ensure selectedQuestion has a question property */}
          </div>
        )}
      </div>

      {/* Right side - Webcam, Recording, Transcript, and Feedback */}
      <div className="w-full md:w-1/2 flex flex-col items-center p-8">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-80 rounded-lg shadow-lg border border-gray-300 mb-1"
        ></video>

        <button
          className={`px-8 py-4 text-lg font-bold font-mono rounded-lg shadow-md transition-colors ${
            isRecording ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          } hover:bg-opacity-80`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>

        {/* Text area for transcribed speech */}
        <div className="mt-6 w-full h-64 p-4 bg-white rounded-lg shadow-md border border-gray-200 overflow-auto">
          <textarea
            value={transcript}
            readOnly
            className="w-full h-full border-none outline-none p-2 text-gray-700 bg-white font-mono font-bold"
          />
        </div>

        {/* Feedback box */}
        <div className="mt-6 w-full p-4 bg-blue-50 rounded-lg shadow-md border border-blue-200">
          <h4 className="text-xl font-bold font-mono text-blue-900 mb-2">Feedback</h4>
          <p className="text-lg font-mono text-blue-800">{feedback}</p>
        </div>
      </div>
    </div>
  );
}

export default Session;
