const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Reference to Firestore
const db = admin.firestore();

// Array of wallets data
const wallets = [
    {
      "salt": "40PUbH6RX3f2o9KWYMmUs9kIIot2",
      "wei": "35570780000000000"
    },
    {
      "salt": "4HdssEeaErXTPge0GQbkX5KgICz2",
      "wei": "11350440000000000"
    },
    {
      "salt": "4wzGQdh7UcZlOGqmK8hmqi4E20d2",
      "wei": "22541730000000000"
    },
    {
      "salt": "5v5ArbpubDOQcZbDKqbtGteeK9b2",
      "wei": "10795050000000000"
    },
    {
      "salt": "5y9JD8ZfxBW0httwr70FuSemJ572",
      "wei": "10814680000000000"
    },
    {
      "salt": "6BA4vkj1aGMWmxf7dsAqqxA1SEd2",
      "wei": "65315600000000000"
    },
    {
      "salt": "6gm5jE1EJjWaCJrvkAlSfC16zpF3",
      "wei": "14361590000000000"
    },
    {
      "salt": "6uNS8smS6GXPy9qb30SHS4YnCBE2",
      "wei": "20108150000000000"
    },
    {
      "salt": "AFIPcKXUVBPMaPuXjTXzQvHUD662",
      "wei": "11486610000000000"
    },
    {
      "salt": "AuGL9TDzcidBAlnHl57pstwVimj1",
      "wei": "44856000000000000"
    },
    {
      "salt": "AwOTINAAWsbxFMy9mhnbUmdBpgH3",
      "wei": "11376450000000000"
    },
    {
      "salt": "BGNKiYOdAPON7EeiTBm2PI4Lphw1",
      "wei": "19378490000000000"
    },
    {
      "salt": "BuTX9duD45ZKizFkQYdg0Ze8NgN2",
      "wei": "60730780000000000"
    },
    {
      "salt": "G8WBEvJRHghdWwFMslTcBIAdg043",
      "wei": "11372050000000000"
    },
    {
      "salt": "H6DoqH9d72b0gKaLokuowlJaazF2",
      "wei": "8301760000000000"
    },
    {
      "salt": "HjXureZT1zQuXo5Sutj5CAWMg8A3",
      "wei": "24473000000000000"
    },
    {
      "salt": "I74qr9kwgyW3817bMybGoxTLvY53",
      "wei": "11534040000000000"
    },
    {
      "salt": "KgUoOoYZTqSMNLEFMKbMuvWOCTk1",
      "wei": "35710990000000000"
    },
    {
      "salt": "KjihT5eFxvVBcIhHsS0ZsTvmVV02",
      "wei": "10565840000000000"
    },
    {
      "salt": "LtjoikeInVY9CaIFIxoAJSs4boG2",
      "wei": "37061000000000000"
    },
    {
      "salt": "O0shw4wnunbHPTAcAoL2mJ3tiGz1",
      "wei": "10450000000000000"
    },
    {
      "salt": "Ol3ZOKVYYSWVFbuz5PpGpQovtxI2",
      "wei": "11500380000000000"
    },
    {
      "salt": "PQXAeqfaCpZEnmLQptgLgPtXxUu2",
      "wei": "53757240000000000"
    },
    {
      "salt": "QeF98fbx0XXfIhzSbRYyPSQCcrL2",
      "wei": "44361240000000000"
    },
    {
      "salt": "ROH0f726l3XVbtQjaoNYhGcE3Ej1",
      "wei": "19712880000000000"
    },
    {
      "salt": "SmtbKB2WzQXror2L2095cREMBHF3",
      "wei": "10209600000000000"
    },
    {
      "salt": "VyX7a3JQCIhFKIBe6SvgVjyAHN52",
      "wei": "11933500000000000"
    },
    {
      "salt": "WOU8RRjidQdFkijWJx9b83433ZG3",
      "wei": "33482810000000000"
    },
    {
      "salt": "WZUZXOVC44eLR3m8g38Grb48sZm2",
      "wei": "8662770000000000"
    },
    {
      "salt": "WkesrpZckdYMuOP1t4eryk6r0Sr2",
      "wei": "11808180000000000"
    },
    {
      "salt": "ZbScJi1LFYgayqoyliWHpG64Fo83",
      "wei": "18100000000000000"
    },
    {
      "salt": "a5CxB12qLogFkX6gaOSApAuKTv33",
      "wei": "10528140000000000"
    },
    {
      "salt": "fGq6xtDLFwXzGyGXTlI3Jdffh262",
      "wei": "41411670000000000"
    },
    {
      "salt": "gcGo4M7iDhfQMp2W6X0qx3fJQZa2",
      "wei": "12400000000000000"
    },
    {
      "salt": "gm7T75nnOlb90uuf71RanzkndG82",
      "wei": "11298480000000000"
    },
    {
      "salt": "h0Sj3SDaj1OhYjyMik8okMnpWZg2",
      "wei": "11134000000000000"
    },
    {
      "salt": "iBjcqu4tPRasL5gEHXam9TkZ5fn1",
      "wei": "41762120000000000"
    },
    {
      "salt": "jWYBBNf4DgfIfZdP73oYEOyzaes2",
      "wei": "151057850000000000"
    },
    {
      "salt": "k17xKU7lcYPzmArMbtgZXjd6PxV2",
      "wei": "20786740000000000"
    },
    {
      "salt": "kPLpho9UAUYvxkOD4y5nPMLQtHE3",
      "wei": "10831000000000000"
    },
    {
      "salt": "naG9bjHs6ROCxKxkg4SapTkgLXC2",
      "wei": "50994340000000000"
    },
    {
      "salt": "njMaWTAyaRNLr33xFGiSGMBEWOh2",
      "wei": "35708090000000000"
    },
    {
      "salt": "pMRg4efUnGQA1kes2SrLC2DfHa23",
      "wei": "11330320000000000"
    },
    {
      "salt": "q4HCZzIvCjNh6XZYVFvhsjOWuPT2",
      "wei": "12342210000000000"
    },
    {
      "salt": "r4OuFday1bUlimPwQcJoQlrb23z1",
      "wei": "11312980000000000"
    },
    {
      "salt": "rck6MvR9X9dcxLRqFmuACwy6E7j1",
      "wei": "22715650000000000"
    },
    {
      "salt": "uj1XWahnuAXoDQ6rDeXILdUffEr1",
      "wei": "37478990000000000"
    },
    {
      "salt": "vE4oKAgXlagxb8k2jCgESiZOQ342",
      "wei": "12017500000000000"
    },
    {
      "salt": "w66VBzYLULhbuoWoNFNR8p1Oxg52",
      "wei": "30588440000000000"
    },
    {
      "salt": "w6VBnxttEkSUb4AzIntAHybSSFA2",
      "wei": "90478390000000000"
    },
    {
    "salt": "wJCTY613odSLJNVFGzH4UpubXuL2",
    "wei": "13722420000000000"
    },
    {
    "salt": "wKoI6n5ZOOT8t1KtsHwEBlzpYwP2",
    "wei": "86590780000000000"
    },
    {
    "salt": "xFu0OvqjoZe01iVrytm7wCEx2zJ2",
    "wei": "9624950000000000"
    },
    {
    "salt": "xfyIvRe5Amcr1YuqkDqPV9ICHjl1",
    "wei": "53393000000000000"
    },
    {
    "salt": "y2J3vwaGw2YiWDOmiHyeuWGHZbx1",
    "wei": "11993640000000000"
    },
    {
    "salt": "yyDnfYuhopNRGwqDZKNfqeCxcp23",
    "wei": "11199700000000000"
    },
    {
    "salt": "yyNi1RhAtOeSLmhtnCWoKG97gMY2",
    "wei": "18801490000000000"
    }
]

// Function to update bnb_contract_created using batch write
const updateBnbContractCreated = async () => {
    const batch = db.batch(); // Create a batch instance

    // Iterate over each wallet to create a batch update
    wallets.forEach(wallet => {
        const walletRef = db.collection('wallets').doc(wallet.salt);
        batch.update(walletRef, { bnb_contract_created: true });
    });

    // Commit the batch
    await batch.commit();
    console.log('Batch update committed successfully');
};

// Run the update function
updateBnbContractCreated().catch(err => console.error('Error updating documents: ', err));
