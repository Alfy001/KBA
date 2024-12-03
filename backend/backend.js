// backend.js
const fetch = require("node-fetch");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const axios = require("axios");
const FormData = require("form-data");
const crypto = require("crypto");
const fs = require("fs");
const { supabase, supabaseAdmin } = require("./superbase");
const { abi } = require("./hospital.json");
const cors = require('cors');


// Load environment variables
const ALCHEMY_URL = process.env.ALCHEMY_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PORT = process.env.PORT || 3000;

// Initialize Ethers provider and wallet
const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Create contract instance
const hospitalContract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

function generateUniqueId() {
    return crypto.randomBytes(32).toString("hex");
}

// Function to create a folder on Pinata and return the CID
async function createFolderOnPinata(patientAddress, file = null) {
    try {
        let formData = {};
        
        // If no file is provided, create JSON content
        if (!file) {
            formData = {
                pinataMetadata: {
                    name: patientAddress,
                    keyvalues: {
                        patientAddress,
                        timestamp: new Date().toISOString(),
                    },
                },
                pinataContent: {
                    patientAddress,
                    timestamp: new Date().toISOString(),
                },
            };
        } else {
            // If file is provided, use file upload method
            const formDataFile = new FormData();
            formDataFile.append("file", fs.createReadStream(file.path));

            const metadata = {
                name: patientAddress,
                keyvalues: {
                    patientAddress,
                    timestamp: new Date().toISOString(),
                },
            };

            formDataFile.append("pinataMetadata", JSON.stringify(metadata));

            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formDataFile, {
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${formDataFile._boundary}`,
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_API_KEY,
                },
            });
            return response.data.IpfsHash;
        }

        // If no file, use the JSON pinning endpoint
        const response = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", formData, {
            headers: {
                "Content-Type": "application/json",
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_API_KEY,
            },
        });

        return response.data.IpfsHash;
    } catch (error) {
        console.error("Error creating folder on Pinata:", error.message);
        throw new Error("Failed to create folder on Pinata.");
    }
}


// Function to delete a folder from Pinata
async function deleteFolderFromPinata(cid) {
    try {
        const response = await axios.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
            headers: {
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_API_KEY,
            },
        });

        if (response.status === 200) {
            console.log(`Successfully deleted folder`);
        } else {
            throw new Error("Failed to delete folder from Pinata.");
        }
    } catch (error) {
        console.error("Error deleting folder from Pinata:", error.message);
        throw error;
    }
}

async function createFolderAndStoreData(patientAddress) {
    const uniqueId = generateUniqueId(); // Generate a unique identifier
    const cid = await createFolderOnPinata(patientAddress); // Create a folder and get its CID
    const createdAt = new Date().toISOString(); // Get the current timestamp in ISO format

    const { error } = await supabaseAdmin.from("details").insert({
        id: uniqueId,
        patient_id: patientAddress,
        cid: cid,
        created_at: createdAt, // Add the timestamp value
    });

    if (error) {
        console.error("Error storing patient data:", error);
        throw new Error("Failed to store patient data.");
    }

    return uniqueId; // Return the unique ID
}


async function updatePatientCID(patientAddress, newCID) {
    const tx = await hospitalContract.updatePatientCID(patientAddress, newCID);
    await tx.wait();
}



const app = express();
app.use(cors({
    origin: 'http://localhost:5175', // Update this to match your React app's URL
    methods: 'GET,POST,PUT,DELETE',
    credentials: true // If you need to send cookies
})); // Enable CORS for your frontend
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true }));


app.post("/create-folder", async (req, res) => {
    const { patientAddress } = req.body;
    console.log('Initiated a create folder transaction')
    try {
        const uniqueId = await createFolderAndStoreData(patientAddress);
        await updatePatientCID(patientAddress, uniqueId);
        res.status(200).json({ uniqueId });
    } catch (error) {
        console.error("Error creating folder:", error.message);
        res.status(500).json({ error: "Failed to create folder and update contract." });
    }
});


app.post('/update-cid', upload.single('file'), async (req, res) => {
 // Log the uploaded file

    const { uniqueId, patientAddress, signerAddress } = req.body;
    const file = req.file;  // This will contain the uploaded file info.
    const patientsuid=patientAddress
    try {
        // Log uniqueId to check the value

        // Step 1: Fetch the CID and timer details
        const { data, error } = await supabase
            .from("details")
            .select("cid, is_cid_fetched, cid_fetched_at")
            .eq("id", uniqueId) // Ensure this column is correct
            .single();

        if (error || !data) {
            console.log("Error:", error); // Log the error message from Supabase
            return res.status(400).json({ error: "Patient record not found." });
        }

        const { cid: oldCID, is_cid_fetched, cid_fetched_at } = data;

        // Step 2: Check if the CID was fetched and within the timer
        if (!is_cid_fetched || !cid_fetched_at) {
            return res.status(400).json({ error: "CID must be fetched first." });
        }

        // Step 3: Delete the old folder from Pinata
        await deleteFolderFromPinata(oldCID);

        // Step 4: Create a new folder on Pinata with the updated file
        const newCID = await createFolderOnPinata(patientAddress, file);
        const createdAt = new Date().toISOString();

        // Step 6: Update the details table with the new CID and reset flags
        const { error: updateError } = await supabase
            .from("details")
            .update({
                cid: newCID,
                created_at:createdAt,
                is_cid_fetched: false,
                cid_fetched_at: null,
            })
            .eq("id", uniqueId);
        

        if (updateError) {
            console.error("Error updating the details table:", updateError.message);
            return res.status(500).json({ error: "Failed to update CID in the database." });
        }

        // Step 7: Log the operation
        const { error: logError } = await supabaseAdmin.from("logs").insert({
            patient_id: patientsuid, // Corrected from undefined `patientad`
            hospital_id: signerAddress,
            operation: "Updated patient CID",
            created_at: new Date().toISOString(),
        });

        if (logError) {
            console.error("Error inserting into logs:", logError.message);
        }

        // Respond with success
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error updating CID:", error.message);
        res.status(500).json({ error: "Failed to update CID." });
    }
});




app.post("/get-patient-cid", async (req, res) => {
    const { uniqueId, patientad, signerAddress } = req.body;
    const patientsuid=patientad
    try {
        const { data, error } = await supabase
            .from("details")
            .select("cid")
            .eq("id", uniqueId)
            .single();

        if (error || !data) {
            throw new Error("Failed to retrieve patient data.");
        }

        // Check if cid is retrieved
        if (!data.cid) {
            throw new Error("CID not available for the patient.");
        }

        const ipfsLink = `https://gateway.pinata.cloud/ipfs/${data.cid}`;

        // Update fetch timestamp and set is_cid_fetched to true
        const { error: updateError } = await supabase
            .from("details")
            .update({
                is_cid_fetched: true,
                cid_fetched_at: new Date().toISOString(),
            })
            .eq("id", uniqueId);

        if (updateError) {
            throw new Error("Failed to update CID fetch status.");
        }
        

        // Log operation
        const { error: logError } = await supabaseAdmin.from("logs").insert({
            patient_id: patientsuid,
            hospital_id: signerAddress,
            operation: "Fetched patient CID",
            created_at: new Date().toISOString(),
        });
        
        if (logError) {
            console.error("Error inserting into logs:", logError.message);
        }
        
        res.status(200).json({ ipfsLink });
        
    } catch (error) {
        console.error("Error fetching CID:", error.message);
        res.status(500).json({ error: "Failed to fetch CID." });
    }
});



app.get("/logs/search", async (req, res) => {
    const { hospitalAddress } = req.query;
  
    if (!hospitalAddress) {
      return res.status(400).send({ error: "Hospital address is required" });
    }
  
    try {
      // Fetch logs from the 'logs' table filtered by hospital_address
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("hospital_address", hospitalAddress);  // Replace with the actual column name in your table
  
      if (error) {
        throw error;
      }
  
      if (data.length === 0) {
        return res.status(404).send({ error: "No logs found for this hospital address" });
      }
  
      res.json(data);  // Return filtered logs for the given hospital address
    } catch (error) {
      console.error("Error searching logs:", error);
      res.status(500).send({ error: "Error searching logs" });
    }
  });


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
