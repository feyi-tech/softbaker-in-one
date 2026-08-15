const FieldValue = require('firebase-admin').firestore.FieldValue;
const { default: axios } = require('axios');
const { PRICE_DATA_TTL_MINUTES } = require('./utils/c');
const { FieldsData, Fields } = require('softbaker-svg')

const getCoinsPrices = async (admin) => {

    // Reference to the firestore document at cache/price_list
    const priceListDocRef = admin.firestore().doc('cache/price_list');
  
    try {
      // Attempt to fetch the price data from the cache
      const cacheSnapshot = await priceListDocRef.get();
  
      if (cacheSnapshot.exists) {
        // If the cache document exists, check the TTL
        const cacheData = cacheSnapshot.data();
        const currentTime = new Date().getTime();
        const ttlExpiration = cacheData.last_update.toMillis() + (cacheData.ttl_minutes || PRICE_DATA_TTL_MINUTES) * 60 * 1000;
  
        if (currentTime < ttlExpiration) {
          // If the cache is still valid, return the cached price data
          return cacheData;
        }
      }
  
      // Fetch the current price from the Coingecko API if the cache is not available or expired
      const priceData = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,ethereum&vs_currencies=usd'
      );
  
      // Create or update the cache document with the new price data, TTL, and last_update
      const priceDataForDoc = {
        last_update: FieldValue.serverTimestamp()
      }
      for(const key of Object.keys(priceData.data)) {
        priceDataForDoc[`${key}_usd`] = priceData.data[key].usd
      }
      //console.log("priceData.data: ", priceData.data, priceDataForDoc)
      if(!cacheSnapshot.exists) priceDataForDoc.ttl_minutes = PRICE_DATA_TTL_MINUTES
      // Use set with merge option to create or update the document
      await priceListDocRef.set(priceDataForDoc, { merge: true });
  
      // Return the fetched price data
      return priceDataForDoc;
    } catch (error) {
      throw new Error('Error fetching coin price: ' + error.message, );
    }
};

const getCoinBalanceKey = (coin, suffix) => {
  //example return: bnb_balance_in_coin or bnb_balances
  return `${coin}${suffix? `_${suffix}` : "_balance"}`.toLowerCase();
}

const getDirectivesValues = (data, fields) => {
  if(!data) return []
  const directivesValues = []

  for(const [key, value] of Object.entries(data)) {
    const { name, type } = splitSvgElementId(key)
    const { directive } = splitElementNameWithDirective(name || "")
    if(directive) directivesValues.push(valueOfParseValue(key, value, data, fields))
  }

  return directivesValues
}

module.exports = {
  getCoinsPrices,
  getCoinBalanceKey, getDirectivesValues
}