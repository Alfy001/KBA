import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import getContract from "../utils/contract";
import axios from "axios";
 
const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalPhysicalAddress, setHospitalPhysicalAddress] = useState("");
  const [hospitalMapLink, setHospitalMapLink] = useState("");
  const [hospitalDetails, setHospitalDetails] = useState(null);
  const [patientAddress, setPatientAddress] = useState("");
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("logs");
  const navigate = useNavigate();
 
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
 
  const fetchLogs = async () => {
    try {
      if (!hospitalAddress) {
        setMessage("Please enter a hospital address to search logs.");
        return;
      }
      const response = await axios.get("http://localhost:3000/logs/search", {
        params: { hospitalAddress },
      });
      setLogs(response.data);
      setMessage("");
    } catch (error) {
      console.error("Error searching logs:", error);
      setMessage(
        "Error: Unable to fetch logs. " + error.response?.data?.error || error.message
      );
    }
  };
 
  const registerHospital = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.registerHospital(
        hospitalAddress,
        hospitalName,
        hospitalPhysicalAddress,
        hospitalMapLink
      );
      await tx.wait();
      setMessage(`Hospital "${hospitalName}" registered successfully.`);
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };
 
  const revokeHospital = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.revokeHospital(hospitalAddress);
      await tx.wait();
      setMessage(`Hospital ${hospitalAddress} revoked successfully.`);
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };
 
  const fetchHospitalDetails = async () => {
    try {
      const contract = await getContract();
      const details = await contract.getHospitalDetails(hospitalAddress);
      setHospitalDetails({
        isRegistered: details[0],
        name: details[1],
        physicalAddress: details[2],
        mapLink: details[3],
      });
      setMessage("");
    } catch (error) {
      console.error("Error fetching hospital details:", error);
      setMessage("Error: Unable to fetch hospital details.");
    }
  };
 
  const unregisterPatient = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.unregisterPatient(patientAddress);
      await tx.wait();
      setMessage(`Patient ${patientAddress} unregistered successfully.`);
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };
 
  const handleNavigation = (section) => {
    setActiveSection(section);
    setMessage(""); // Clear messages when switching sections
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
          <ListItem button onClick={() => handleNavigation("logs")}>
            <ListItemText primary="Search Logs" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation("registerHospital")}>
            <ListItemText primary="Register Hospital" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation("revokeHospital")}>
            <ListItemText primary="Revoke Hospital" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation("fetchDetails")}>
            <ListItemText primary="Fetch Hospital Details" />
          </ListItem>
          <ListItem button onClick={() => handleNavigation("unregisterPatient")}>
            <ListItemText primary="Unregister Patient" />
          </ListItem>
          <ListItem button onClick={() => navigate("/home")}>
            <ListItemText primary="Home" />
          </ListItem>
        </List>
      </Drawer>
 
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
 
        {/* Search Logs Section */}
        {activeSection === "logs" && (
          <Box>
            <Typography variant="h6">Search Logs by Hospital Address</Typography>
            <TextField
              label="Hospital Wallet Address"
              fullWidth
              value={hospitalAddress}
              onChange={(e) => setHospitalAddress(e.target.value)}
              sx={textFieldStyles}
            />
            <Button variant="contained" color="primary" onClick={fetchLogs}>
              Search Logs
            </Button>
          </Box>
        )}
 
        {/* Register Hospital Section */}
        {activeSection === "registerHospital" && (
          <Box>
            <Typography variant="h6">Register Hospital</Typography>
            <TextField
              label="Hospital Wallet Address"
              fullWidth
              value={hospitalAddress}
              onChange={(e) => setHospitalAddress(e.target.value)}
              sx={textFieldStyles}
            />
            <TextField
              label="Hospital Name"
              fullWidth
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              sx={textFieldStyles}
            />
            <TextField
              label="Physical Address"
              fullWidth
              value={hospitalPhysicalAddress}
              onChange={(e) => setHospitalPhysicalAddress(e.target.value)}
              sx={textFieldStyles}
            />
            <TextField
              label="Google Maps Link"
              fullWidth
              value={hospitalMapLink}
              onChange={(e) => setHospitalMapLink(e.target.value)}
              sx={textFieldStyles}
            />
            <Button variant="contained" color="primary" onClick={registerHospital}>
              Register Hospital
            </Button>
          </Box>
        )}
 
        {/* Revoke Hospital Section */}
        {activeSection === "revokeHospital" && (
          <Box>
            <Typography variant="h6">Revoke Hospital</Typography>
            <TextField
              label="Hospital Wallet Address"
              fullWidth
              value={hospitalAddress}
              onChange={(e) => setHospitalAddress(e.target.value)}
              sx={textFieldStyles}
            />
            <Button variant="contained" color="primary" onClick={revokeHospital}>
              Revoke Hospital
            </Button>
          </Box>
        )}
 
        {/* Fetch Hospital Details Section */}
        {activeSection === "fetchDetails" && (
          <Box>
            <Typography variant="h6">Fetch Hospital Details</Typography>
            <TextField
              label="Hospital Wallet Address"
              fullWidth
              value={hospitalAddress}
              onChange={(e) => setHospitalAddress(e.target.value)}
              sx={textFieldStyles}
            />
            <Button variant="contained" color="primary" onClick={fetchHospitalDetails}>
              Fetch Details
            </Button>
            {hospitalDetails && (
              <Box my={2}>
                <Typography>Name: {hospitalDetails.name}</Typography>
                <Typography>Address: {hospitalDetails.physicalAddress}</Typography>
                <Typography>Map Link: {hospitalDetails.mapLink}</Typography>
                <Typography>
                  Status: {hospitalDetails.isRegistered ? "Registered" : "Revoked"}
                </Typography>
              </Box>
            )}
          </Box>
        )}
 
        {/* Unregister Patient Section */}
        {activeSection === "unregisterPatient" && (
          <Box>
            <Typography variant="h6">Unregister Patient</Typography>
            <TextField
              label="Patient Wallet Address"
              fullWidth
              value={patientAddress}
              onChange={(e) => setPatientAddress(e.target.value)}
              sx={textFieldStyles}
            />
            <Button variant="contained" color="primary" onClick={unregisterPatient}>
              Unregister Patient
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
 
export default AdminDashboard;