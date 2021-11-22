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
    beforeEach(async function () {
      let price = 100
      await tradingCards.whitelistAddress(testApeToken.address)
      await testApeToken.safeMint(owner.address)
      await testApeToken.setApprovalForAll(tradingCards.address, true)
      await tradingCards.stakeNft(testApeToken.address, 0, 901, price, 1)
    })

    it('Should let user to mint if exact price is paid', async function () {
      expect(
        await tradingCards.buyTradingCard(testApeToken.address, 0, {
          value: 100,
        }),
      ).to.changeEtherBalance(tradingCards, 100)
      expect(await tradingCards.balanceOf(owner.address)).to.equal(1)
    })

    it('Should not let user mint if paying above price', async function () {
      await expect(
        tradingCards.buyTradingCard(testApeToken.address, 0, {
          value: 101,
        }),
      ).to.revertedWith('Incorrect amount of funds sent')
    })

    it('Should not let user mint if below price', async function () {
      await expect(
        tradingCards.buyTradingCard(testApeToken.address, 0, {
          value: 99,
        }),
      ).to.revertedWith('Incorrect amount of funds sent')
    })

    it('Should not let user mint for free', async function () {
      await expect(
        tradingCards.buyTradingCard(testApeToken.address, 0),
      ).to.revertedWith('Incorrect amount of funds sent')
    })

    it('Should not let user mint if duration is exceeded', async function () {
      ethers.provider.send('evm_increaseTime', [1200])
      await expect(
        tradingCards.buyTradingCard(testApeToken.address, 0, {
          value: 100,
        }),
      ).to.be.revertedWith('Nft minting window has passed')
    })

    it('Should not let users mint beyond the supply cap', async function () {
      expect(
        await tradingCards.buyTradingCard(testApeToken.address, 0, {
          value: 100,
        }),
      ).to.changeEtherBalance(tradingCards, 100)
      expect(await tradingCards.balanceOf(owner.address)).to.equal(1)
      await expect(
        tradingCards.buyTradingCard(testApeToken.address, 0, {
          value: 100,
        }),
      ).to.be.revertedWith('Nft has reached supply cap')
    })
  })

  describe('Unstaking', async function () {
    beforeEach(async function () {
      let price = 100
      await tradingCards.whitelistAddress(testApeToken.address)
      await testApeToken.safeMint(owner.address)
      await testApeToken.setApprovalForAll(tradingCards.address, true)
      await tradingCards.stakeNft(testApeToken.address, 0, 901, price, 1)

      await tradingCards.buyTradingCard(testApeToken.address, 0, {
        value: 100,
      })
    })

    it('Should not let owner unstake until end of duration time', async function () {
      await expect(
        tradingCards.unstakeNft(testApeToken.address, 0),
      ).to.be.revertedWith('Staking period not over yet')
    })

    it('Should let owner unstake after end of duration time', async function () {
      ethers.provider.send('evm_increaseTime', [1200])

      expect(await tradingCards.unstakeNft(testApeToken.address, 0))
    })

    it('Should only let owner unstake after end of duration time', async function () {
      ethers.provider.send('evm_increaseTime', [1200])

      await expect(
        tradingCards.connect(addr1).unstakeNft(testApeToken.address, 0),
      ).to.be.revertedWith('Only the original nft staker can unstake')
    })

    it('Should transfer earned revenue to owner after unstaking', async function () {
      ethers.provider.send('evm_increaseTime', [1200])

      expect(
        await tradingCards.unstakeNft(testApeToken.address, 0),
      ).to.changeEtherBalance(tradingCards, -100)
    })

    it('Should transfer staked nft back to owner after unstaking', async function () {
      ethers.provider.send('evm_increaseTime', [1200])

      expect(await testApeToken.ownerOf(0)).to.equal(tradingCards.address)
      expect(await tradingCards.unstakeNft(testApeToken.address, 0))
      expect(await testApeToken.ownerOf(0)).to.equal(owner.address)
    })
  })
})
