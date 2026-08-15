const Decimal = require('decimal.js');
const { default: Web3 } = require('web3');

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

module.exports = {
    weiToEther,
    bigIntToBigDecimal,
    isEthAddress
};