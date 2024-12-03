// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Medamex {  

    // Events
    event HospitalRegistered(
        address indexed hospital, 
        string name, 
        string physicalAddress, 
        string mapLink
    );
    event PatientRegistered(address indexed patient, bool isRegistered, string folderCID);
    event PatientUnregistered(address indexed patient);
    event PatientCIDUpdated(address indexed patient, string newCID);
    event HospitalRevoked(address indexed hospital);

    // Constructor with versioning
    constructor() {
        admins[msg.sender] = true; // Set deployer as admin
    }

    // Modifiers
    modifier onlyAdmin() {
        require(admins[msg.sender], "Access Denied: Only Admin");
        _;
    }

    modifier onlyRegisteredHospital() {
        require(registeredHospitals[msg.sender].isRegistered, "Access Denied: Only Registered Hospitals");
        _;
    }

    modifier onlyAuthorized() {
        require(
            admins[msg.sender] || registeredHospitals[msg.sender].isRegistered,
            "Access Denied: Only Admin or Registered Hospital"
        );
        _;
    }

    // Struct for hospital details
    struct Hospital {
        bool isRegistered;
        string name;
        string physicalAddress;
        string mapLink;
    }

    // Mappings
    mapping(address => bool) public registeredPatients;
    mapping(address => string) public patientFolderCID; // Mapping for patient address to folder CID
    mapping(address => Hospital) public registeredHospitals; // Registered hospitals with details
    mapping(address => bool) public admins; // Admins
    uint256 public patientCount; // Counter for patient IDs
   
    // Register a new hospital (only by admin)
    function registerHospital(
        address _hospital, 
        string memory _name, 
        string memory _physicalAddress, 
        string memory _mapLink
    ) public onlyAdmin {
        require(!registeredHospitals[_hospital].isRegistered, "Hospital is already registered");

        registeredHospitals[_hospital] = Hospital({
            isRegistered: true,
            name: _name,
            physicalAddress: _physicalAddress,
            mapLink: _mapLink
        });

        emit HospitalRegistered(_hospital, _name, _physicalAddress, _mapLink);
    }

    // Admin registers a new patient
    function registerPatient(address _patient) public onlyAuthorized {
        require(!registeredPatients[_patient], "Patient is already registered");

        registeredPatients[_patient] = true;
        patientFolderCID[_patient] = "pending"; // Placeholder CID

        patientCount++;

        emit PatientRegistered(_patient, true, "pending");
    }

    // Admin unregisters a patient
    function unregisterPatient(address _patient) public onlyAdmin {
        require(registeredPatients[_patient], "Patient is not registered");

        // Remove patient from the mapping
        registeredPatients[_patient] = false;

        // Clear the patient's CID
        delete patientFolderCID[_patient];

        // Decrement the patient count
        if (patientCount > 0) {
            patientCount--;
        }

        emit PatientUnregistered(_patient);
    }

    function updatePatientCID(address _patient, string memory _newCID) public onlyAdmin {
        require(registeredPatients[_patient], "Patient not registered");
        patientFolderCID[_patient] = _newCID;

        emit PatientCIDUpdated(_patient, _newCID);
    }

    function revokeHospital(address _hospital) public onlyAdmin {
        require(registeredHospitals[_hospital].isRegistered, "Hospital is not registered");
        registeredHospitals[_hospital].isRegistered = false;
        emit HospitalRevoked(_hospital);
    }

    // Function to retrieve the CID for a registered patient by address
    function getPatientCID(address _patient) public view onlyAuthorized returns (string memory) {
        require(registeredPatients[_patient], "Patient is not registered");
        return patientFolderCID[_patient];
    }

    function getHospitalDetails(address _hospital) public view returns (
        bool isRegistered,
        string memory name,
        string memory physicalAddress,
        string memory mapLink
    ) {
        Hospital memory hospital = registeredHospitals[_hospital];
        require(hospital.isRegistered, "Hospital is not registered");
        return (
            hospital.isRegistered,
            hospital.name,
            hospital.physicalAddress,
            hospital.mapLink
        );
    }

    function isRegisteredHospital(address _hospital) public view returns (bool) {
        return registeredHospitals[_hospital].isRegistered;
    }

    function isAdmin(address _address) public view returns (bool) {
        return admins[_address];
    }
}
