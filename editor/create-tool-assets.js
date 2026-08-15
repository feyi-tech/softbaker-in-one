const { mkdirSync } = require("fs")
const path = require("path")

const assetsFolderName = process.argv[2]

try {
    mkdirSync(path.join("public", "res/tools", assetsFolderName))
    mkdirSync(path.join("public", "res/tools", assetsFolderName, "1024"))
    mkdirSync(path.join("public", "res/tools", assetsFolderName, "728"))
    mkdirSync(path.join("public", "res/tools", assetsFolderName, "512"))

    console.log("Folders created")
} catch(e) {
    console.log("Folders creation error: ", e.message)
}