const Decimal = require('decimal.js');
const { default: Web3 } = require('web3');
const { CHAINS_RPC_LISTS } = require('./c');

function weiToEther(bigIntValue, decimalPlaces, precision) {
    const bigDecimalValue = new Decimal(bigIntValue.toString());
    return Number(bigDecimalValue.div(new Decimal(10).pow(decimalPlaces)).toNumber().toPrecision(precision));
}

function bigIntToBigDecimal(bigIntValue) {
    return new Decimal(bigIntValue.toString());
}

function isEthAddress(address) {
    try {
        return Web3.utils.toChecksumAddress(address)
    } catch(e) { 
        return false
    }
}

const callWeb3Func = async (coin, lastWeb3, cb) => {
    const list = CHAINS_RPC_LISTS[coin];

    if(lastWeb3) {
        try {
            var result = await cb(lastWeb3); // Call the callback function with the current Web3 instance
            return [lastWeb3, result]; // Return the Web3 instance and result if successful
        } catch (error) {
        }
    }

    // Try each RPC URL in the list
    for (let i = 0; i < list.length; i++) {
        const rpc = list[i];
        try {
            var web3 = new Web3(rpc);
            var result = await cb(web3); // Call the callback function with the current Web3 instance
            return [web3, result]; // Return the Web3 instance and result if successful
        } catch (error) {
            // If an error occurs, log the RPC that failed and continue with the next one
            console.error(`Error with RPC ${rpc}:`, error);
            if (i === list.length - 1) {
                // If all RPCs have been tried, throw the error
                throw new Error(error?.message || 'All RPCs failed');
            }
        }
    }
};

module.exports = {
    weiToEther,
    bigIntToBigDecimal,
    isEthAddress,
    callWeb3Func
};