'use client';

import React, {useState, useEffect} from 'react';
import BottomNavbar from '@/components/BottomNavbar';
import { ethers } from "ethers";
import { ConnectButton } from "@/components/ConnectWallet";

const InitializeDAO = (params) => {

    // const username = params.params.username;
    const username = "loggedInUser";
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(true);
    const [issuePrice, setIssuePrice] = useState(1);
    const [transactionHash, setTransactionHash] = useState(null);

    const sendDummyTransaction = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        const tx = await signer.sendTransaction({
          to: address,        // Send to yourself
          value: ethers.parseEther("0"),  // 0 ETH
          gasLimit: 21000     // Standard gas for ETH transfer
        });
        
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("Transaction confirmed");
        setTransactionHash(tx.hash)

        setIsLoading(false); 
        setSuccess(true);
        
      } catch (error) {
        console.error("Error:", error.message);
      }
    };
  

    return (
      <div className="app bg-black min-h-screen text-white">
        {/* Main container with mobile-first layout */}
        <div className="container">

          {/* Top navigation bar */}
          <nav className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2">
              {/* Logo */}
              <div className="logo-container relative h-12 w-12">
                <div className="absolute inset-0 bg-purple-600 rounded-full"></div>
                <div className="absolute inset-1 bg-blue-950 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-400">N</span>
                </div>
              </div>
            </div>
            
            {/* Demo mode toggle */}
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${isDemoMode ? 'font-bold text-yellow-400' : 'text-gray-400'}`}>
                Demo Mode
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isDemoMode}
                  onChange={() => setIsDemoMode(isDemoMode)}
                />
                <div className="w-12 h-6 bg-blue-900 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-purple-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-800"></div>
              </label>
            </div>
          </nav>
          
          {/* DAO Header */}
          <div className="flex flex-col items-center mb-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Create Your DAO
            </h1>
            <p className="text-purple-400 font-medium">Become a Creator</p>
          </div>
          
          {/* Main content - Mobile layout */}
          <div className="grid grid-cols-1 gap-4">
            
            {/* Wallet connection button */}
            <ConnectButton />


            {/* Status Messages */}
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}
            
            {/* Config Card */}
            <div className="bg-blue-950 rounded-3xl p-5 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">DAO Parameters</h2>
              
              <div className="space-y-4">
                {/* DAO Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">DAO Name</label>
                  <input
                    type="text"
                    placeholder="DAO name"
                    // onChange={(e) => setIssuePrice(Number(e.target.value))}
                    className="w-full bg-blue-900 border border-blue-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                
                {/* Issue Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Issue Price (MON)</label>
                  <input
                    type="number"
                    value={issuePrice}
                    onChange={(e) => setIssuePrice(Number(e.target.value))}
                    className="w-full bg-blue-900 border border-blue-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>
            </div>
            {/* Initialize Button */}
            <button
              onClick={sendDummyTransaction}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-400 hover:to-blue-400 hover:text-blue-950 hover:shadow-lg hover:shadow-purple-500/40 active:from-purple-800 active:to-blue-800 transform active:scale-95 transition-all duration-200 text-white font-bold py-4 px-6 rounded-xl w-full shadow-lg disabled:opacity-50 disabled:hover:scale-100 mb-6"
            >
              {success ? (
                <div className="bg-green-900/30 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
                  DAO initialized successfully!
                </div>
              ) : (
                "Initialize DAO"
              )}
            </button>
          </div>
          
          <div className="h-32" />

          {/* Bottom Navbar - Fixed at bottom */}
          <BottomNavbar className="bottom-navbar" username={`${username}`} />
        </div>
      </div>
    );

};

export default InitializeDAO;