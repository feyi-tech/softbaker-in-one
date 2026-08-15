/** @type {import('next').NextConfig} */
const crossOriginIsolationHeaders = [
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Embedder-Policy",
    value: "credentialless",
  },
]

const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  trailingSlash: true,

  reactStrictMode: false,//disable hydration mismatch error

  async headers() {
    return [
      {
        source: "/:path*",
        headers: crossOriginIsolationHeaders,
      },
    ]
  },
}


const obfuscatorOptions = {
  stringArrayRotate: true,
  stringArrayShuffle: true,
}

const pluginOptions = {
  
}

//const NextJsObfuscatorPlugin = require("nextjs-obfuscator");
const withTM = require("next-transpile-modules")(['softbaker-svg']);


module.exports = withTM({/*
  webpack: (config, { dev })=>{
    config.plugins.push(new NextJsObfuscatorPlugin(obfuscatorOptions, pluginOptions))
    return config
  },*/
  /*
  webpack(config, { isServer }) {
    if (!isServer) {
      // Add polyfills for the client-side
      config.resolve.fallback = {
        net: false, // Disable `net` module for the client-side
        fs: false,  // Disable `fs` module for the client-side
        tls: false,  // Disable `fs` module for the client-side
        child_process: false, 
        //process: false, 
        fs: false, 
        util: false, 
        http: false,
        https: false,
        tls: false,
        net: false,
        //crypto: false, 
        path: false,
        os: false, 
        stream: false,
        zlib: false
      };
    }
    return config;
  },*/

  ...nextConfig 

})
