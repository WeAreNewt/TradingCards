const { ethers, upgrades } = require('hardhat')

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log(
    'Deploying the contracts with account:',
    await deployer.getAddress(),
  )

  console.log('Account balance:', (await deployer.getBalance()).toString())

  const TradingCards = await ethers.getContractFactory('TradingCards')
  console.log(TradingCards.bytecode)
  const tradingCards = await upgrades.deployProxy(TradingCards, [])
  await tradingCards.deployed()

  console.log('tradingCards address:', tradingCards.address)

  await tradingCards.whitelistAddress(
    '0x7Cb60F872a8a9A8D2bf5ed50C862CAf5cb85D679',
  )
  await tradingCards.whitelistAddress(
    '0x29e3Ce5A46123A066d1CB9fD948110a4156D1163',
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
