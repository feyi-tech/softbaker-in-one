const { setDeployed, getDeployed, saveAbiToWeb, getAbiPaths } = require("../functions");
const { networks } = require("../truffle-config")
const path = require("path");

const CoinDistributorWithLocker = artifacts.require("CoinDistributorWithLocker");

module.exports = function (deployer, network) {
  deployer.deploy(CoinDistributorWithLocker).then(() => {
    var address = CoinDistributorWithLocker.address;
    // save the token address into a file for the next deployed contract to use for deployment
    setDeployed(`CoinDistributorWithLocker-${network}`, address);

    const abiPaths = getAbiPaths(network, "CoinDistributorWithLocker", [
      path.join(__dirname, `../../src/abis/{abiName}{network}.json`),
      path.join(__dirname, `../../server/src/abis/{abiName}{network}.json`)
    ]);

    // Get the current date and time in a readable format
    const currentTime = new Date().toLocaleString();

    for (let index = 0; index < abiPaths.length; index++) {
      saveAbiToWeb(abiPaths[index], "CoinDistributorWithLocker", (abiAll) => {
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