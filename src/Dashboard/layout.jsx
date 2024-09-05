import React, { useState } from 'react';
import chatSession from './GeminiAI';
import { useNavigate } from 'react-router-dom';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { db } from '../../utils/db';
import { MockInterview } from '../../utils/schema';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment/moment';

const Layout = ({ children }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [formValues, setFormValues] = useState({
    jobRole: '',
    address: '',
    place: '',
    experience: ''
  });
  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  // For navigation perpose...
  const navigate = useNavigate();

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const handleOpenFormDialog = () => setOpenFormDialog(true);
  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setFormValues({ jobRole: '', address: '', place: '', experience: '' });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormValues({ ...formValues, [id]: value });
  };

  const isFormValid = Object.values(formValues).every((value) => value.trim() !== '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormValid) {
      setLoading(true);
      setEnvironments([...environments, formValues]);

      const InputPrompt = `Job Position: ${formValues.jobRole}, Job Description: ${formValues.address}, Company Name: ${formValues.place}, Experience: ${formValues.experience}, Give us 5 Interview Questions along with Answers in JSON format.`;
      console.log(InputPrompt);

      try {
        const result = await chatSession.sendMessage(InputPrompt);
        const text = await result.response.text();
        const MockJsonResp = text.replace(/```json|```/g, ''); // Clean up any JSON delimiters
        const parsedJson = JSON.parse(MockJsonResp);

        console.log(parsedJson);
        setJsonResponse(MockJsonResp);

        // Storing in the database with a check to avoid circular references
        const sanitizedData = {
          mockId: uuidv4(),
          jsonMockResp: MockJsonResp,
          jobPosition: formValues.jobRole,
          jobDesc: formValues.address,
          jobExperience: formValues.experience,
          createdBy: 'User Email Address', // Placeholder for user email
          createdAt: moment().format('DD-MM-yyyy')
        };

        const resp = await db.insert(MockInterview).values(sanitizedData).returning({ mockId: MockInterview.mockId });
        // console.log(resp);
        
        // Mainly used for the navigation perpose....
        if(resp) {
          navigate('/interview/'+resp[0]?.mockId);
        }

      } catch (error) {
        if (error instanceof SyntaxError) {
          console.error('JSON Parse Error:', error);
        } else if (error.message.includes('circular structure')) {
          console.error('Circular reference detected:', error);
        } else {
          console.error('An error occurred:', error);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteEnvironment = (indexToDelete) => {
    setEnvironments(environments.filter((_, index) => index !== indexToDelete));
  };


  return (
    <>
      <div className="mt-6 flex justify-center">
        <h1 className="text-6xl font-bold font-mono">AI Mock Interview</h1>
      </div>
      <div className="mt-0 flex justify-center">
        <h1 className="text-xl font-bold font-mono text-gray-500">Kickstart Your AI-Powered Mock Interview Experience</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-1 my-5 ml-4">
        <div
          className="p-9 border rounded-lg bg-secondary hover:scale-104 hover:shadow-lg cursor-pointer transition-all"
          onClick={handleOpenDialog}
        >
          <div className="font-bold text-large text-center">
            <h2>+ Add New</h2>
          </div>
        </div>
        {environments.map((env, index) => (
          <div 
            key={index} 
            className="p-5 border rounded-lg bg-secondary cursor-pointer transition-all hover:scale-104 hover:shadow-lg relative"
          >
            <div className="absolute top-1 right-1">
              <button
                onClick={() => handleDeleteEnvironment(index)}
                className="text-red-400 hover:text-red-700"
              >
                X
              </button>
            </div>
            <div className="font-bold text-large text-center">
              <h2>Job Role: {env.jobRole}</h2>
              <p>Job Description: {env.address}</p>
              <p>Company Name: {env.place}</p>
              <p>Experience: {env.experience} years</p>
            </div>
          </div>
        ))}
        {openDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white p-8 rounded-lg w-1/2 max-w-lg shadow-xl transform scale-110 transition-transform duration-300 ease-out">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Ready for the Interview?</h2>
                <button
                  onClick={handleCloseDialog}
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
              <p className="mb-6 text-lg">
                Best of luck for your interview! Believe in yourself and your skills. You’ve got this! Remember, every challenge is an opportunity to shine. 🌟 Good luck!
              </p>
              <div className="flex gap-6 justify-end">
                <button
                  onClick={handleCloseDialog}
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleCloseDialog();
                    handleOpenFormDialog();
                  }}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
        {openFormDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white p-8 rounded-lg w-full max-w-lg shadow-2xl transform scale-110 transition-transform duration-300 ease-out">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Interview Details</h2>
                <button
                  onClick={handleCloseFormDialog}
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="jobRole" className="block text-lg font-medium text-gray-700">Job Role/Job Position</label>
                  <input
                    id="jobRole"
                    type="text"
                    value={formValues.jobRole}
                    onChange={handleChange}
                    placeholder="Eg: Data Engineer"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-3 bg-white text-gray-500 placeholder-gray-400 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm hover:bg-gray-50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-lg font-medium text-gray-700">Job Description/Tech Stack (In Short)</label>
                  <input
                    id="address"
                    type="text"
                    value={formValues.address}
                    onChange={handleChange}
                    placeholder="Eg: Python, Cloud Computing"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-3 bg-white text-gray-500 placeholder-gray-400 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm hover:bg-gray-50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="place" className="block text-lg font-medium text-gray-700">Company Name/Institute Name</label>
                  <input
                    id="place"
                    type="text"
                    value={formValues.place}
                    onChange={handleChange}
                    placeholder="Eg: Intervue.io"
                    className="mt-1 block w-full border border-gray-300 rounded-md p-3 bg-white text-gray-500 placeholder-gray-400 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm hover:bg-gray-50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="experience" className="block text-lg font-medium text-gray-700">Experience (In Years)</label>
                  <input
                    id="experience"
                    type="number"
                    value={formValues.experience}
                    onChange={handleChange}
                    placeholder="Eg: 3"
                    max={"50"}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-3 bg-white text-gray-500 placeholder-gray-400 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm hover:bg-gray-50 transition-colors"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !isFormValid} 
                    className={`bg-black text-white px-4 py-2 rounded ${
                      isFormValid ? 'hover:bg-gray-800 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                    }`} > 
                    {loading? 
                    <>
                    <LoaderCircle className='animate-spin'/>Generating from AI
                      </>:'Start Interview'
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <main>{children}</main>
    </>
  );
};

export default Layout;