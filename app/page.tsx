'use client';

import React, { useState } from "react";
import { Home, List, Mail, Search, X, CheckCircle, PlayCircle } from "lucide-react";
import { FaFacebookF, FaTwitter, FaTiktok, FaMeta, FaRegUser } from "react-icons/fa6";

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
      <div className="flex min-h-screen bg-white">
        <aside className="w-60 bg-gray-900 text-white flex flex-col justify-between py-6 px-4">
          <nav className="space-y-6">
            <h1 className="text-2xl font-bold text-center text-green-500">3YESES</h1>
            <ul className="space-y-4 text-lg">
              <li className="flex items-center gap-3 hover:text-blue-400 cursor-pointer">
                <Home size={20} /> Home
              </li>
              <li className="flex items-center gap-3 hover:text-blue-400 cursor-pointer">
                <List size={20} /> Categories
              </li>
              <li className="flex items-center gap-3 hover:text-blue-400 cursor-pointer">
                <Mail size={20} /> Contact Us
              </li>
            </ul>
          </nav>
          <div className="flex flex-col items-center space-y-4 text-xl text-white">
            <FaFacebookF className="hover:text-blue-500 cursor-pointer" />
            <FaTwitter className="hover:text-blue-400 cursor-pointer" />
            <FaTiktok className="hover:text-pink-500 cursor-pointer" />
            <FaMeta className="hover:text-purple-500 cursor-pointer" />
          </div>
        </aside>

        <div className="flex flex-1 flex-col md:flex-row">
          <main className="flex-1 p-6 md:p-10 relative">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-black">Welcome</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-full px-3 py-1 shadow">
                  <input type="text" placeholder="Search..." className="outline-none px-2 py-1 w-40 md:w-64" />
                  <Search size={20} className="text-gray-500" />
                </div>
                <FaRegUser size={40} className="text-gray-500 cursor-pointer hover:text-blue-500" onClick={() => setIsLoginOpen(true)} />
              </div>
            </div>

            {/* Welcome, Section */}
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Welcome to 3YESES</h1>
              <h2 className="text-2xl font-semibold text-gray-800">Connecting Talent with Opportunity</h2>
              <div className="flex justify-center gap-8 mt-4">
                <CheckCircle size={48} className="text-green-500" />
                <CheckCircle size={48} className="text-green-500" />
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <p className="text-gray-600 text-lg max-w-xl mx-auto">
                Find actors, dancers, musicians, and behind-the-scenes pros — all in one place.
              </p>
              <div className="flex justify-center gap-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700">Get Started</button>
                <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-300">Join the Network</button>
              </div>

              {/* Featured Talent Section */}
              <section className="mt-12">
                <h3 className="text-xl font-bold mb-4 text-black">Featured Talent</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((item) => (
                      <div key={item} className="bg-gray-100 rounded-lg overflow-hidden">
                        <div className="relative">
                          <div className="w-full h-40 bg-gray-300 flex items-center justify-center">
                            <PlayCircle size={48} className="text-green-500" />
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-black">John Doe {item}</h4>
                            <p className="text-sm text-black">Actor | London</p>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </section>
            </div>
          </main>

          <aside className="w-full md:w-64 bg-gray-100 p-4 border-t md:border-l md:border-t-0">
            <h3 className="text-xl font-bold mb-4 text-black">Sponsored</h3>
            <div className="space-y-4 text-black">
              {["Boost your acting career!", "Find crew members fast", "Get discovered by agencies"].map((ad, idx) => (
                  <div key={idx} className="bg-white shadow p-4 rounded-lg hover:shadow-md transition">
                    <p className="text-sm">{ad}</p>
                  </div>
              ))}
            </div>
          </aside>
        </div>

        {isLoginOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-80">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Sign In</h3>
                  <X size={20} className="cursor-pointer" onClick={() => setIsLoginOpen(false)} />
                </div>
                <input type="email" placeholder="Email" className="w-full p-2 border rounded mb-3" />
                <input type="password" placeholder="Password" className="w-full p-2 border rounded mb-4" />
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Continue</button>
                <p className="text-center mt-4 text-sm">
                  Don&apos;t have an account? <span className="text-blue-500 cursor-pointer">Sign up</span>
                </p>
              </div>
            </div>
        )}
      </div>
  );
}