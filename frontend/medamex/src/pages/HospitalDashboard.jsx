import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import getContract from "../utils/contract";
import axios from "axios";

const HospitalDashboard = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("registerPatient");

  const textFieldStyles = {
    my: 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: "8px",
    input: { color: "#000" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#ccc", borderRadius: "8px" },
      "&:hover fieldset": { borderColor: "#888" },
      "&.Mui-focused fieldset": { borderColor: "#1976d2" },
    },
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
    setMessage("");
  };

  // Patient registration
  const registerPatient = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.registerPatient(walletAddress);
      await tx.wait();
      setMessage(`Patient ${walletAddress} registered successfully!`);

      const response = await axios.post("http://localhost:3000/create-folder", {
        patientAddress: walletAddress,
      });

      if (response.data.uniqueId) {
        setMessage(`Patient ${walletAddress} registered and CID created successfully!`);
      }
    } catch (error) {
      setMessage("Error: " + (error.message || "Failed to register patient and create CID."));
    }
  };

  // Fetch patient details
  const fetchPatientDetails = async () => {
    try {
      const contract = await getContract();
      const patientCID = await contract.getPatientCID(walletAddress);

      if (patientCID === "pending") {
        setMessage("Patient CID is still pending registration.");
        return;
      }

      const signerAddress = await contract.signer.getAddress();
      const response = await axios.post("http://localhost:3000/get-patient-cid", {
        uniqueId: patientCID,
        patientad: walletAddress,
        signerAddress,
      });

      const { ipfsLink } = response.data;

      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <iframe 
            src="${ipfsLink}" 
            width="100%" 
            height="100%" 
            style="border:none;"
          ></iframe>
        `);
      } else {
        setMessage("Error: Unable to open a new tab.");
      }

      setMessage("Patient details retrieved successfully.");
    } catch (error) {
      setMessage("Error: " + (error.response?.data?.error || error.message));
    }
  };

  // Update patient details
  const updatePatientDetails = async () => {
    if (!file) {
      setMessage("Please upload a file before updating.");
      return;
    }

    try {
      const contract = await getContract();
      const patientCID = await contract.getPatientCID(walletAddress);

      if (patientCID === "pending") {
        setMessage("Patient CID is still pending registration.");
        return;
      }

      const signerAddress = await contract.signer.getAddress();
      const formData = new FormData();
      formData.append("uniqueId", patientCID);
      formData.append("patientAddress", walletAddress);
      formData.append("signerAddress", signerAddress);
      formData.append("file", file);

      await axios.post("http://localhost:3000/update-cid", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Patient details updated successfully.");
    } catch (error) {
      setMessage("Error: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: "border-box" },
        }}
      >
        <List>
          <ListItem button onClick={() => handleNavigation("registerPatient")}>
            <ListItemText primary="Register Patient" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation("fetchDetails")}>
            <ListItemText primary="Get Patient Details" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation("updateDetails")}>
            <ListItemText primary="Update Patient Details" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Hospital Dashboard
        </Typography>

        {/* Register Patient Section */}
        {activeSection === "registerPatient" && (
          <Box>
            <Typography variant="h6">Register Patient</Typography>
            <TextField
              label="Patient Wallet Address"
              fullWidth
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              sx={textFieldStyles}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={registerPatient}
              disabled={!walletAddress}
            >
              Register Patient
            </Button>
          </Box>
        )}

        {/* Fetch Patient Details Section */}
        {activeSection === "fetchDetails" && (
          <Box>
            <Typography variant="h6">Get Patient Details</Typography>
            <TextField
              label="Patient Wallet Address"
              fullWidth
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              sx={textFieldStyles}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={fetchPatientDetails}
              disabled={!walletAddress}
            >
              Get Details
            </Button>
          </Box>
        )}

        {/* Update Patient Details Section */}
        {activeSection === "updateDetails" && (
          <Box>
            <Typography variant="h6">Update Patient Details</Typography>
            <TextField
              label="Patient Wallet Address"
              fullWidth
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              sx={textFieldStyles}
            />
            <Button
              variant="contained"
              component="label"
              sx={{ mb: 2 }}
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={updatePatientDetails}
              disabled={!walletAddress || !file}
            >
              Update Details
            </Button>
          </Box>
        )}

        {/* Message Display */}
        {message && (
          <Typography color="error" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default HospitalDashboard;
