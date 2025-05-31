'use client';

import React, { useEffect, useRef, useState } from 'react';
import BottomNavbar from '@/components/BottomNavbar';
import { useParams } from 'next/navigation'
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { ConnectButton } from "@/components/ConnectWallet";
import { daoAddress, daoAbi } from "@/constant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STAKING_THRESHOLD = 1; // Threshold for launching new token

const Dashboard = () => {

  const params = useParams<{ tag: string; item: string }>();
  const username = params.username
  
  // UI State
  const [stakedAmount, setStakedAmount] = useState(0);
  const [stakeInput, setStakeInput] = useState(1);
  const [migrationActive, setMigrationActive] = useState(false);
  const [currentToken, setCurrentToken] = useState('NOVAA Token');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  
  // Program State
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState(0);
  const [isMember, setIsMember] = useState(true);
  
  // DAO State
  const [stakeAccounts, setStakeAccounts] = useState([]);
  const [myStaked, setMyStaked] = useState(null);
  const [daoMember, setDaoMember] = useState(true);     // for current user is a member or not
  const [novaaBalance, setNovaaBalance] = useState(null);

  // proposal
  const [gist, setGist] = useState("");
  const [id, setId] = useState(0);
  const [proposalType, setProposalType] = useState<'bounty' | 'executable' | 'vote'>('vote');
  const [proposalName, setProposalName] = useState('');
  const [bountyAddress, setBountyAddress] = useState('');
  const [threshold, setThreshold] = useState(0);
  const [proposalData, setProposalData] = useState(null);

  // this is for bounty type proposal
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [bountyAmount, setBountyAmount] = useState<number>(0); 

  // monad
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const { address } = useAccount();
  const [message, setMessage] = useState<string>("");
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [stakedBalance, setStakedBalance] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
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
      
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const stakeTokens = async () => {
    if (!contract || !stakeAmount || parseFloat(stakeAmount) <= 0) return;
    
    setLoading(true);
    try {
      const parsedAmount = ethers.parseEther(stakeAmount);
      
      const tx = await contract.stakeMonad(parsedAmount, {
        value: parsedAmount,
        gasLimit: 9000000  // Add this line
      });

      await tx.wait();

      setMessage(`Successfully staked ${stakeAmount} MONAD!`);
      setStakeAmount("");

      const balance = await contract.balances(address);
      setStakedBalance(ethers.formatEther(balance));
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchNativeBalance = async () => {
      if (typeof window.ethereum !== "undefined" && address) {
        try {
          // const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
          
          const balance = await provider.getBalance(address);
          console.log(ethers.formatEther(balance));
          setNovaaBalance(ethers.formatEther(balance));
          
        } catch (error) {
          console.error("Error fetching native balance:", error);
        }
      }
    };
    fetchNativeBalance();
  }, [address]);


  useEffect(() => {
    const loadContract = async () => {
      if (typeof window.ethereum !== "undefined") {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        // const browserProvider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
        
        const signer = await browserProvider.getSigner();

        const DAOContract = new ethers.Contract(
          daoAddress,
          daoAbi,
          signer
        );
        setContract(DAOContract);
        console.log("DAO Contract loaded:", DAOContract);
      }
    };
    loadContract();
  }, []);

  useEffect(() => {
    const fetchStakedBalance = async () => {
      if (contract && address) {
        try {
          const balance = await contract.balances(address);
          setMyStaked(ethers.formatEther(balance));
          setStakeAmount(ethers.formatEther(balance))
          console.log("balance", balance);
          
        } catch (error) {
          console.error("Error fetching staked balance:", error);
        }
      }
    };
    fetchStakedBalance();
  }, [contract, address]);


  // Convert proposal type to the format expected by Anchor
  const getProposalTypeFormatted = () => {
    try {
      switch (proposalType) {
        case 'bounty':
          // Validate address
          if (!recipientAddress) {
            throw new Error('Recipient address is required for bounty proposals');
          }
          
          // Create PublicKey from string
          let pubkey;
          try {
            pubkey = new pubkey(recipientAddress);
          } catch (e) {
            throw new Error('Invalid recipient address');
          }
          
          // Return the properly formatted bounty variant
          return { 
            bounty: {
              0: pubkey,  // First tuple element is Pubkey
              1: lamports  // Second tuple element is u64 amount
            }
          };
        
        case 'executable':
          return { executable: {} };
        
        case 'vote':
          return { vote: {} };
        
        default:
          throw new Error(`Unknown proposal type: ${proposalType}`);
      }
    } catch (error) {
      console.error('Error formatting proposal type:', error);
      throw error;
    }
  };


  // Simulate staking tokens for UI demo
  const handleStake = async () => {
    setIsLoading(true);
    
    // TODO:
    await sendDummyTransaction();

    // Simulate transaction processing
    setTimeout(() => {
      setStakedAmount(prevAmount => {
        const newAmount = prevAmount + parseInt(String(stakeInput));
        // Check if we've hit the threshold
        if (prevAmount < STAKING_THRESHOLD && newAmount >= STAKING_THRESHOLD) {
          console.log("Threshold reached!");
        }
        return newAmount;
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleLaunchNewToken = async() => {
    setIsLoading(true);

    sendDummyTransaction();
    
    // Simulate the token creation process
    setTimeout(() => {
      setMigrationActive(true);
      setCurrentToken('creator Token');
      setIsLoading(false);
    }, 2000);
  };

  const handleReset = () => {
    setStakedAmount(0);
    setMigrationActive(false);
    setCurrentToken('NOVAA Token');
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
            
            <h1 className="text-3xl font-bold text-purple-400">
              NOVAA
            </h1>
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
                onChange={() => setIsDemoMode(!isDemoMode)}
              />
              <div className="w-12 h-6 bg-blue-900 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-purple-500 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-800"></div>
            </label>
          </div>
        </nav>
        
        {/* Main dashboard content - Mobile layout */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* Connect Wallet Card */}
          <div className="bg-blue-950 rounded-3xl p-5 shadow-lg">
            <div className="flex flex-col items-center">
              {/* Wallet connection button */}
              <ConnectButton />
              
              {/* Token balance */}
              <div className="w-full mb-4 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-1">NOVAA Token Balance</h3>
                <div className="text-4xl font-bold text-white">
                  {(novaaBalance || "0").toString().slice(0, 5)}
                </div>
              </div>

              {/* Membership status */}
              <div className="w-full grid grid-cols-2 gap-3">
                {daoMember ? (
                  <>
                    <div className="col-span-1">
                      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-4">
                        <div className="text-xs text-gray-300 mb-1">Status</div>
                        <div className="text-xl font-bold text-white">MEMBER</div>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-4">
                        <div className="text-xs text-gray-300 mb-1">My Staked</div>
                        <div className="text-xl font-bold text-white">{myStaked || "0"}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <div className="bg-blue-900 rounded-xl p-4 flex items-center justify-center">
                      <div className="text-gray-300">Not a MEMBER</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Creator DAO Card */}
          <div className="bg-blue-950 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">Creator DAO</h2>
              {migrationActive && (
                <span className="text-xs bg-green-900/50 text-green-400 px-3 py-1 rounded-full flex items-center border border-green-500/30">
                  <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Migrated
                </span>
              )}
            </div>
            
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center">
                <p className="text-yellow-400 font-medium">
                  Stake to Become a Member
                </p>
              </div>
              
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${migrationActive ? 'bg-green-400' : 'bg-blue-400'}`} />
                <p className="text-gray-300">Staking with {currentToken}</p>
                {migrationActive && (
                  <span className="ml-auto flex items-center text-green-400 text-xs">
                    Active 
                    <svg className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5 5 5-5" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Staking Progress Card */}
          <div className="bg-blue-950 rounded-3xl p-5 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-5">
              Staking Progress
            </h2>
            
            {/* Progress indicator */}
            <div className="flex flex-col items-center mb-6">
              <div className="text-sm text-gray-300 mb-2">Progress</div>
              <div className="text-5xl font-bold text-purple-400 mb-1">
                {Math.max(1, Math.min(100, Math.round((stakedAmount / STAKING_THRESHOLD) * 100)))}%
              </div>
              <div className="text-sm text-gray-300">
                {stakedAmount.toString()}
                {stakedAmount.toString()}/{STAKING_THRESHOLD}
              </div>
            </div>
            
            {/* Staking input */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">Stake Tokens</h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={stakeInput}
                    onChange={(e) => setStakeInput(Number(e.target.value))}
                    className="w-full bg-blue-900 border border-blue-700 rounded-xl py-3 px-4 text-white focus:outline-none"
                    placeholder="Amount"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <div className="text-purple-400 text-xs">{migrationActive ? "CREATOR" : "NOVAA"}</div>
                  </div>
                </div>
                <button
                  onClick={handleStake}
                  disabled={isLoading || stakeInput <= 0}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-400 hover:to-blue-400 hover:text-blue-950 hover:shadow-lg hover:shadow-purple-500/40 active:from-purple-800 active:to-blue-800 transform active:scale-95 transition-all duration-200 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Staking
                    </div>
                  ) : (
                    "Stake"
                  )}
                </button>
              </div>
            </div>
            
            {/* Launch new token button */}
            {/* TODO: update this UI - ask for token name & add - "Migration successful" & change the token name in UI in Stake from NOVAA to Creator Token */}
            {stakedAmount >= STAKING_THRESHOLD && !migrationActive && (
              <button
                onClick={handleLaunchNewToken}
                disabled={isLoading}
                className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 hover:text-blue-950 hover:shadow-lg hover:shadow-green-500/40 active:from-green-600 active:to-emerald-500 transform active:scale-95 transition-all duration-200 text-white px-6 py-4 rounded-xl font-bold"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Launching...
                  </div>
                ) : 'Launch New DAO Token!'}
              </button>
            )}
          </div>
          
          {/* Members Card */}
          <div className="bg-blue-950 rounded-3xl p-5 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">
              Members
            </h3>
            
            <div className="bg-blue-900 rounded-xl p-3 max-h-60 overflow-y-auto">
              {("0x59d6d47D6583f1AEEC0DC687201070C643A9a3f3").toString().slice(0,15)}.....
            </div>
          </div>
          
          {/* Proposals Card - Only show if migration is not active */}
          {(
            <div className="bg-blue-950 rounded-3xl p-5 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                Proposals
              </h3>
              
              {/* Active Proposals */}
              {proposalData && proposalData.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-lg text-white mb-2">ACTIVE PROPOSALS</h4>
                  <div className="space-y-2">
                    {proposalData.map((proposal, index) => (
                      <div key={index} className="bg-blue-900 p-3 rounded-xl flex items-center justify-between">
                        <span className="text-white">{proposal}</span>
                        <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-400 hover:to-blue-400 hover:text-blue-950 hover:shadow-lg hover:shadow-purple-500/40 active:from-purple-800 active:to-blue-800 transform active:scale-95 transition-all duration-200 text-white px-4 py-1 rounded-lg">
                          Vote
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Create Proposal Section */}
              <div>
                <h4 className="text-lg text-white mb-3">CREATE A PROPOSAL</h4>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    value={proposalName}
                    onChange={(e) => setProposalName(e.target.value)}
                    placeholder="Proposal name"
                    className="w-full bg-blue-900 p-3 text-white placeholder-gray-400 focus:outline-none rounded-xl"
                  />
                  
                  <select
                    value={proposalType}
                    onChange={(e) => setProposalType(e.target.value as 'bounty' | 'executable' | 'vote')}
                    className="w-full bg-blue-900 p-3 text-white focus:outline-none rounded-xl appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: `right 0.5rem center`,
                      backgroundRepeat: `no-repeat`,
                      backgroundSize: `1.5em 1.5em`,
                      paddingRight: `2.5rem`
                    }}
                  >
                    <option value="" disabled hidden>Select proposal type</option>
                    <option value="vote">Vote</option>
                    <option value="bounty">Bounty</option>
                    <option value="executable">Executable</option>
                  </select>
                  
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    placeholder="Threshold for passing"
                    className="w-full bg-blue-900 p-3 text-white placeholder-gray-400 focus:outline-none rounded-xl"
                  />
                  
                  <textarea
                    value={gist}
                    onChange={(e) => setGist(e.target.value)}
                    placeholder="Proposal Description"
                    className="w-full bg-blue-900 p-3 text-white placeholder-gray-400 focus:outline-none rounded-xl h-24 resize-none"
                  />
                  
                  {proposalType === 'bounty' && (
                    <>
                      <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Recipient Address"
                        className="w-full bg-blue-900 p-3 text-white placeholder-gray-400 focus:outline-none rounded-xl"
                      />
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          value={bountyAmount}
                          onChange={(e) => setBountyAmount(parseFloat(e.target.value))}
                          placeholder="Bounty Amount"
                          className="w-full bg-blue-900 p-3 pl-8 text-white placeholder-gray-400 focus:outline-none rounded-xl"
                        />
                        <span className="absolute left-3 top-3 text-gray-400">◎</span>
                      </div>
                    </>
                  )}
                  
                  <button
                    onClick={sendDummyTransaction}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-400 hover:to-blue-400 hover:text-blue-950 hover:shadow-lg hover:shadow-purple-500/40 active:from-purple-800 active:to-blue-800 transform active:scale-95 transition-all duration-200 text-white px-5 py-3 rounded-xl font-bold"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Processing...
                      </div>
                    ) : (
                      "Create Proposal"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Navbar - Fixed at bottom */}
        <BottomNavbar className="bottom-navbar" username={username} />
      </div>
    </div>
  );
};


export default Dashboard;
