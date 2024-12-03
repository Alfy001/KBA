import { ethers } from "ethers"; // Import ethers.js
import { abi } from './hospital.json'; // Import ABI for the contract
import { CONTRACT } from './deployed_addresses.json'; // Import deployed contract address

// Function to get the contract instance
const getContract = async () => {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed. Please install MetaMask and try again.");
    }

    // Create a provider using MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Request MetaMask to connect accounts
    await provider.send("eth_requestAccounts", []);

    // Get the signer (connected wallet)
    const signer = await provider.getSigner();

    // Log the connected wallet address for debugging
    console.log("Connected wallet address:", await signer.getAddress());

    // Initialize the contract instance with the signer
    const contract = new ethers.Contract(CONTRACT, abi, signer);

    // Attach the signer manually (optional for clarity)
    contract.signer = signer;

    // Log the initialized contract for debugging
    console.log("Contract initialized:", contract);

    return contract;
  } catch (error) {
    // Log and throw the error for debugging
    console.error("Error initializing contract:", error);
    throw new Error("Failed to initialize contract: " + error.message);
  }
};

export default getContract;
