// geoMiddleware.js
const fetch = require("node-fetch");

const geoMiddleware = async (req, res, next) => {
  try {
    // Get real client IP (important behind Firebase / proxies)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress;

    // Optional: skip localhost in dev
    if (!ip || ip.includes("127.0.0.1") || ip.includes("::1")) {
        req.geo = {
            ip: ip
        };
        return next();
    }

    //const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = {}; //await response.json();

    req.geo = {
        ip: ip,/*
        city: data?.city || "",
        region: data?.region || "",
        country_name: data?.country_name || "",
        country_calling_code: data?.country_calling_code || "",
        currency: data?.currency || "",
        currency_name: data?.currency_name || "",
        org: data?.org || "",*/

    };

    next();

  } catch (e) {
    console.error("Geo middleware error:", e.message);
    req.geo = {
        ip: ip,
        error: e.message
    };
    next(); // never block request
  }
};

module.exports = geoMiddleware;