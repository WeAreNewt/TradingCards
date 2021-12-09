require('@nomiclabs/hardhat-waffle')
require('@openzeppelin/hardhat-upgrades')
require('hardhat-gas-reporter')

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
}
