
const MAX_LOGIN_AGE_MILLIS = 60 * 30 * 1000//30 minutes
const TX = {
    credits: [
        "Client Payment",
        "Product Sales",
        "Service Revenue",
        "Investment Income",
        "Dividend Receipt",
        "License Fees",
        "Interest Income",
        "Raw Material Sales",
        "Equipment Rental Income",
        "Consulting Fees",
        "Insurance Claim Settlement",
        "Research and Development Grants",
        "Product Returns and Refunds",
        "Training Program Fees",
        "Legal Settlement Receipt",
        "Supplier Rebates",
        "Software License Sales",
        "Real Estate Lease Income",
        "Advertising Revenue",
        "Product Packaging Income",
        "Equipment Leasing Income",
        "Trade Show Participation Income",
        "Donation Receipt",
        "Asset Sale Proceeds",
        "Freight and Logistics Income",
        "Employee Benefits Recovery",
        "IT System Licensing Revenue",
        "Conference Sponsorship Income",
        "Royalty Receipts",
        "Software Development Contract Income",
        "Merchandise Sales",
        "Employee Travel Reimbursement",
        "Supplier Incentive Income",
        "Building Rental Income",
        "Marketing Research Revenue",
        "Product Recall Compensation",
        "Pension Plan Contribution Receipt",
        "Stock Options Exercised",
        "Intellectual Property Licensing Income",
        "Office Furniture Sale",
        "Environmental Compliance Reimbursement"
    ],
    debits: [
        "Office Equipment Purchase",
        "Vendor Payment",
        "Renovation Expenses",
        "Marketing Campaign Costs",
        "Inventory Restocking",
        "Software License Renewal",
        "Employee Bonuses",
        "Raw Material Acquisition",
        "Equipment Maintenance",
        "Utilities Payment",
        "Travel Expenses Reimbursement",
        "Professional Services Fees",
        "Insurance Premium Payment",
        "Research and Development Costs",
        "Freight and Shipping Charges",
        "Legal Fees",
        "Supplier Payments",
        "IT Infrastructure Upgrade",
        "Facility Rent",
        "Advertising Expenses",
        "Product Packaging Costs",
        "Equipment Leasing",
        "Trade Show Participation Fees",
        "Charity Donation",
        "Asset Purchase",
        "Freight and Logistics Costs",
        "Employee Benefits",
        "IT Security System Upgrade",
        "Conference Participation Fees",
        "Licensing Fees",
        "Software Development Costs",
        "Merchandise Returns and Refunds",
        "Supplier Discounts",
        "Building Repairs",
        "Marketing Research Expenses",
        "Product Recall Costs",
        "Employee Pension Contributions",
        "Environmental Compliance Costs",
        "Product Sales Revenue",
        "Service Revenue",
        "Investment Income",
        "Dividend Receipt",
        "License Fees Income",
        "Interest Income",
        "Consulting Fees Income",
        "Insurance Claim Settlement Income",
        "Research and Development Grants Income",
        "Training Program Fees Income",
        "Legal Settlement Receipt",
        "Supplier Rebates Income"
    ]
}
const CARD_ALIASES = [
    "Silver Swift",
    "Blue Wave",
    "Golden Glide",
    "Sapphire Swipe",
    "Platinum Pulse",
    "Diamond Dart",
    "Crimson Charge",
    "Emerald Edge",
    "Ruby Rush",
    "Azure Axis"
]
const CARD_TYPES = [
    "Visa Debit",
    "Mastercard Debit"
]
// Generate a random 4-digit number
function getRandomXDigitsNumber(totalDigits, seed) {
    if(!seed) seed = Math.random()
    const power = Math.pow(10, totalDigits - 1)
    return Math.floor(power + seed * (9 * power));
}

const jsTimestamp = (fbTimestamp) => {
    const timeValues = Object.values(fbTimestamp)
    //console.log("jsTimestamp.2 ", fbTimestamp, timeValues)
    return timeValues[0] * 1000 + Math.round(timeValues[1] / 1e6);
}

/**
 * 
 * When you create a Date object with a timestamp argument in JavaScript, 
 * it always interprets the timestamp as the number of milliseconds since the Unix epoch (January 1, 1970, 00:00:00 UTC). 
 * The timestamp is always in UTC (GMT) regardless of the user's local timezone.

    However, when you call methods like toString(), toLocaleString(), or similar on the Date object, 
    it will format and display the date in the user's local timezone.

    So no need to pass a localized timestamp
 */
function formatTimestampToDate(timestamp) {
    const date = new Date(timestamp);
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}
function formatTimestampToTime(timestamp) {
    const date = new Date(timestamp);
  
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `${hours}:${minutes}`;
}

function getRandomRangeNoSeed(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getAccountBalance = (user) => {
    if(!user) return 0
    return ((user.accountBalance || 0) + (user.totalCredits || 0)) - (user.totalDebits || 0)
}

function convertToFraction(number) {
    if (typeof number !== 'number') {
      throw new Error('Invalid input. Please provide a valid number.');
    }
  
    const maxValue = Math.pow(10, Math.ceil(Math.log10(Math.abs(number))));
  
    return Math.min(Math.max(number / maxValue, 0), 1);
}

function getRandomRange(seed, min, max) {
    return Math.floor(seed * (max - min + 1)) + min;
}

// Generate a random 4-digit number
function getRandomXDigitsNumber(totalDigits, seed) {
    if(!seed) seed = Math.random()
    const power = Math.pow(10, totalDigits - 1)
    return Math.floor(power + seed * (9 * power));
}

function deterministicRand(seed, index) {
    index = index + 1
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
  
    // Ensure that the seed and index are non-negative integers
    seed = Math.abs(Math.floor(seed)) % m;
    index = Math.abs(Math.floor(index)) % m;
  
    // Calculate the deterministic random number using an updated formula
    let result = seed;
  
    for (let i = 0; i < index; i++) {
      result = (a * result + c) % m;
    }
  
    return result;
}

function getRandomTransactionType(seed) {
  
    // Determine the transaction type based on the random value
    const transactionType = seed < 0.7 ? "credit" : "debit";
  
    return transactionType;
}

function generateTypeTransactions(type, typeDescriptions, seed, balance, totalTransactions) {
    const transactions = [];
  
    
    for (let index = 0; index < totalTransactions; index++) {
      const rand = deterministicRand(seed, index)
      const balanceToSpend = balance * 0.95
      const maxBalancePerTx = balanceToSpend / totalTransactions
      const amountMin = (maxBalancePerTx / 3)
      const amount = getRandomRange(convertToFraction(rand), amountMin, maxBalancePerTx);
      const tx = typeDescriptions[rand % typeDescriptions.length]
  
      transactions.push({
        index: index,
        type: type,
        description: tx,
        amount: amount, // Debit transactions have negative amounts
      });
    }
  
    return transactions;
}

function mergeArrays(a, b) {
    if(b.length == 0) return a 
    var result = a.concat(b)
    return result.slice(0, b.length) 
}

function mergeTransactionsInOrder(credits, debits) {
    // Merge transactions from both objects into a single array
    const allTransactions = [...credits, ...debits];
    
    // Sort the transactions based on the timestamp field in ascending order
    allTransactions.sort((a, b) => a.timestamp - b.timestamp);
    
    return allTransactions;
}

// Function to parse the item
const parseItem = (item) => {
    const parts = item.split(',');
    var amount = parts[0].trim();
    if(amount == "v2") {
        amount = parts[1].trim()
        const completeStatus = parts[parts.length - 1].trim();
        const processingDuration = parts[parts.length - 2].trim();
        const timestamp = parts[parts.length - 3].trim();

        // Join the middle parts for description
        const description = parts.slice(2, -3).join(',').trim();

        return { amount, description, timestamp, processingDuration, completeStatus };

    } else {
        const timestamp = parts[parts.length - 1].trim();

        // Join the middle parts for description
        const description = parts.slice(1, -1).join(',').trim();

        return { amount, description, timestamp, processingDuration: "immediately", completeStatus: "Successful" };
    }
}

function getAllTransactions(user, creditAndDebitDescriptions, totalTransactions, timestamp) {
    //console.log("jsTimestamp: ", timestamp)
    const seed =  user.accountNumber_username
    const balance = user.accountBalance
    
    let credits
    let debits

    if(user.noTxGeneration || user.accountBalance == 0) {
        credits = []
    
        debits = []

    } else {
        credits = generateTypeTransactions(
            "credit", creditAndDebitDescriptions["credits"], seed + 101, balance, totalTransactions, timestamp
        )
    
        debits = generateTypeTransactions(
            "debit", creditAndDebitDescriptions["debits"], seed + 301, balance, totalTransactions, timestamp
        )
    }


    const all = []

    var nextCreditUpdate = 0; var nextDebitUpdate = 0
    var lastTimeStamp = timestamp
    

    if(credits.length > 0 && debits.length > 0) {
        for (let index = 0; index < totalTransactions * 2; index++) {
            const rand = deterministicRand(seed, index)
            const type = getRandomTransactionType(convertToFraction(rand));
      
            lastTimeStamp -= ((rand * Math.pow(10, 7)) % (60 * 60 * 24 * 7 * 1000))
    
            if(index < totalTransactions) {
                if(type === "credit") {
                    credits[nextCreditUpdate].timestamp = lastTimeStamp
                    all.push({
                        ...credits[nextCreditUpdate],
                        index
                    })
                    nextCreditUpdate++
    
                } else {
                    debits[nextDebitUpdate].timestamp = lastTimeStamp
                    all.push({
                        ...debits[nextDebitUpdate],
                        index
                    })
                    nextDebitUpdate++
                }
    
            } else if(nextCreditUpdate < totalTransactions) {
                credits[nextCreditUpdate].timestamp = lastTimeStamp
                nextCreditUpdate++
    
            } else {
                debits[nextDebitUpdate].timestamp = lastTimeStamp
                nextDebitUpdate++
            }
        }
    }
    
    const serverCreditsRaw = user.credits || []
    const serverDebitsRaw  = user.debits  || []
    const serverCredits    = []
    const serverDebits     = []

    for(const credit of serverCreditsRaw) {
        const { amount, description, timestamp, processingDuration, completeStatus } = parseItem(credit)
        serverCredits.push({
            index: 0,
            type: "credit",
            amount: amount.trim(), // Debit transactions have negative amounts
            description: description,
            timestamp: parseInt(timestamp),
            completeStatus,
            processingDuration
        })
    }
    for(const debit of serverDebitsRaw) {
        const { amount, description, timestamp, processingDuration, completeStatus } = parseItem(debit)
        serverDebits.push({
            index: 0,
            type: "debit",
            amount: amount, // Debit transactions have negative amounts
            description: description,
            timestamp: parseInt(timestamp),
            completeStatus,
            processingDuration
        })
    }

    const serverAll = mergeTransactionsInOrder(serverCredits, serverDebits)

    serverCredits.reverse()
    serverDebits.reverse()
    serverAll.reverse()

    return { 
        credits: mergeArrays(serverCredits, credits), 
        debits: mergeArrays(serverDebits, debits), 
        all: mergeArrays(serverAll, all) 
    }

}


const buildCards = (user) => {
    const cards = []
    const cardsRand = deterministicRand(user.accountNumber_username, 1)
    const totalCards = getRandomRange(convertToFraction(cardsRand), 1, 3);
    var aliasIndex = cardsRand % CARD_ALIASES.length
    //console.log(`cardsRand: ${cardsRand} | totalCards: ${totalCards} | aliasIndex: ${aliasIndex}`)
    for (let index = 0; index < totalCards; index++) {
        const rand = deterministicRand(cardsRand, index)
        const mathRand = convertToFraction(rand)
        //console.log(`rand: ${rand} | mathRand: ${mathRand}`)

        const alias = CARD_ALIASES[aliasIndex % CARD_ALIASES.length]
        const info = getRandomXDigitsNumber(4, mathRand)
        const balance = user.accountBalance == 0? 0 : getRandomRange(mathRand, 5000, 20000);
        const type = CARD_TYPES[rand % CARD_TYPES.length]
        aliasIndex++
    
        cards.push({ alias, info, balance, type, cashback: 0});
    }

    //console.log("cards: ", cards)

    return cards
}

function getUser(dontRedirect) {
    var user = localStorage.getItem("user")
    var user_tx = localStorage.getItem("user_tx")
    if(user && user_tx) {
        user = JSON.parse(user)
        if(Date.now() > user.expires) {
            localStorage.removeItem("user")
            localStorage.removeItem("user_tx")
            localStorage.setItem(`is_freemium_${user.accountNumber_username}`, user.is_freemium)
            user = null

        } else {
            user = user.data
            user_tx = JSON.parse(user_tx)
            user.credits_transactions = user_tx.credits
            user.debits_transactions = user_tx.debits
            user.all_transactions = user_tx.all
            user.cards = buildCards(user)
        }
    }
    if(!user && !dontRedirect) {
        location.href = "/online/login"
        return
    }
    return user
}

function setUser(data) {
    return new Promise((resolve, reject) => {
        localStorage.setItem("user", JSON.stringify({
            expires: Date.now() + MAX_LOGIN_AGE_MILLIS,
            data: data
        }))
        //Remove the transactions created before going premium
        if(localStorage.getItem(`is_freemium_${data.accountNumber_username}`) && !data.is_freemium) {
            localStorage.removeItem(`debits_info_${data.accountNumber_username}`)
        }
        
        const transactions = getAllTransactions(
            data,
            TX,
            10, 
            jsTimestamp(data.createdAt),
        )
        //console.log("txxx:", transactions)
        localStorage.setItem("user_tx", JSON.stringify(transactions))
        resolve()
    })
}

function updateUserData(newData) {
    var user = localStorage.getItem("user")
    if(user) {
        user = JSON.parse(user)
        user = {
            expires: user.expires,
            data: {
                ...user.data,
                ...newData
            }
        }
        localStorage.setItem("user", JSON.stringify(user))
    }
}

const getTxStatus = (
    currentTime,
    txTime,
    processingDuration,
    completeStatus
  ) => {
    //Version 1 transactions don't have pending processing feature. So they always resolve immediately to success
    if(!processingDuration || !completeStatus) return "Successful"
    // If processingDuration is "immediately", return completeStatus
    if (processingDuration === "immediately") {
      return completeStatus;
    }
  
    // Function to convert a processing duration string to milliseconds
    const convertToMilliseconds = (duration) => {
      const regex = /^(\d+)([smhdwMy])$/; // Regex to extract number and unit (s, m, h, d, w, M, y)
      const match = duration.match(regex);
  
      if (!match) {
        throw new Error("Invalid processing duration format");
      }
  
      const value = parseInt(match[1], 10); // Extract the number (e.g. 5, 10)
      const unit = match[2]; // Extract the unit (e.g. s, m, h, etc.)
  
      switch (unit) {
        case "s":
          return value * 1000; // Convert seconds to milliseconds
        case "m":
          return value * 60 * 1000; // Convert minutes to milliseconds
        case "h":
          return value * 60 * 60 * 1000; // Convert hours to milliseconds
        case "d":
          return value * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        case "w":
          return value * 7 * 24 * 60 * 60 * 1000; // Convert weeks to milliseconds
        case "M":
          return value * 30 * 24 * 60 * 60 * 1000; // Convert months to milliseconds (approx. 30 days)
        case "y":
          return value * 365 * 24 * 60 * 60 * 1000; // Convert years to milliseconds (approx. 365 days)
        default:
          throw new Error("Unknown time unit");
      }
    };
  
    // Convert the processingDuration to milliseconds
    const processingTimeMs = convertToMilliseconds(processingDuration);
  
    // Calculate when the transaction should complete
    const completeTime = txTime + processingTimeMs;
  
    // Compare currentTime with the completeTime
    return currentTime < completeTime ? "Pending" : completeStatus;
};

function txStatusToValue(status, valueMap) {
    return valueMap[status || ""] || ""
}
function getTxHtmlRows(user, txList) {
    if(!txList || txList.length == 0) {
        return [`<div class="mt-2">No transaction</div>`]
    }

    const currentTime = Date.now()
    return txList.map((tx, index) => `
    <tr>
        <td>${index + 1}</td>
        <td>
            <div class="td-content product-invoice"><span>${tx.type === "debit"? "-" : ""}${user.currencySymbol.split("_")[2].trim()}</span>${Math.round(tx.amount)}</div>
        </td>
        <td>
            <div class="td-content product-brand text-primary"><span class="text-cap ${tx.type === "debit"? "text-danger" : "text-success"}">${tx.type}</span></div>
        </td>
        <td>
            <div class="td-content product-invoice">${tx.description}</div>
        </td>
        <td>
            <div class="td-content product-invoice">${formatTimestampToDate(tx.timestamp)}</div>
        </td>
        <td>
            <div class="td-content pricing"><span class="">${formatTimestampToTime(tx.timestamp)}</span></div>
        </td>
        <td>
            <div class="td-content"><span class=""><span class="badge ${txStatusToValue(getTxStatus(currentTime, tx.timestamp, tx.processingDuration, tx.completeStatus), {Pending: "outline-badge-primary", Successful: "outline-badge-success", Failed: "outline-badge-danger"})} shadow-none col-md-12">${ getTxStatus(currentTime, tx.timestamp, tx.processingDuration, tx.completeStatus) }</span></span></div>
        </td>
    </tr>`)
}

function getCardHtmlRows(user, cards) {
    if(!cards || cards.length == 0) {
        return [`<div class="mt-2">No Cards</div>`]
    }
    return cards.map((card, index) => `
    <tr class="card-row">
        <td>${index + 1}</td>
        <td>
            <div class="td-content product-invoice">${card.alias}</div>
        </td>
        <td>
            <div class="td-content product-brand text-primary view-card">
                <div>
                    <i class="fa fa-credit-card"></i>
                    <span>••••</span>
                    <span>${card.info}</span>
                </div>
            </div>
        </td>
        <td>
            <div class="td-content product-invoice">${user.currencySymbol.split("_")[2].trim()}${card.balance.toLocaleString("en", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </td>
        <td>
            <div class="td-content product-invoice">${user.currencySymbol.split("_")[2].trim()}${card.cashback.toLocaleString("en", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </td>
        <td>
            <div class="td-content pricing">${card.type}</div>
        </td>
    </tr>
    <tr class="card-row">
        <td>
            <div class="td-content product-brand text-primary view-card">View Card <i class="fa fa-chevron-right"></i></div>
        </td>
        <td>
            <div class="td-content product-brand text-primary"></div>
        </td>
        <td>
            <div class="td-content product-invoice"></div>
        </td>
        <td>
            <div class="td-content product-invoice"></div>
        </td>
        <td>
            <div class="td-content pricing"></div>
        </td>
        <td>
            <div class="td-content pricing"></div>
        </td>
    </tr>`)
}

function updateUserTx() {
    return new Promise((resolve, reject) => {
        const data = getUser()
        const transactions = getAllTransactions(
            data,
            TX,
            10, 
            jsTimestamp(data.createdAt),
        )
        //console.log("txxx:", transactions)
        localStorage.setItem("user_tx", JSON.stringify(transactions))
        
        resolve()
    })
}

function delUser(user) {
    localStorage.removeItem("user")
    localStorage.removeItem("user_tx")
    localStorage.setItem(`is_freemium_${user.accountNumber_username}`, user.is_freemium)
}

function nullOrEmpty(data) {
    return !data || data.length == 0
}

const limitedTx = (txList, maxLength) => {
    return txList.slice(0, maxLength);
}
const notifications = user => `${
    limitedTx(user.all_transactions, 4).map((tx, index) => `
    <div class="notification-scroll">
        <div class="dropdown-item">
            <div class="media ">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-activity"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                <div class="media-body">
                    <div class="data-info">
                        <h6 class=""><span class="${tx.type === "debit"? "text-danger" : "text-success"}">${tx.type} [Alert]</span></h6>
                        <p class="">${tx.type === "debit"? "-" : ""}${user.currencySymbol.split("_")[2].trim()}${Math.round(tx.amount)}</p>
                    </div>

                    <div class="icon-status">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>                                        
                    </div>
                </div>
            </div>
        </div>

    </div>`).join('')
}`

const MENU_TO_HIDE = [
    "/online/user/deposit",
    "/online/user/deposit-transaction",
    "/online/user/domestic-transfer",
    "/online/user/wire-transfer",
    "/online/user/loan"
]

function getDomain() {
    const domain = document.location.hostname
    // Split the domain string by periods (.)
    var parts = domain.split('.');
    var name = ''

    // Check if the domain has at least two parts (e.g., example.com)
    name = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`
    return name
}
function getDomainName() {
    const domain = getDomain()
    // Split the domain string by periods (.)
    var parts = domain.split('.');
    var name = domain.split(".")[0]

    return `${name.substring(0, 1).toUpperCase()}${name.substring(1)}`
}

function copyright() {
    // Get the current year
    const currentYear = new Date().getFullYear();

    // Set the copyright text with the dynamic year
    const copyrightElement = document.getElementById("copyright");
    if (copyrightElement) {
        copyrightElement.textContent = `Copyright © 2021 - ${currentYear} ${getDomainName()}, All rights reserved.`;
    }
    try {
        var user = getUser()
        if(!user || !user?.all_transactions) return
        document.querySelector("#tx-notifications").innerHTML = notifications(user);

    } catch(e) {}

    const removeTrailingSlash = (link) => {
        if(link.endsWith("/")) return link.substring(0, link.length - 1)
        return link
    }
    try {
        const currentPath = removeTrailingSlash(window.location.pathname);
        //console.log("currentPath: ", currentPath)

        // Remove "active" class from all <li> elements
        const menuItems = document.querySelectorAll('#accordionExample li');
        menuItems.forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('a');
            if(link && MENU_TO_HIDE.includes(removeTrailingSlash(link.getAttribute('href')))) {
                try {
                    item.classList.add("d-none");
                } catch(e) {
                }
            }
        });

        // Add "active" class to the <li> whose <a> element's href matches the current page
        const matchingItem = Array.from(menuItems).find(item => {
            const link = item.querySelector('a');
            //console.log("currentPath:link ", link, ul)
            return (link && removeTrailingSlash(link.getAttribute('href')) === currentPath);
        });

        // Add "active" class to the <li> whose <a> element's href matches the current page
        const matchingItemUl = Array.from(menuItems).find(item => {
            const ul = item.querySelector('ul');
            //console.log("currentPath:link ", link, ul)
            return (ul && ul.innerHTML.includes(currentPath));
        });
    
        if (matchingItem) {
            matchingItem.classList.add('active');
        }

        if (matchingItemUl) {
            matchingItemUl.classList.add('active');
        }

    } catch(e) {
        //console.log("currentPath:e ", e.message)
    }

    try {
        document.querySelector("#logout").addEventListener("click", () => {
            Swal.fire({
                type: "warning",
                title: "Logout",
                text: "Are you sure you want to logout?",
                showCancelButton: true
            })
            .then(result => {
                if(result.value) {
                    var user = getUser()
                    delUser(user)
                    location.href = "/online/login"
                }
            })
        })
    } catch(e) {
        //console.log("currentPath:e ", e.message)
    }
}

function bulkProfileTextSetup(user, attrs) {
    for(const attr of attrs) {
        try {
            // Get all elements with inner text "loading name"
            const elements = document.querySelectorAll(`.${attr.class}`);
            console.log("Error.elements: ", elements)
            // Replace their text content with "John"
            elements.forEach(element => {
                try {
                    element.textContent = attr.onData? attr.onData(user[attr.dataKey]) : user[attr.dataKey];
                } catch(e) {
                    console.log("Error.textContent: ", e)
                }
                try {
                    element.value = attr.onData? attr.onData(user[attr.dataKey]) : user[attr.dataKey];
                } catch(e) {
                    console.log("Error.value: ", e)
                }
            });
        } catch(e) {}
    }
}
function bulkHide(user, attrs) {
    for(const attr of attrs) {
        try {
            // Get all elements with inner text "loading name"
            const elements = document.querySelectorAll(`.${attr.class}`);
            // Replace their text content with "John"
            elements.forEach(element => {
                if(attr.onData(user[attr.dataKey])) {
                    try {
                        element.classList.add("d-none");
                    } catch(e) {
                        //console.log(`bulkHide.${attr.dataKey}.error: `, attr.class, user[attr.dataKey], attr.onData(user[attr.dataKey]), e.message)
                    }

                } else {
                    try {
                        element.classList.remove("d-none");
                    } catch(e) {
                        //console.log(`bulkHide.${attr.dataKey}.error: `, attr.class, user[attr.dataKey], attr.onData(user[attr.dataKey]), e.message)
                    }
                }
            });
        } catch(e) {}
    }
}

function bulkShow(user, attrs) {
    for(const attr of attrs) {
        try {
            // Get all elements with inner text "loading name"
            const elements = document.querySelectorAll(`.${attr.class}`);
            // Replace their text content with "John"
            elements.forEach(element => {
                if(attr.onData(user[attr.dataKey])) {
                    try {
                        element.classList.add("d-block");
                    } catch(e) {
                        //console.log(`bulkHide.${attr.dataKey}.error: `, attr.class, user[attr.dataKey], attr.onData(user[attr.dataKey]), e.message)
                    }

                } else {
                    try {
                        element.classList.remove("d-block");
                    } catch(e) {
                        //console.log(`bulkHide.${attr.dataKey}.error: `, attr.class, user[attr.dataKey], attr.onData(user[attr.dataKey]), e.message)
                    }
                }
            });
        } catch(e) {}
    }
}

function updateTxTable(user, clear) {
    try {
        const allTx = document.getElementById("all_transactions");
        if (allTx) {
            allTx.innerHTML = getTxHtmlRows(user, user.all_transactions).join("")
        }
        if(clear) allTx.innerHTML = ""

    } catch(e) {
        console.log("updateTxTable:all.error ", e)
    }

    try {
        const allTx = document.getElementById("credit_transactions");
        if (allTx) {
            allTx.innerHTML = getTxHtmlRows(user, user.credits_transactions).join("")
        }
        if(clear) allTx.innerHTML = ""

    } catch(e) {
        console.log("updateTxTable:credit.error ", e)
    }

    try {
        const allTx = document.getElementById("debit_transactions");
        if (allTx) {
            allTx.innerHTML = getTxHtmlRows(user, user.debits_transactions).join("")
        }
        if(clear) allTx.innerHTML = ""

    } catch(e) {
        console.log("updateTxTable:debit.error ", e)
    }
}

var simulateReactUpdateInterval;
function simulateReactUpdate() {
    if(!simulateReactUpdateInterval) {
        //alert("Simulation started!")
        const user = getUser(true)
        console.log("simulateReactUpdate:user1 ", user)
        if(user) {
            localStorage.setItem("userInfoAtLastUpdate", JSON.stringify({
                location: window.location.href,
                user: user
            }))
            updateTxTable(user)
            simulateReactUpdateInterval = setInterval(() => {
                const user2 = getUser(true)
                console.log("simulateReactUpdate:user2 ", user2)
                if(user2) {
                    const userInfoAtLastUpdate = JSON.parse(localStorage.getItem("userInfoAtLastUpdate") || "{}")
                    if(
                        userInfoAtLastUpdate.location != window.location || 
                        !userInfoAtLastUpdate.user || JSON.stringify(user2) != JSON.stringify(userInfoAtLastUpdate.user)) {
                        localStorage.setItem("userInfoAtLastUpdate", JSON.stringify({
                            location: window.location.href,
                            user: user2
                        }))
                        updateTxTable(user2)
                    }
                }
            }, 3000);
        }
    }
}

function setUpProfile() {
    updateUserTx()
    .then(() => {
        const user = getUser()

        try {
            // Get all images with src "/assets/auth/images/no-profile-photo.png"
            const images = document.querySelectorAll('img[src="/assets/auth/images/no-profile-photo.png"]');
            const imageSrc = !nullOrEmpty(user.profilePhoto)? user.profilePhoto : "/assets/auth/images/no-profile-photo.png"
            images.forEach(image => {
                image.src = imageSrc;
            });

        } catch(e) {}

        try {
            // Get all images with src "/assets/auth/images/no-profile-photo.png"
            const cover = document.querySelector('.user-cover-image');
            const totalImages = 1
            const imageIndex = (parseInt(user.accountNumber_username) % totalImages) + 1
            cover.setAttribute("style", `background: url('/assets/auth/images/cover-image-${imageIndex}.jpg') center center / cover no-repeat;`)

        } catch(e) {

        }

        const textCap = (data) => {
            return `${data.substring(0,1).toUpperCase()}${data.substring(1)}`
        }
        
        const getLoan = () => {
            return (0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2})
        }
        bulkProfileTextSetup(user, [
            { class: 'account-name', dataKey: 'fullname'},
            { class: 'account-type', dataKey: 'accountType', onData: textCap },
            { class: 'account-number', dataKey: 'accountNumber_username'},
            { class: 'account-address', dataKey: 'address'},
            { class: 'account-dob', dataKey: 'dob'},
            { class: 'account-email', dataKey: 'email'},
            { class: 'account-gender', dataKey: 'gender', onData: textCap },
            { class: 'account-marital-status', dataKey: 'maritalStatus', onData: textCap },
            { class: 'account-occupation', dataKey: 'occupation'},
            { class: 'account-phone', dataKey: 'phone'},
            { class: 'w-currency', dataKey: 'currencySymbol', onData: value => value.split("_")[2].trim()},
            { class: 'account-balance', dataKey: 'accountBalance', onData: value => {
                return (((value || 0) + (user.totalCredits || 0)) - (user.totalDebits || 0)).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2})
            }},
            { class: 'account-credits', dataKey: 'accountBalance', onData: (accountBalance) => {
                if((accountBalance || 0) == 0 && (user.totalCredits || 0) == 0) return 0
                return (
                    (((accountBalance * 12.47) * 30) / 100) + 
                    (user.totalCredits || 0)
                ).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2})
            } },
            { class: 'account-debits', dataKey: 'accountBalance', onData: (accountBalance) => {
                if((accountBalance || 0) == 0 && (user.totalDebits || 0) == 0) return 0
                return (
                    (((accountBalance * 5.31) * 30) / 100) + 
                    (user.totalDebits || 0)
                ).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2})
            } },
            { class: 'account-loans', dataKey: 'accountBalance', onData: getLoan },/*
            { class: 'account-watermark-new', dataKey: 'is_freemium', onData: (is_freemium) => {
                if(is_freemium) return 'This is a fake bank account!!!'
                return ""
            }}*/
        ])
        bulkShow(user, [
            { class: 'account-watermark-new', dataKey: 'is_freemium', onData: (value) => value }
        ])
        bulkHide(user, [
            { class: 'on-hold-button', dataKey: 'disableAccount', onData: (value) => !value }
        ])

        try {
            document.getElementById("messageDropdown").classList.add("d-none");
        } catch(e) {}

        //updateTxTable(user)
        simulateReactUpdate()

        try {
            const allTx = document.getElementById("cards_list");
            if (allTx) {
                allTx.innerHTML = getCardHtmlRows(user, user.cards).join("")
            }

        } catch(e) {}

        try {
            const allTx = document.getElementById("loan_transactions");
            if (allTx) {
                allTx.innerHTML = getTxHtmlRows(user, []).join("")
            }

        } catch(e) {}

        try {
            document.querySelector("#download-statement").addEventListener('click', () => {
                const u = getUser()
                if(!u) return
                $('#downloadStatementModal').modal('show');
            });

            document.querySelector("#statement-download-submit").addEventListener('click', () => {
                // Validation passed, proceed with the download request
                const btn = document.querySelector("#statement-download-submit")
                if(btn.innerText != "Download") return

                //data-date-format="yyyy-mm-dd"
                const from = document.querySelector("#startDate").value
                const to = document.querySelector("#endDate").value
                //console.log("Dates => From: ", from, " | To: ", to)
        
                // Validate the start date and end date
                if (!from || !to) {
                    Swal.fire({
                        type: "error",
                        title: "Statement Error",
                        text: "Please select both start date and end date."
                    });
                    return;
                }
                
                let startDate;
                let endDate;
                try {
                    // Convert the date strings to Date objects
                    startDate = new Date(from);
                    endDate = new Date(to);

                } catch(e) {
                    Swal.fire({
                        type: "error",
                        title: "Statement Error",
                        text: "Please provide valid start date and end date."
                    });
                    return
                }
        
                //console.log("Statement download requested for the period:", startDate, "to", endDate);
                
                // Check if the start date is before the end date
                if (startDate >= endDate) {
                    Swal.fire({
                        type: "error",
                        title: "Statement Error",
                        text: "End date must be greater than the start date."
                    });
                    return;
                }
                
                btn.innerText = "Please wait..."
                btn.setAttribute("style", "font-style: italic;opacity: 0.4;cursor:not-allowed")
                setTimeout(() => {
                    btn.innerText = "Download"
                    btn.setAttribute("style", "")
                    $('#downloadStatementModal').modal('hide');
                    Swal.fire({
                        type: "success",
                        title: "Statement Request",
                        text: "Your statment of account within the selected time frame will be sent to your email address as a PDF soon. Use the last 6 digits of your last issued credit or debit card as the password to open the PDF."
                    });
                }, getRandomRangeNoSeed(1000, 3000));
                
            });

        } catch(e) {}

        try {
            $(".view-card").click(() => {
                try {
                    $("#cardAuthenticationModal").modal('show')

                } catch(e) {}
            })

            $("#view-card-submit").click((e) => {
                try {
                    if(e.target.innerText != "View Card") return

                    const value = document.getElementById('card-digits').value
                    console.log("value: ", value)
                    if(!value || isNaN(value)) {
                        Swal.fire({
                            type: "error",
                            title: "View Permission Error",
                            text: "Please enter the last 10 digits of the card."
                        })
                        return
                    }

                    if(value.length != 10) {
                        Swal.fire({
                            type: "error",
                            title: "View Permission Error",
                            text: "The number of digits entered must be 10."
                        })
                        return
                    }

                    e.target.innerText = "Please wait..."
                    e.target.setAttribute("style", "font-style: italic;opacity: 0.4;cursor:not-allowed")
                    setTimeout(() => {
                        e.target.innerText = "View Card"
                        e.target.setAttribute("style", "")
                        Swal.fire({
                            type: "error",
                            title: "View Permission Error",
                            text: "No card exists with the number entered."
                        })
                    }, getRandomRangeNoSeed(2000, 3000));
                    console.log("view-card-submit: ", e.target.innerText)

                } catch(e) {}
            })
        } catch(e) {
            console.log(e.message)
        }

        copyright()
    })
    .catch(e => {
        console.log("setProfile.error: ", e)
    })
    
}

const checkLoginSession = () => {
    setTimeout(() => {
        getUser()
        checkLoginSession()
    }, 5000)
}
var App = function() {
    var MediaSize = {
        xl: 1200,
        lg: 992,
        md: 991,
        sm: 576
    };
    var ToggleClasses = {
        headerhamburger: '.toggle-sidebar',
        inputFocused: 'input-focused',
    };

    var Selector = {
        mainHeader: '.header.navbar',
        headerhamburger: '.toggle-sidebar',
        fixed: '.fixed-top',
        mainContainer: '.main-container',
        sidebar: '#sidebar',
        sidebarContent: '#sidebar-content',
        sidebarStickyContent: '.sticky-sidebar-content',
        ariaExpandedTrue: '#sidebar [aria-expanded="true"]',
        ariaExpandedFalse: '#sidebar [aria-expanded="false"]',
        contentWrapper: '#content',
        contentWrapperContent: '.container',
        mainContentArea: '.main-content',
        searchFull: '.toggle-search',
        overlay: {
            sidebar: '.overlay',
            cs: '.cs-overlay',
            search: '.search-overlay'
        }
    };

    var categoryScroll = {
        scrollCat: function() {
            var sidebarWrapper = document.querySelectorAll('.sidebar-wrapper [aria-expanded="true"]')[0];
            var sidebarWrapperTop = sidebarWrapper.offsetTop - 20;
            setTimeout(function(){ $('.menu-categories').animate({ scrollTop: sidebarWrapperTop }, 500); }, 500);
        }
    }

    var toggleFunction = {
        sidebar: function($recentSubmenu) {
            $('.sidebarCollapse').on('click', function (sidebar) {
                sidebar.preventDefault();
                getSidebar = $('.sidebar-wrapper');
                    console.log('drill 1')
                if ($recentSubmenu === true) {
                    console.log('drill 2')
                    if ($('.collapse.submenu').hasClass('show')) {
                        console.log('drill 3')
                        $('.submenu.show').addClass('mini-recent-submenu');
                        getSidebar.find('.collapse.submenu').removeClass('show');
                        getSidebar.find('.collapse.submenu').removeClass('show');
                        $('.collapse.submenu').parents('li.menu').find('.dropdown-toggle').attr('aria-expanded', 'false');
                    } else {
                        console.log('drill 4')
                        if ($(Selector.mainContainer).hasClass('sidebar-closed')) {
                            console.log('drill 5')
                            if ($('.collapse.submenu').hasClass('recent-submenu')) {
                                getSidebar.find('.collapse.submenu.recent-submenu').addClass('show');
                                $('.collapse.submenu.recent-submenu').parents('.menu').find('.dropdown-toggle').attr('aria-expanded', 'true');
                                $('.submenu').removeClass('mini-recent-submenu');
                            console.log('drill 6')

                            } else {
                                $('li.active .submenu').addClass('recent-submenu');
                                getSidebar.find('.collapse.submenu.recent-submenu').addClass('show');
                                $('.collapse.submenu.recent-submenu').parents('.menu').find('.dropdown-toggle').attr('aria-expanded', 'true');
                                $('.submenu').removeClass('mini-recent-submenu');
                            console.log('drill 7')
                            }
                        }
                    }
                        console.log('drill 2 end')
                }
                        console.log('end drill')
                $(Selector.mainContainer).toggleClass("sidebar-closed");
                $(Selector.mainHeader).toggleClass('expand-header');
                $(Selector.mainContainer).toggleClass("sbar-open");
                $('.overlay').toggleClass('show');
                $('html,body').toggleClass('sidebar-noneoverflow');
            });
        },
        onToggleSidebarSubmenu: function() {
            $('.sidebar-wrapper').on('mouseenter mouseleave', function(event) {
                event.preventDefault();
                if ($('body').hasClass('alt-menu')) {
                    if ($('.main-container').hasClass('sidebar-closed')) {
                        if (event.type === 'mouseenter') {
                            $('li .submenu').removeClass('show');
                            $('li.active .submenu').addClass('recent-submenu');
                            $('li.active').find('.collapse.submenu.recent-submenu').addClass('show');
                            $('.collapse.submenu.recent-submenu').parents('.menu').find('.dropdown-toggle').attr('aria-expanded', 'true');
                        } else if (event.type === 'mouseleave') {
                            $('li').find('.collapse.submenu').removeClass('show');
                            $('.collapse.submenu.recent-submenu').parents('.menu').find('.dropdown-toggle').attr('aria-expanded', 'false');
                            $('.collapse.submenu').parents('.menu').find('.dropdown-toggle').attr('aria-expanded', 'false');
                        }
                    }
                } else {
                    if ($('.main-container').hasClass('sidebar-closed')) {
                        if (event.type === 'mouseenter') {
                            $(this).find('.submenu.recent-submenu').addClass('show');
                            $('.collapse.submenu.recent-submenu').parents('.menu').find('.dropdown-toggle').attr('aria-expanded', 'true');
                        } else if (event.type === 'mouseleave') {
                            $(this).find('.submenu.recent-submenu').removeClass('show');
                            $('.collapse.submenu.recent-submenu').parents('.menu').find('.dropdown-toggle').attr('aria-expanded', 'false');
                        }
                    }

                }
            })
        },
        offToggleSidebarSubmenu: function () {
            $('.sidebar-wrapper').off('mouseenter mouseleave');
        },
        overlay: function() {
            $('#dismiss, .overlay, cs-overlay').on('click', function () {
                // hide sidebar
                $(Selector.mainContainer).addClass('sidebar-closed');
                $(Selector.mainContainer).removeClass('sbar-open');
                // hide overlay
                $('.overlay').removeClass('show');
                $('html,body').removeClass('sidebar-noneoverflow');
            });
        },
        search: function() {
            $(Selector.searchFull).click(function(event) {
               $(this).parents('.search-animated').find('.search-full').addClass(ToggleClasses.inputFocused);
               $(this).parents('.search-animated').addClass('show-search');
               $(Selector.overlay.search).addClass('show');
               $(Selector.overlay.search).addClass('show');
            });

            $(Selector.overlay.search).click(function(event) {
               $(this).removeClass('show');
               $(Selector.searchFull).parents('.search-animated').find('.search-full').removeClass(ToggleClasses.inputFocused);
               $(Selector.searchFull).parents('.search-animated').removeClass('show-search');
            });
        }
    }

    var inBuiltfunctionality = {
        mainCatActivateScroll: function() {
            const ps = new PerfectScrollbar('.menu-categories', {
                wheelSpeed:.5,
                swipeEasing:!0,
                minScrollbarLength:40,
                maxScrollbarLength:300
            });
        },
        preventScrollBody: function() {
            $('#sidebar').bind('mousewheel DOMMouseScroll', function(e) {
                var scrollTo = null;

                if (e.type == 'mousewheel') {
                    scrollTo = (e.originalEvent.wheelDelta * -1);
                }
                else if (e.type == 'DOMMouseScroll') {
                    scrollTo = 40 * e.originalEvent.detail;
                }

                if (scrollTo) {
                    e.preventDefault();
                    $(this).scrollTop(scrollTo + $(this).scrollTop());
                }
            });
        },
        languageDropdown: function() {
            var getDropdownElement = document.querySelectorAll('.more-dropdown.language-dropdown .dropdown-item');
            for (var i = 0; i < getDropdownElement.length; i++) {
                getDropdownElement[i].addEventListener('click', function() {
                    document.querySelectorAll('.more-dropdown.language-dropdown .dropdown-toggle > span')[0].innerText = this.getAttribute('data-value');
                    document.querySelectorAll('.more-dropdown .dropdown-toggle > img')[0].setAttribute('src', '../assets/img/' + this.getAttribute('data-img-value') + '.png' );
                })
            }
        },
        appsDropdown: function() {
            var getDropdownElement = document.querySelectorAll('.more-dropdown.apps-dropdown .dropdown-item');
            for (var i = 0; i < getDropdownElement.length; i++) {
                getDropdownElement[i].addEventListener('click', function(e) {

                    if (this.parentNode.classList.contains('dropdown-item-collapsable')) {
                        console.log('comnsos')
                        e.stopPropagation();
                        $('.custom-dropdown-icon .collapse').collapse('toggle')
                        $('.custom-dropdown-icon .dropdown-item-collapsable').toggleClass('show')
                    }
                    
                    document.querySelectorAll('.more-dropdown.apps-dropdown .dropdown-toggle > span')[0].innerText = this.getAttribute('data-value');
                })
            }
        }
    }

    /*
        Production Functionality - Only for Online files not for user files
    */
    var productionFunctionality = {
        createButtons: function() {
            var form = [
                {
                    type: 'anchor',
                    label: 'Buy Now',
                    target: '_blank'
                },
                {
                    type: 'button',
                    label: ''
                }
            ];
            
            var element = document.createElement("div");
            var wrapHtmlAttr = document.createAttribute("class");
            wrapHtmlAttr.value = "online-actions";
            element.style.cssText = "position: fixed;bottom: 43px;right: 21px;z-index: 1025;";
            element.setAttributeNode(wrapHtmlAttr);
            for (var i = 0; i < form.length; i++) {
                var obj = form[i];
                switch (obj.type) {
                    case "button":
                        var button = document.createElement('button');
                        var textButton = document.createTextNode(obj.label);
                        button.innerHTML = '<svg style="width: 15px; height: 15px; stroke-width: 2; vertical-align: middle;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-up"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
                        button.style.cssText = " margin-left: 6px;padding: 6px 9px; display: none; border: none;box-shadow: 0 10px 20px -10px #4801FF; background-image: linear-gradient(-225deg, #AC32E4 0%, #7918F2 48%, #4801FF 100%);";
                        button.classList.add('btn', 'btn-secondary', 'scroll-top-btn');
                        button.appendChild(textButton);
                        element.appendChild(button);
                        break;
            
                    case "anchor":
                        var anchor = document.createElement('a');
                        var textanchor = document.createTextNode(obj.label);
                        anchor.setAttribute('href',"https://themeforest.net/item/cork-responsive-admin-dashboard-template/25582188");
                        anchor.style.cssText = "border: none; background-image: linear-gradient(to right, #ff0844 20%, #ffb199 141%);box-shadow: 0 10px 20px -10px #ff0844;";
                        anchor.classList.add('btn', 'btn-danger', 'buy-btn');
                        anchor.target = obj.target;
                        anchor.appendChild(textanchor);
                        element.appendChild(anchor);
                        break;
                }
                var div = document.querySelector("body");
                div.appendChild(element);
            }
        },

        scrollTop: function() {
            $(document).on('click', '.scroll-top-btn', function(event) {
                event.preventDefault();
                var body = $("html, body");
                body.stop().animate({scrollTop:0}, 500, 'swing');
            });
        },

        checkScrollPosition: function() {
            $(document).scroll(function(event) {
                var lanWrapper = $('.layout-spacing');
                var elementScrollToTop = $('.scroll-top-btn');
                var windowScroll = $(window).scrollTop()
                var elementoffset = lanWrapper.offset().top;
            
                // Check if window scroll > or == element offset?
                if (windowScroll >= elementoffset) {
                elementScrollToTop.addClass('d-inline-block');
                } else if (windowScroll < elementoffset) {
                elementScrollToTop.removeClass('d-inline-block');
                }
            });
        }
    }
    
    var _mobileResolution = {
        onRefresh: function() {
            var windowWidth = window.innerWidth;
            if ( windowWidth <= MediaSize.md ) {
                categoryScroll.scrollCat();
                toggleFunction.sidebar();
            }
        },
        
        onResize: function() {
            $(window).on('resize', function(event) {
                event.preventDefault();
                var windowWidth = window.innerWidth;
                if ( windowWidth <= MediaSize.md ) {
                    toggleFunction.offToggleSidebarSubmenu();
                }
            });
        }
        
    }

    var _desktopResolution = {
        onRefresh: function() {
            var windowWidth = window.innerWidth;
            if ( windowWidth > MediaSize.md ) {
                categoryScroll.scrollCat();
                toggleFunction.sidebar(true);
                toggleFunction.onToggleSidebarSubmenu();
            }
        },
        
        onResize: function() {
            $(window).on('resize', function(event) {
                event.preventDefault();
                var windowWidth = window.innerWidth;
                if ( windowWidth > MediaSize.md ) {
                    toggleFunction.onToggleSidebarSubmenu();
                }
            });
        }
        
    }

    function sidebarFunctionality() {
        function sidebarCloser() {

            if (window.innerWidth <= 991 ) {


                if (!$('body').hasClass('alt-menu')) {

                    $("#container").addClass("sidebar-closed");
                    $('.overlay').removeClass('show');
                } else {
                    $(".navbar").removeClass("expand-header");
                    $('.overlay').removeClass('show');
                    $('#container').removeClass('sbar-open');
                    $('html, body').removeClass('sidebar-noneoverflow');
                }

            } else if (window.innerWidth > 991 ) {

                if (!$('body').hasClass('alt-menu')) {

                    $("#container").removeClass("sidebar-closed");
                    $(".navbar").removeClass("expand-header");
                    $('.overlay').removeClass('show');
                    $('#container').removeClass('sbar-open');
                    $('html, body').removeClass('sidebar-noneoverflow');
                } else {
                    $('html, body').addClass('sidebar-noneoverflow');
                    $("#container").addClass("sidebar-closed");
                    $(".navbar").addClass("expand-header");
                    $('.overlay').addClass('show');
                    $('#container').addClass('sbar-open');
                    $('.sidebar-wrapper [aria-expanded="true"]').parents('li.menu').find('.collapse').removeClass('show');
                }
            }

        }

        function sidebarMobCheck() {
            if (window.innerWidth <= 991 ) {

                if ( $('.main-container').hasClass('sbar-open') ) {
                    return;
                } else {
                    sidebarCloser()
                }
            } else if (window.innerWidth > 991 ) {
                sidebarCloser();
            }
        }

        sidebarCloser();

        $(window).resize(function(event) {
            sidebarMobCheck();
        });

    }

    return {
        init: function() {
            toggleFunction.overlay();
            toggleFunction.search();
            /*
                Desktop Resoltion fn
            */
            _desktopResolution.onRefresh();
            _desktopResolution.onResize();

            /*
                Mobile Resoltion fn
            */
            _mobileResolution.onRefresh();            
            _mobileResolution.onResize();

            sidebarFunctionality();

            /*
                In Built Functionality fn
            */
            inBuiltfunctionality.mainCatActivateScroll();
            inBuiltfunctionality.preventScrollBody();
            inBuiltfunctionality.languageDropdown();
            inBuiltfunctionality.appsDropdown();

            /*
                Production Functionality - Only for Online files not for user files
            */
            // productionFunctionality.createButtons();
            // productionFunctionality.scrollTop();
            // productionFunctionality.checkScrollPosition();
        }
    }
}();