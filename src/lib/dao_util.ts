import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ethers } from "ethers"
import { daoAbi, daoAddress } from "@/constant"

// DAO Staking Functions
export const stakeMonad = async (amount: string) => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  if (!signer) {
    throw new Error("Signer not found. Please connect your wallet.")
  }
  
  const daoContract = new ethers.Contract(daoAddress, daoAbi, signer)
  const tx = await daoContract.stakeMonad({ value: ethers.parseEther(amount) })
  await tx.wait()
  
  alert(`${amount} MONAD staked successfully!`)
}

export const unstakeMonad = async (amount: string) => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  if (!signer) {
    throw new Error("Signer not found. Please connect your wallet.")
  }
  
  const daoContract = new ethers.Contract(daoAddress, daoAbi, signer)
  const tx = await daoContract.unstakeMonad(ethers.parseEther(amount))
  await tx.wait()
  
  alert(`${amount} MONAD unstaked successfully!`)
}

// DAO Voting Functions
export const voteOnProposal = async (proposalId: number, choice: boolean) => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  if (!signer) {
    throw new Error("Signer not found. Please connect your wallet.")
  }
  
  const daoContract = new ethers.Contract(daoAddress, daoAbi, signer)
  const tx = await daoContract.vote(proposalId, choice)
  await tx.wait()
  
  alert(`Vote cast: ${choice ? 'Yes' : 'No'}`)
}

export const createProposal = async (description: string, votingPeriodHours: number) => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  if (!signer) {
    throw new Error("Signer not found. Please connect your wallet.")
  }
  
  const daoContract = new ethers.Contract(daoAddress, daoAbi, signer)
  const tx = await daoContract.createProposal(description, votingPeriodHours)
  await tx.wait()
  
  alert("Proposal created successfully!")
}

// DAO View Functions
export const getStakedBalance = async (address: string): Promise<string> => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const daoContract = new ethers.Contract(daoAddress, daoAbi, provider)
  const balance = await daoContract.balances(address)
  return ethers.formatEther(balance)
}

export const getProposalResults = async (proposalId: number) => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const daoContract = new ethers.Contract(daoAddress, daoAbi, provider)
  const result = await daoContract.getProposalResults(proposalId)
  
  return {
    description: result[0],
    yesVotes: result[1].toString(),
    noVotes: result[2].toString(),
    totalVotes: result[3].toString(),
    endTime: new Date(Number(result[4]) * 1000),
    ended: result[5]
  }
}

export const hasVoted = async (proposalId: number, address: string): Promise<boolean> => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const daoContract = new ethers.Contract(daoAddress, daoAbi, provider)
  return await daoContract.hasVoted(proposalId, address)
}

export const getVoterInfo = async (address: string) => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const daoContract = new ethers.Contract(daoAddress, daoAbi, provider)
  const info = await daoContract.getVoterInfo(address)
  
  return {
    name: info[0],
    voted: info[1],
    stakedAmount: ethers.formatEther(info[2])
  }
}

export const getMinStakeToVote = async (): Promise<string> => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const daoContract = new ethers.Contract(daoAddress, daoAbi, provider)
  const minStake = await daoContract.minStakeToVote()
  return ethers.formatEther(minStake)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fromDataURLtoBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "")
  return Buffer.from(base64Data, "base64")
}