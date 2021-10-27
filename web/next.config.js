const withImages = require('next-images')

module.exports = {
    ...withImages(),
    future: {
        webpack5: true,
    },
    async redirects() {
        return [
          {
            source: "/docs",
            destination: "https://docs.kotaru.xyz",
            permanent: true,
          },
        ]
    },
}