const { setDeployed, getDeployed, saveAbiToWeb, getAbiPaths } = require("../functions");
const { networks } = require("../truffle-config")
const path = require("path");

/*
const network = "Testnet"
const address = "0x7c17e1AFF887c528489A01E6aDdB67B35D87fDd3"
const abiPaths = getAbiPaths(network, "WalletFactory", [
  path.join(__dirname, `../../src/abis/{abiName}{network}.json`),
  path.join(__dirname, `../../server/src/abis/{abiName}{network}.json`)
]);

// Get the current date and time in a readable format
const currentTime = new Date().toLocaleString();

for (let index = 0; index < abiPaths.length; index++) {
  saveAbiToWeb(abiPaths[index], "WalletFactory", (abiAll) => {
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

const WalletFactory = artifacts.require("WalletFactory");

const walletCreator = "0xB2bbc2D8278768b4E497735C6b59013dDe15C109";

module.exports = function (deployer, network) {
  deployer.deploy(WalletFactory, walletCreator).then(() => {
    var address = WalletFactory.address;
    // save the token address into a file for the next deployed contract to use for deployment
    setDeployed(`WalletFactory-${network}`, address);

    const abiPaths = getAbiPaths(network, "WalletFactory", [
      path.join(__dirname, `../../src/abis/{abiName}{network}.json`),
      path.join(__dirname, `../../server/src/abis/{abiName}{network}.json`)
    ]);

    // Get the current date and time in a readable format
    const currentTime = new Date().toLocaleString();

    for (let index = 0; index < abiPaths.length; index++) {
      saveAbiToWeb(abiPaths[index], "WalletFactory", (abiAll) => {
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
  });
};