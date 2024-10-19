# HospitalRecords Smart Contract

## Project Summary
The HospitalRecords smart contract is designed to manage patient records on the Ethereum blockchain. This contract allows hospitals to register patients, update their medical records, and add new pages to their records. It ensures that only authorized hospitals can update or add information, maintaining the integrity and confidentiality of patient data.

## Features
- **Patient Registration:** Admins can register new patients with an initial medical record stored on IPFS.
- **Hospital Registration:** Admins can register hospitals, granting them permission to update and add patient records.
- **First Page Update:** Registered hospitals can update the first page of a patient's medical record.
- **Add New Pages:** Registered hospitals can add additional pages to a patient's medical record.
- **Record Retrieval:** Anyone can retrieve the first page and additional pages of a patient's medical record using their address.

## Contract Functions
### Admin Functions
- `registerHospital(address _hospital)`: Register a new hospital.
- `registerPatient(address _patient, string memory _initialCID)`: Register a new patient with an initial IPFS CID for their medical record.

### Hospital Functions
- `updateFirstPage(address _patient, string memory _newCID)`: Update the first page of a patient's record.
- `addNewPage(address _patient, string memory _newCID)`: Add a new page to a patient's record.

### View Functions
- `getFirstPage(address _patient)`: Retrieve the first page of a patient's record.
- `getAdditionalPages(address _patient)`: Retrieve all additional pages of a patient's record.
- `getPageHospitals(address _patient)`: Retrieve which hospitals added the additional pages (only accessible by admins).

## Events
- `PatientRegistered(address indexed patient, bool isRegistered, string initialCID)`: Emitted when a new patient is registered.
- `FirstPageUpdated(address indexed patient, string ipfsHash, address updatedBy)`: Emitted when the first page of a patient's record is updated.
- `NewPageAdded(address indexed patient, string ipfsHash, address addedBy)`: Emitted when a new page is added to a patient's record.

## Prerequisites
- Solidity ^0.8.26

## Setup Instructions
1. Clone the repository:
   ```sh
   git clone https://github.com/Alfy001/KBA.git
   ```
