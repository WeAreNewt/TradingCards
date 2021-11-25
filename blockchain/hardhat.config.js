require('@nomiclabs/hardhat-waffle')
require('@openzeppelin/hardhat-upgrades')
require('dotenv').config()

module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.7',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              yul: true,
            },
          },
        },
      },
    ],
  },
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_ALCHEMY_URL,
      accounts: [process.env.ROPSTEN_PRIVATE_KEY],
    },
  },
}
