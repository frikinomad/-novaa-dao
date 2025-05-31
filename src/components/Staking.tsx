"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { ConnectButton } from "@/components/ConnectWallet";
import { daoAddress, daoAbi } from "@/constant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Staking() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const { address } = useAccount();
  const [message, setMessage] = useState<string>("");
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [stakedBalance, setStakedBalance] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState(null);


  useEffect(() => {
    const fetchNativeBalance = async () => {
      if (typeof window.ethereum !== "undefined" && address) {
        try {
          // const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
          
          const balance = await provider.getBalance(address);
          console.log(ethers.formatEther(balance));
          
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
          setStakedBalance(ethers.formatEther(balance));
        } catch (error) {
          console.error("Error fetching staked balance:", error);
        }
      }
    };
    fetchStakedBalance();
  }, [contract, address]);

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

  const handleStake = async () => {
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

  return (
    <>
      <div className="container mx-auto flex-col border-8 rounded-md border-black h-[100vh] flex items-center justify-center space-y-6">
        <h1 className="text-3xl font-bold">DAO Staking</h1>
        
        <ConnectButton />
        
        {address && (
          <div className="text-center space-y-4">
            <p className="text-lg">
              Your Staked Balance: <span className="font-bold text-green-600">{stakedBalance} MONAD</span>
            </p>
            
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Amount to stake (MONAD)"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-64"
                step="0.001"
                min="0"
              />
              
              <Button 
                onClick={handleStake} 
                disabled={loading || !stakeAmount}
                className="w-64"
              >
                {loading ? "Staking..." : "Stake MONAD"}
              </Button>
            </div>
          </div>
        )}

        <div>
          <Button 
            onClick={sendDummyTransaction} 
            className="w-64"
            >
            {loading ? "Send..." : "Send"}
          </Button>
          <p> {transactionHash}</p>
        </div>
        
        {message && (
          <div className="mt-4 p-4 border rounded-md max-w-md text-center">
            <p className={message.includes("Error") ? "text-red-500" : "text-green-500"}>
              {message}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
