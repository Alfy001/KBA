import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum); // Use MetaMask provider

const getSigner = async () => {
  try {
    await provider.send("eth_requestAccounts", []); // Prompt user to connect wallet
    return provider.getSigner();
  } catch (error) {
    throw new Error("MetaMask connection failed: " + error.message);
  }
};

export { provider, getSigner };
