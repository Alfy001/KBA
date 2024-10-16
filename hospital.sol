// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract HospitalRecords {
    address admin;

    // Events
    event PatientRegistered(address indexed patient, bool isRegistered);
    event RecordUpdated(address indexed patient, string ipfsHash, address updatedBy);

    // Constructor
    constructor() {
        admin = msg.sender;
        admins[admin] = true; // Set contract deployer as admin
    }

    // Modifiers
    modifier onlyAdmin() {
        require(admins[msg.sender], "Access Denied: Only Admin");
        _;
    }

    modifier onlyRegisteredHospital() {
        require(registeredHospitals[msg.sender], "Access Denied: Only Registered Hospitals");
        _;
    }

    // Mappings
    mapping(address => bool) public registeredPatients;
    mapping(address => bool) public registeredHospitals;
    mapping(address => string) public patientRecords;  // IPFS CIDs for each patient's medical record
    mapping(address => bool) public admins;

    // New mapping to track hospitals that updated each patient's record
    mapping(address => address[]) public patientEditHistory;  // Track which hospitals updated a patient's record

    // Admins can add new hospitals
    function registerHospital(address _hospital) public onlyAdmin {
        registeredHospitals[_hospital] = true;
    }

    // Hospitals register patients with a default first page
    function registerPatient(address _patient, string memory _initialCID) public onlyRegisteredHospital {
    require(!registeredPatients[_patient], "Patient is already registered");
    registeredPatients[_patient] = true;
    patientRecords[_patient] = _initialCID; // Store IPFS CID for the default first page
    emit PatientRegistered(_patient, true);
    } 


    // Function to update the first page or add a new page
    function updatePatientRecord(address _patient, string memory _newCID, bool isFirstPage) public onlyRegisteredHospital {
        require(registeredPatients[_patient], "Patient is not registered");

        // Hospitals can modify the first page or append a new page
        if (isFirstPage) {
            // Edit the first page (allow modification)
            patientRecords[_patient] = _newCID;  // Update with the new CID (for the first page)
        } else {
            // Append a new page to the record (add new CID)
            patientRecords[_patient] = _newCID;  // Append new page (new CID of the updated PDF)
        }

        // Add the hospital to the patient's edit history
        patientEditHistory[_patient].push(msg.sender);  // Log the hospital that made the update

        emit RecordUpdated(_patient, _newCID, msg.sender);  // Include hospital address in the event
    }

    // Function for admin to retrieve a patient's record update history (list of hospitals)
    function getPatientEditHistory(address _patient) public view onlyAdmin returns (address[] memory) {
        return patientEditHistory[_patient];
    }

    // Retrieve the current medical record (IPFS CID)
    function getPatientRecord(address _patient) public view returns (string memory) {
        return patientRecords[_patient];
    }
}
