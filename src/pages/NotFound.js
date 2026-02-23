import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaArrowLeft } from 'react-icons/fa';
import useDocumentTitle from '../hooks/useDocumentTitle';

/**
 * 404 Not Found Page
 * 
 * Displayed when user navigates to a non-existent route.
 */
const NotFound = () => {
  useDocumentTitle('Page Not Found');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 border border-white border-opacity-20 text-center">
        <div className="text-9xl font-bold text-white mb-4">404</div>
        <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-xl text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            <FaHome /> Go to Homepage
          </Link>
          
          <div className="text-gray-400">or</div>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-white bg-opacity-20 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-opacity-30 transition-all"
          >
            <FaArrowLeft /> Go Back
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-white border-opacity-20">
          <p className="text-gray-400 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login" className="text-blue-400 hover:text-blue-300">Login</Link>
            <Link to="/register" className="text-blue-400 hover:text-blue-300">Register</Link>
            <Link to="/subscribe" className="text-blue-400 hover:text-blue-300">Subscribe</Link>
            <Link to="/download" className="text-blue-400 hover:text-blue-300">Download</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
