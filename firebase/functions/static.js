const axios = require('axios');
/*
require("dotenv").config({
    path: "./.env"
})*/
const { 
    getFontFamiliesFromSVG, generateFontMap, getDefaultFieldsValue, 
    downloadSvgAsImage, getSvg, 
    reduceBase64Image,
    getUrlUpdatesCount,
    arrayToMap,
    removeUpdateQueryString
} = require('softbaker-svg');//require('../../softbaker-svg/dist/main.cjs');//
const { saveBase64ToR2 } = require('./storage');
const { defineString } = require('firebase-functions/params');
const { FILE_FIELD_TYPES_DEFUALT_FILES } = require('./utils/defaultFiles');

const ENV_R2_S3_ACCESS_KEY_ID = defineString('ENV_R2_S3_ACCESS_KEY_ID');//{value: () => process.env.ENV_R2_S3_ACCESS_KEY_ID}// 
const ENV_R2_S3_SECRET_ACCESS_KEY = defineString('ENV_R2_S3_SECRET_ACCESS_KEY');//{value: () => process.env.ENV_R2_S3_SECRET_ACCESS_KEY}// 
const ENV_R2_S3_ENDPOINT = defineString('ENV_R2_S3_ENDPOINT');//{value: () => process.env.ENV_R2_S3_ENDPOINT}// 
const ENV_R2_BUCKET = defineString('ENV_R2_BUCKET');//{value: () => process.env.ENV_R2_BUCKET}// 
const ENV_R2_CUSTOM_DOMAIN = defineString('ENV_R2_CUSTOM_DOMAIN');//{value: () => process.env.ENV_R2_CUSTOM_DOMAIN}//

/**
 * Converts an object into a base64-encoded JSON data URL.
 *
 * @param {Object} obj - The object to be converted.
 * @returns {string} - A data URL containing the base64-encoded JSON.
 */
function objectToBase64JsonDataUrl(obj) {
    // Convert the object to a JSON string.
    const jsonString = JSON.stringify(obj);
    
    let base64;
    // Check if running in Node.js where Buffer is available.
    if (typeof Buffer !== 'undefined') {
      base64 = Buffer.from(jsonString).toString('base64');
    } else if (typeof btoa !== 'undefined') {
      // For browsers, encode using btoa after encoding the string as UTF-8.
      base64 = btoa(unescape(encodeURIComponent(jsonString)));
    } else {
      throw new Error('No method available to perform base64 encoding.');
    }
    
    // Return the data URL.
    return `data:application/json;base64,${base64}`;
}  

function templatesIdFromUrl(url) {
    const match = url.match(/templates-([a-z0-9]+)-/i);
    return match ? match[1] : null;
}

async function getThumbnail(template, templateData) {
    // Placeholder implementation: Replace with actual logic to generate or fetch thumbnail URL
    // For now, just return the logo as a fallback
    let svg
    if(!template?.data_url) {
        console.log("NoTemplateUrl:", template)
        return ""
    }
    const templatesId = templatesIdFromUrl(template.data_url)
    if(!templatesId) return ""

    try {
        const {
            defaultFieldsData
        } = getDefaultFieldsValue({}, templateData.fields, template.id, null, null)

        if(templatesId == "eqbc6hkv") {
            console.log("check:2.svg.result", template.id, defaultFieldsData, typeof templateData.svg === "string"? `HasSvg:${templateData.svg.length}` : "noSvg")
        }

        if(typeof templateData.svg !== "string") throw Error("templateData.svg is empty");
        const fontsFamily = await getFontFamiliesFromSVG(templateData.svg);
        const fonts = await generateFontMap(ENV_R2_CUSTOM_DOMAIN.value(), fontsFamily);

        console.log("check:2.svg.result.fonts", fonts);
        
        svg = await getSvg(ENV_R2_CUSTOM_DOMAIN.value(), defaultFieldsData, templateData, fonts, false, 512, null, FILE_FIELD_TYPES_DEFUALT_FILES)
        
        if(svg) {
            let jpeg = await downloadSvgAsImage(svg, "jpeg", "download", template.split_on_download? "front" : template.split_on_download_hr? "front_hr": undefined)
            const jpegbk = jpeg
            const resizeWidth = !template.split_on_download && !template.split_on_download_hr? 256 : 0
            jpeg = await reduceBase64Image(jpeg, resizeWidth, 0.7)
            if(!jpeg.startsWith("data:image/")) {
                console.log("invimg:", jpeg, jpegbk == jpeg, template, jpegbk.substring(0, 50))
            }
            
            var pathUrl = `templates/tools-${templatesId}-${template.id}-thumbnail.jpg`
            await saveBase64ToR2(jpeg, pathUrl, ENV_R2_BUCKET.value(), ENV_R2_S3_ACCESS_KEY_ID.value(), ENV_R2_S3_SECRET_ACCESS_KEY.value(), ENV_R2_S3_ENDPOINT.value())
            
            // Save svg 
            /*
            var pathUrlSvg = `templates/tools-${templatesId}-${template.id}-thumbnail.svg`
            const buffer = Buffer.from(svg, 'utf-8');
            svgUrl = `data:image/svg+xml;base64,${buffer.toString('base64')}`;
            await saveBase64ToR2(svgUrl, pathUrlSvg, ENV_R2_BUCKET.value(), ENV_R2_S3_ACCESS_KEY_ID.value(), ENV_R2_S3_SECRET_ACCESS_KEY.value(), ENV_R2_S3_ENDPOINT.value())
            */

            pathUrl = `https://r2.softbaker.com/${pathUrl}`
            const updates = getUrlUpdatesCount(template.data_url);
            if(updates == 1 && !template.data_url.includes("updates=")) {
                return pathUrl

            } else {
                const urlObj = new URL(pathUrl);
                urlObj.searchParams.set('updates', updates);
                return urlObj.toString();
            }
        }
        throw new Error(`Failed to parse svg for template ${template.id} of tool ${toolId}`)

    } catch(e) {
        console.log("check:2.svg.error", e?.message)
    }
}

const urlDataChange = (url1, url2) => {
    if(!url1 || !url2 || getUrlUpdatesCount(url1) != getUrlUpdatesCount(url2)) return true
    return false
}

const templateChange = (template1, template2, skipAttrs = ["data_url", "thumbnail"]) => {
    if (!template1 || !template2) return true;
  
    const keys1 = Object.keys(template1);
    const keys2 = Object.keys(template2);
  
    for (const key of keys1) {
      if (!skipAttrs.includes(key) && template1[key] !== template2[key]) {
        return true;
      }
    }
  
    for (const key of keys2) {
      if (!skipAttrs.includes(key) && !(key in template1)) {
        return true;
      }
    }
  
    return false;
};

const rmUpdates = url => {
    if(!url) return null
    try {
        return removeUpdateQueryString(url)

    } catch(e) {
        return null
    }
}
async function fetchTemplates(toolsCacheMap, url) {
    try {
        const tool = toolsCacheMap[rmUpdates(url)]
        let templates
        if(urlDataChange(tool?.templates_url, url) || !tool?.templates || (tool?.templates || []).length == 0) {
            try {
                const response = await axios.get(url);
                templates = Object.values(response.data);
                if(!Array.isArray(templates) || typeof templates[0] !== "object") {
                    throw new Error("Invalid templates response")
                }
                console.log("fetchTemplates:axios.get(templates_url)", templates)

            } catch(e) {
                console.error("fetchTemplates:axios.get(templates_url).error", e)
                throw new Error(e)
            }

        } else {
            templates = tool.templates;
        }

        const templatesMap = arrayToMap("id", tool?.templates || [])
        
        for (const template of templates) {
            if (template.data_url) {
                const tc = templateChange(templatesMap[template.id], template, ["data_url", "thumbnail", "logo", "name"])
                if(urlDataChange(templatesMap[template.id]?.data_url, template.data_url) || tc || !templatesMap[template.id]?.thumbnail || templatesMap[template.id]?.thumbnail == "") {
                    try {
                        const templateData = (await axios.get(template.data_url))?.data;
                        if(typeof templateData !== "object") {
                            throw new Error("Invalid template data response")
                        }

                        template.thumbnail = await getThumbnail(template, templateData);
                        if(tc) {
                            const urlObj = new URL(template.thumbnail);
                            // tct = template_change_time
                            urlObj.searchParams.set('tct', Date.now());
                            template.thumbnail = urlObj.toString();
                        }
                    } catch (err) {
                        console.error(`Failed to get template data or thumbnail for template ${template.id}`, err.message);
                        template.thumbnail = "";
                    }

                } else {
                    template.thumbnail = templatesMap[template.id].thumbnail;
                }

            } else {
                template.thumbnail = "";
            }
        }

        templates.sort((a, b) => b.is_default - a.is_default);
        return templates;
    } catch (error) {
        console.error(`Error fetching templates from ${url}:`, error.message);
        throw new Error(e)
    }
}


async function updateToolsStaticFile(admin) {
    try {
        const db = admin.firestore();
        const cacheDocRef = db.doc("cache/static_file_info");

        // Get static_file_info document
        const cacheDocSnap = await cacheDocRef.get();

        if (cacheDocSnap.exists) {
            const data = cacheDocSnap.data();
            const lastUpdateStartTime = data.last_update_start_time?.toDate?.();

            if (lastUpdateStartTime) {
                const now = new Date();
                const diffMs = now - lastUpdateStartTime;
                const diffMinutes = diffMs / (1000 * 60);
                if ((diffMinutes < (data.call_wait_in_minutes || 5)) && !data.completed) {
                    console.error(`Skipping update: last update started less than ${data.call_wait_in_minutes || 5} minutes ago.`, diffMinutes);
                    return [];
                }
            }
        }

        // ✅ Immediately update last_update_start_time to prevent race conditions
        await cacheDocRef.set(
            { 
                last_update_start_time: admin.firestore.FieldValue.serverTimestamp(),
                completed: false
            },
            { merge: true }
        );

        const toolsCollection = db.collection("other_tools");

        // Fetch documents where isHidden is false
        const snapshot = await toolsCollection.where("isHidden", "==", false).get();
        
        if (snapshot.empty) {
            return [];
        }

        // Fetch the tools file
        const toolsUrl = `https://r2.softbaker.com/templates/tools.json`;

        let toolsCache;
        try {
            const response = await axios.get(toolsUrl);
            toolsCache = response.data;
            if(typeof toolsCache !== "object") {
                throw new Error("Invalid toolsCache response")
            }

        } catch (e) {
            const status = e?.response?.status;
            if (status && status !== 404) {
                return null;
            }
            console.error("toolsCache:", e.message);
        }

        // Process and sort results
        const toolsCacheMap = arrayToMap("templates_url", toolsCache?.tools || [], rmUpdates)
        const tools = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = { id: doc.id, ...doc.data() };
            if (data.templates_url) {
                try {
                    data.templates = await fetchTemplates(toolsCacheMap, data.templates_url);

                } catch(e) {
                    //revert to the old url
                    const oldUrl = toolsCacheMap[rmUpdates(data.templates_url)].templates_url
                    if(oldUrl) {
                        data.templates_url = oldUrl
                    } 
                }
            }
            return data;
        }));

        // Sort by isActive first, then by rank
        tools.sort((a, b) => {
            if (b.isActive !== a.isActive) {
                return b.isActive - a.isActive;
            }
            const rankA = a.rank > 0 ? a.rank : Infinity;
            const rankB = b.rank > 0 ? b.rank : Infinity;
            return rankA - rankB;
        });

        let pathUrl;
        if (tools && (!toolsCache || JSON.stringify(toolsCache?.tools || []) !== JSON.stringify(tools))) {
            pathUrl = `templates/tools.json`;
            const totalUpdates = (toolsCache?.totalUpdates || 0) + 1;
            const previouslyUpdatedOn = toolsCache?.lastUpdatedOn;
            const lastUpdatedOn = new Date().toUTCString();
            const newToolsCache = {
                totalUpdates,
                previouslyUpdatedOn,
                lastUpdatedOn,
                tools
            };
            await saveBase64ToR2(
                objectToBase64JsonDataUrl(newToolsCache),
                pathUrl,
                ENV_R2_BUCKET.value(),
                ENV_R2_S3_ACCESS_KEY_ID.value(),
                ENV_R2_S3_SECRET_ACCESS_KEY.value(),
                ENV_R2_S3_ENDPOINT.value()
            );
            // ✅ Immediately update last_update_start_time to prevent race conditions
            const data = { totalUpdates, lastUpdatedOn, completed: true }
            if(previouslyUpdatedOn) data.previouslyUpdatedOn = previouslyUpdatedOn
            await cacheDocRef.set(
                data,
                { merge: true }
            );
            pathUrl = `https://r2.softbaker.com/${pathUrl}`;

        } else {
            await cacheDocRef.set(
                { completed: true },
                { merge: true }
            );
        }

        return tools;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    updateToolsStaticFile
}