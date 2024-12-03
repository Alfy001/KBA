const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MedamexModule", (m) => {
  const medexa = m.contract("Medamex"); // Ensure the contract name is correct

  return { medexa }; // This will expose your contract for deployment
});
