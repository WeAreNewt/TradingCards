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

  const TestApeToken = await ethers.getContractFactory('TestApeToken')
  const testApeToken = await TestApeToken.deploy()
  await testApeToken.deployed()
  console.log('testApeToken address:', testApeToken.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
