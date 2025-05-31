import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ethers } from "ethers"
import { contractAbi ,contractAddress } from "@/constant"

export const mintWithContract = async (metadataUrl: string) => {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  if (!signer) {
    throw new Error("Signer not found. Please connect your wallet.")
  }
  const nftContract = new ethers.Contract(
    contractAddress,
    contractAbi,
    signer
  );
  console.log("",);

  const tx = await nftContract.mintNFT(metadataUrl);
  await tx.wait()

  alert("Tokens staked!")
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function fromDataURLtoBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "")
  return Buffer.from(base64Data, "base64")
}