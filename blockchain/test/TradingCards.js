const { expect } = require('chai')
const { loadFixture, deployContract } = require('ethereum-waffle')

describe('Trading Card Contract', function () {
  let TradingCards
  let tradingCards
  let TestApeToken
  let testApeToken
  let owner
  let addr1
  let addr2
  let addrs

  beforeEach(async function () {
    TradingCards = await ethers.getContractFactory('TradingCards')
    TestApeToken = await ethers.getContractFactory('TestApeToken')
    ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()

    tradingCards = await TradingCards.deploy()
    testApeToken = await TestApeToken.deploy()

    await tradingCards.deployed()
    await testApeToken.deployed()
  })

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await tradingCards.owner()).to.equal(owner.address)
    })

    it('Should have empty staked and minted nft counters', async function () {
      expect(await tradingCards.stakedNftCounter()).to.equal(0)
      expect(await tradingCards.mintedNftCounter()).to.equal(0)
    })

    it('Should have no whitelisted nft contracts', async function () {
      expect(await tradingCards.NFT_WHITELIST(testApeToken.address)).to.equal(
        false,
      )
    })
  })

  describe('Permissions', function () {
    it('Should let owner whitelist nft contract', async function () {
      await tradingCards.whitelistAddress(testApeToken.address)
      expect(await tradingCards.NFT_WHITELIST(testApeToken.address)).to.equal(
        true,
      )
    })

    it('Should only let owner whitelist nft contract', async function () {
      await expect(
        tradingCards.connect(addr1).whitelistAddress(testApeToken.address),
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })

  describe('Staking', function () {
    it('Should not allow non-whitelisted nft to be staked', async function () {
      await expect(tradingCards.stakeNft(testApeToken.address, 0, 901, 100, 1))
        .to.be.reverted
    })

    it('Should allow whitelisted nft to be staked', async function () {
      await tradingCards.whitelistAddress(testApeToken.address)
      await testApeToken.safeMint(owner.address)
      await testApeToken.setApprovalForAll(tradingCards.address, true)

      expect(await testApeToken.ownerOf(0)).to.equal(owner.address)

      await expect(tradingCards.stakeNft(testApeToken.address, 0, 901, 100, 1))
        .to.not.be.reverted

      expect(await testApeToken.ownerOf(0)).to.equal(tradingCards.address)
    })

    it('Should not allow nft to be staked if price is 0', async function () {
      const price = 0
      await tradingCards.whitelistAddress(testApeToken.address)
      await testApeToken.safeMint(owner.address)
      await testApeToken.setApprovalForAll(tradingCards.address, true)

      expect(await testApeToken.ownerOf(0)).to.equal(owner.address)

      await expect(
        tradingCards.stakeNft(testApeToken.address, 0, 901, price, 1),
      ).to.be.revertedWith('Price must be greater than 1 Wei')

      expect(await testApeToken.ownerOf(0)).to.equal(owner.address)
    })

    it('Should not allow nft to be staked if duration is less than a minute', async function () {
      const duration = 1
      await tradingCards.whitelistAddress(testApeToken.address)
      await testApeToken.safeMint(owner.address)
      await testApeToken.setApprovalForAll(tradingCards.address, true)

      expect(await testApeToken.ownerOf(0)).to.equal(owner.address)

      await expect(
        tradingCards.stakeNft(testApeToken.address, 0, duration, 100, 1),
      ).to.be.revertedWith('Staking duration must be longer than 1 minute')

      expect(await testApeToken.ownerOf(0)).to.equal(owner.address)
    })

    it('Should not allow nft to be staked if supply is 0', async function () {
      const supply = 0
      await tradingCards.whitelistAddress(testApeToken.address)
      await testApeToken.safeMint(owner.address)
      await testApeToken.setApprovalForAll(tradingCards.address, true)

      expect(await testApeToken.ownerOf(0)).to.equal(owner.address)

      await expect(
        tradingCards.stakeNft(testApeToken.address, 0, 601, 100, supply),
      ).to.be.revertedWith('Supply must be atleast 1')

      expect(await testApeToken.ownerOf(0)).to.equal(owner.address)
    })
  })

  describe('Minting', function () {
    it('Should not let user mint if paying above price', async function () {
      const price = 100
      await tradingCards.whitelistAddress(testApeToken.address)
      await testApeToken.safeMint(owner.address)
      await testApeToken.setApprovalForAll(tradingCards.address, true)
      await tradingCards.stakeNft(testApeToken.address, 0, 901, price, 1)

      await expect(
        tradingCards.buyTradingCard(testApeToken.address, 0, {
          value: price + 1,
        }),
      ).to.revertedWith('Incorrect amount of funds sent')
    })

    it('Should not let user mint if below price', async function () {
      const price = 100
      await tradingCards.whitelistAddress(testApeToken.address)
      await testApeToken.safeMint(owner.address)
      await testApeToken.setApprovalForAll(tradingCards.address, true)
      await tradingCards.stakeNft(testApeToken.address, 0, 901, price, 1)

      await expect(
        tradingCards.buyTradingCard(testApeToken.address, 0, {
          value: price - 1,
        }),
      ).to.revertedWith('Incorrect amount of funds sent')
    })

    it('Should not let user mint for free', async function () {
      const price = 100
      await tradingCards.whitelistAddress(testApeToken.address)
      await testApeToken.safeMint(owner.address)
      await testApeToken.setApprovalForAll(tradingCards.address, true)
      await tradingCards.stakeNft(testApeToken.address, 0, 901, price, 1)

      await expect(
        tradingCards.buyTradingCard(testApeToken.address, 0),
      ).to.revertedWith('Incorrect amount of funds sent')
    })

    it('Should not let user mint if duration is exceeded', async function () {
      await tradingCards.whitelistAddress(testApeToken.address)
      await testApeToken.safeMint(owner.address)
      await testApeToken.setApprovalForAll(tradingCards.address, true)
      await tradingCards.stakeNft(testApeToken.address, 0, 901, 100, 1)

      ethers.provider.send('evm_increaseTime', [1200])

      await expect(
        tradingCards.buyTradingCard(testApeToken.address, 0, {
          value: 100,
        }),
      ).to.be.revertedWith('Nft minting window has passed')
    })

    it('Should let user to mint if exact price is paid', async function () {
      const price = 100
      await tradingCards.whitelistAddress(testApeToken.address)
      await testApeToken.safeMint(owner.address)
      await testApeToken.setApprovalForAll(tradingCards.address, true)
      await tradingCards.stakeNft(testApeToken.address, 0, 901, price, 1)

      expect(
        await tradingCards.buyTradingCard(testApeToken.address, 0, {
          value: price,
        }),
      ).to.changeEtherBalance(tradingCards, price)
    })
  })

  //describe('Unstaking', async function () {})
})
