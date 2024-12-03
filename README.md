# **MedAmex Blockchain-Based Medical Data System**

## **Project Overview**
MedAmex is a secure blockchain-based system designed to store and retrieve critical medical data. The project uses IPFS for decentralized storage and Ethereum for smart contract deployment. This README provides step-by-step instructions for executing the project.

---

## **Prerequisites**
- Node.js (v14 or higher)
- Hardhat (installed globally)
- Alchemy or Infura API key (for Holesky or Sepolia network)
- Supported Ethereum wallet (e.g., Metamask)

---

## **Step 1: Clone the Repository**
Clone the project repository to your local machine:
```
git clone <repository_url>
Navigate to the project directory:


cd MedAmex
```
##Step 2: Configure Environment Variables**

```
Update the .env file in the project directory.
Replace PRIVATE_KEY with your Ethereum private key.
Replace ALCHEMY_URL or INFURA_URL with the corresponding Holesky or Sepolia URL.
Example .env file:


PRIVATE_KEY=your-private-key
ALCHEMY_URL=https://sepolia.infura.io/v3/your-project-id
```

##Step 3: Deploy the Smart Contract**
Navigate to the smart contract directory:
```
cd smart-contract

Clean the Hardhat build:

npx hardhat clean

Clean Ignition Modules Deployments:

Delete previous deployments from ignition/modules/deployments.

Deploy the contract:

npx hardhat run ignition/modules/medamex.js --network <holesky/sepolia>
Post-Deployment Configuration:
Copy the deployment address and ABI from the output.

Update the following files with the deployment details:
Backend .env file:

PRIVATE_KEY=your-private-key
CONTRACT_ADDRESS=deployment-address
ADMIN_ADDRESS=same-as-contract-address

Frontend: Update src/utils with the deployment address and ABI
```
##Step 4: Run the Backend Server**
Navigate to the backend directory:
```

cd backend
Start the backend server:


node backend.js
The server should now be running.
```
##Step 5: Run the Frontend**
Navigate to the frontend directory:

```
cd frontend/medamex
Start the frontend development server:


npm run dev
The homepage will be accessible at http://localhost:3000 (or as displayed in the terminal).

Project Workflow
Admin registers hospitals using the configured contract.
Hospitals can register, update, and fetch patient data securely.
Logs are maintained for all hospital activities.
```
Congratulations!
The MedAmex system is now up and running. Thank you for contributing to this innovative project to revolutionize healthcare data management.
