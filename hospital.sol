// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract HospitalRecords {
    address admin;

    // Events
    event PatientRegistered(address indexed patient, bool isRegistered, string initialCID);
    event FirstPageUpdated(address indexed patient, string ipfsHash, address updatedBy);
    event NewPageAdded(address indexed patient, string ipfsHash, address addedBy);

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
    mapping(address => string) firstPageRecord; // IPFS CID for the first page of patient's record
    mapping(address => address)  firstPageHospital; // Track which hospital updated the first page
    mapping(address => string[])  patientAdditionalPages; // IPFS CIDs for additional pages
    mapping(address => address[]) pageHospitals; // Track which hospital added each additional page
    mapping(address => bool) admins;

    // Register a new hospital (only by admin)
    function registerHospital(address _hospital) public onlyAdmin {
        registeredHospitals[_hospital] = true;
    }

    // Admin registers a new patient with a default first page
    function registerPatient(address _patient, string memory _initialCID) public onlyAdmin {
        require(!registeredPatients[_patient], "Patient is already registered");

        registeredPatients[_patient] = true;
        firstPageRecord[_patient] = _initialCID; // Automatically set first page with default CID
        firstPageHospital[_patient] = address(0); // No hospital has edited yet

        emit PatientRegistered(_patient, true, _initialCID);
    }

    // Function to update the first page (only hospitals can edit, but not add the first page)
    function updateFirstPage(address _patient, string memory _newCID) public onlyRegisteredHospital {
        require(registeredPatients[_patient], "Patient is not registered");

        firstPageRecord[_patient] = _newCID; // Update the first page IPFS CID
        firstPageHospital[_patient] = msg.sender; // Track which hospital edited the first page

        emit FirstPageUpdated(_patient, _newCID, msg.sender);
    }

    // Add a new page to the patient's record (any registered hospital can add a new page)
    function addNewPage(address _patient, string memory _newCID) public onlyRegisteredHospital {
        require(registeredPatients[_patient], "Patient is not registered");

        patientAdditionalPages[_patient].push(_newCID); // Append new page (new IPFS CID)
        pageHospitals[_patient].push(msg.sender); // Track which hospital added this page

        emit NewPageAdded(_patient, _newCID, msg.sender);
    }

    // Retrieve the first page (IPFS CID)
    function getFirstPage(address _patient) public view returns (string memory) {
        return firstPageRecord[_patient];
    }

    // Retrieve all additional pages (IPFS CIDs)
    function getAdditionalPages(address _patient) public view returns (string[] memory) {
        return patientAdditionalPages[_patient];
    }

    // Retrieve which hospitals added the additional pages
    function getPageHospitals(address _patient) public view onlyAdmin returns (address[] memory) {
        return pageHospitals[_patient];
    }
}
