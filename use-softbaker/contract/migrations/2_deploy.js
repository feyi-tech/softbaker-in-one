const { existsSync } = require("fs");
const { setDeployed, getDeployed, saveAbiToWeb, getAbiPaths } = require("../functions");
const { networks } = require("../truffle-config")
const path = require("path")

/*
const network = "Testnet"
const address = "0x9aD046b27ddb52517D47D7606E7d742aB1c23295"
const abiPaths = getAbiPaths(network, "Wallet", [
  path.join(__dirname, `../../src/abis/{abiName}{network}.json`),
  path.join(__dirname, `../../server/src/abis/{abiName}{network}.json`)
]);

// Get the current date and time in a readable format
const currentTime = new Date().toLocaleString();

for (let index = 0; index < abiPaths.length; index++) {
  saveAbiToWeb(abiPaths[index], "Wallet", (abiAll) => {
    var abiShort = {
      rpcUrl: networks[network].rpcUrl,
      chainId: networks[network].chainId,
      address: address,
      timestamp: currentTime, // Include the timestamp
      network,
      contractName: abiAll.contractName,
      abi: abiAll.abi
    };
    return abiShort;
  });
  
}
*/


const Wallet = artifacts.require("Wallet");

module.exports = function (deployer, network) {
  deployer.deploy(Wallet)
  .then(() => {
    var address = Wallet.address
    //save the token address into file for the next deployed contract to use for deployment
    setDeployed(`Wallet-${network}`, address)

    const abiPaths = getAbiPaths(network, "Wallet", [
      path.join(__dirname, `../../src/abis/{abiName}{network}.json`),
      path.join(__dirname, `../../server/src/abis/{abiName}{network}.json`)
    ]);

    // Get the current date and time in a readable format
    const currentTime = new Date().toLocaleString();

    for (let index = 0; index < abiPaths.length; index++) {
      saveAbiToWeb(abiPaths[index], "Wallet", (abiAll) => {
        var abiShort = {
          rpcUrl: networks[network].rpcUrl,
          chainId: networks[network].chainId,
          address: address,
          timestamp: currentTime, // Include the timestamp
          network,
          contractName: abiAll.contractName,
          abi: abiAll.abi
        };
        return abiShort;
      });
      
    }

  })
}