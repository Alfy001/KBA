import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import './home1.scss'; // Import the CSS file
import { useNavigate } from 'react-router-dom'; // Import useNavigate if using react-router
import getContract from "../utils/contract";

const Home = () => {
  const navigate = useNavigate();

  const loginAsAdmin = async () => {
    try {
      const contract = await getContract();
      const signerAddress = await contract.signer.getAddress();
      console.log("Signer Address:", signerAddress); // Debug log
      const isAdmin = await contract.isAdmin(signerAddress);
      console.log("Is Admin:", isAdmin); // Debug log

      if (isAdmin) {
        navigate("/admin-dashboard");
      } else {
        alert("Access Denied: You are not an admin.");
      }
    } catch (error) {
      console.error("Error during admin login:", error);
      alert("Error connecting to MetaMask: " + error.message);
    }
  };

  const loginAsHospital = async () => {
    try {
      const contract = await getContract();
      const signer = await contract.signer.getAddress();
      const isHospital = await contract.isRegisteredHospital(signer);

      if (isHospital) {
        navigate("/hospital-dashboard");
      } else {
        alert("Access Denied: You are not a registered hospital.");
      }
    } catch (error) {
      console.error("Error during hospital login:", error);
      alert("Error connecting to MetaMask: " + error.message);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      position="relative"
    >
      <div className="stars">
        {Array.from({ length: 50 }).map((_, index) => (
          <div key={index} className="star"></div>
        ))}
      </div>
      <Typography variant="h3" gutterBottom>
        Welcome to MedaMex
      </Typography>
      <Button variant="contained" color="primary" onClick={loginAsAdmin} sx={{ m: 2 }}>
        Login as Admin
      </Button>
      <Button variant="contained" color="primary" onClick={loginAsHospital} sx={{ m: 2 }}>
        Login as Hospital
      </Button>
    </Box>
  );
};

export default Home;