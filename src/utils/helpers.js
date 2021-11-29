import Web3 from 'web3'
import axios from 'axios'
import testapes_abi from '../assets/abis/testapes'
import erc721_abi from '../assets/abis/erc721'
import staking_abi from '../assets/abis/staking'
import tradingcards_abi from '../assets/abis/tradingcards'
import {
  COLLECTIONS,
  RARITY_TIERS,
  TRADING_CARDS_ADDRESS_ROPSTEN,
} from './constants'

export const giveApproval = (wallet, nftAddress, rarity) => {
  return new Promise(async (resolve, reject) => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum)
        const nftContract = new web3.eth.Contract(erc721_abi, nftAddress)

        await nftContract.methods
          .setApprovalForAll(TRADING_CARDS_ADDRESS_ROPSTEN, true)
          .send({ from: wallet })
      } catch (error) {
        reject(error)
      }
      resolve(true)
    } else {
      reject('No injected web3 in browser')
    }
  })
}

export const getApproval = (wallet, nftAddress) => {
  return new Promise(async (resolve, reject) => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum)
        const nftContract = new web3.eth.Contract(erc721_abi, nftAddress)

        const isApprovedForAll = await nftContract.methods
          .isApprovedForAll(wallet, TRADING_CARDS_ADDRESS_ROPSTEN)
          .call()
        resolve(isApprovedForAll)
      } catch (error) {
        reject(error)
      }
      resolve(true)
    } else {
      reject('No injected web3 in browser')
    }
  })
}

export const stakeNft = (wallet, nftAddress, nftId, price, rarity) => {
  return new Promise(async (resolve, reject) => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum)
        const nftContract = new web3.eth.Contract(
          tradingcards_abi,
          TRADING_CARDS_ADDRESS_ROPSTEN,
        )

        await nftContract.methods
          .stakeNft(
            nftAddress,
            nftId,
            web3.utils.toWei(price ? price : '0'),
            rarity,
          )
          .send({ from: wallet })
      } catch (error) {
        reject(error)
      }
      resolve(true)
    } else {
      reject('No injected web3 in browser')
    }
  })
}

export const mintNft = (wallet, nftAddress) => {
  return new Promise(async (resolve, reject) => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum)
        const nftContract = new web3.eth.Contract(testapes_abi, nftAddress)

        const receipt = await nftContract.methods.mint().send({ from: wallet })
        resolve(true)
      } catch (error) {
        reject(error)
      }
    }
    reject('No injected web3 in browser')
  })
}

export const buyCard = (wallet, card) => {
  return new Promise(async (resolve, reject) => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum)
        const nftContract = new web3.eth.Contract(
          tradingcards_abi,
          TRADING_CARDS_ADDRESS_ROPSTEN,
        )

        await nftContract.methods
          .buyTradingCard(card.cardId)
          .send({ from: wallet, value: card.price })
        resolve(true)
      } catch (error) {
        reject(error)
      }
    }
    reject('No injected web3 in browser')
  })
}

export const getNftBalance = (wallet, nftAddress) => {
  return new Promise(async (resolve, reject) => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum)
      const nftContract = new web3.eth.Contract(erc721_abi, nftAddress)

      let promises = [] // sticker
      promises.push(
        nftContract.getPastEvents('Transfer', {
          filter: { to: wallet },
          fromBlock: 0,
          toBlock: 'latest',
        }),
      )
      promises.push(
        nftContract.getPastEvents('Transfer', {
          filter: { from: wallet },
          fromBlock: 0,
          toBlock: 'latest',
        }),
      )

      let transfers = await Promise.all(promises)

      transfers = transfers
        .flat(1)
        .sort((a, b) => a.blockNumber - b.blockNumber)

      let balance = {}
      for (let i = 0; i < transfers.length; i++) {
        let event = transfers[i]
        let tokenId = event.returnValues.tokenId.toString()
        if (!balance[tokenId]) {
          balance[tokenId] = event.returnValues.to
        } else {
          balance[tokenId] = event.returnValues.to
        }
      }

      let currentBalance = []

      for (const token_id in balance) {
        if (balance[token_id].toLowerCase() === wallet.toLowerCase()) {
          const metadataUri = await nftContract.methods
            .tokenURI(token_id)
            .call()

          try {
            if (metadataUri.indexOf('ipfs://') === 0) {
              const metadataResponse = await axios.get(
                'https://ipfs.infura.io/ipfs/' + metadataUri.slice(7),
              )
              let metadata = metadataResponse.data
              if (metadata['image'].indexOf('ipfs://') > -1) {
                metadata['image'] =
                  'https://ipfs.infura.io/ipfs/' + metadata['image'].slice(7)
              }

              metadata['json'] = { image: metadata['image'] }

              let cardCollection = COLLECTIONS.filter(
                (collection) =>
                  collection.address.toLowerCase() === nftAddress.toLowerCase(),
              )[0]

              currentBalance.push({
                nftId: token_id,
                collection: nftAddress,
                collectionMeta: cardCollection,
                metadata: metadata,
              })
            } else {
              const metadataResponse = await axios.get(metadataUri)
              let metadata = metadataResponse.data

              if (metadata['image'].indexOf('ipfs://') > -1) {
                metadata['image'] =
                  'https://ipfs.infura.io/ipfs/' + metadata['image'].slice(7)
              }

              metadata['json'] = { image: metadata['image'] }

              let cardCollection = COLLECTIONS.filter(
                (collection) =>
                  collection.address.toLowerCase() === nftAddress.toLowerCase(),
              )[0]

              currentBalance.push({
                nftId: token_id,
                collection: nftAddress,
                collectionMeta: cardCollection,
                metadata: metadata,
              })
            }
          } catch (error) {
            currentBalance.push({
              nftId: token_id,
              collection: nftAddress,
              metadata: { image: '', json: { image: '' } },
            })
          }
        }
      }

      console.log('currentBalance', currentBalance)
      resolve({ collection: nftAddress, balance: currentBalance })
    } else {
      reject('No injected web3 in browser')
    }
  })
}

export const getAllCards = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const web3 = new Web3(
        'https://eth-ropsten.alchemyapi.io/v2/4Au07lTHNtCnZShrsjdXRkZDYlIzI27V',
      )

      const tradingContract = new web3.eth.Contract(
        tradingcards_abi,
        TRADING_CARDS_ADDRESS_ROPSTEN,
      )

      const nftStakedEvents = await tradingContract.getPastEvents('NftStaked', {
        fromBlock: 0,
      })

      console.log('nftStakedEvents', nftStakedEvents)
      const cardBoughtEvents = await tradingContract.getPastEvents(
        'CardBought',
        {
          fromBlock: 0,
        },
      )
      console.log('cardBoughtEvents', cardBoughtEvents)

      let cardIdLookup = {}

      nftStakedEvents.forEach((event) => {
        const {
          cardId,
          nftContract,
          nftId,
          nftOwner,
          price,
          supply,
          duration,
          timestamp,
          rarity,
        } = event.returnValues

        let cardCollection = COLLECTIONS.filter(
          (collection) =>
            collection.address.toLowerCase() === nftContract.toLowerCase(),
        )[0]
        let cardRarity = RARITY_TIERS[rarity]

        let hydratedCard = {
          cardId: cardId,
          nftContract: nftContract,
          nftId: nftId,
          owner: nftOwner,
          price: price,
          price_eth: web3.utils.fromWei(price).toString(),
          duration: duration,
          timestamp: timestamp,
          rarity: rarity,
          rarityMeta: cardRarity,
          collectionMeta: cardCollection,
          supply: supply,
          copies: 0,
        }

        cardIdLookup[cardId] = hydratedCard
      })

      cardBoughtEvents.forEach((cardBuy) => {
        if (cardIdLookup[cardBuy.cardId]) {
          cardIdLookup[cardBuy.cardId].copies += 1
        }
      })

      let allCards = []
      for (const cardId in cardIdLookup) {
        allCards.push(cardIdLookup[cardId])
      }

      resolve({ cards: allCards, cardsLookup: cardIdLookup })
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

export const getNftMetadata = (nftAddress, nftId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const web3 = new Web3(
        'https://eth-ropsten.alchemyapi.io/v2/4Au07lTHNtCnZShrsjdXRkZDYlIzI27V',
      )
      const nftContract = new web3.eth.Contract(erc721_abi, nftAddress)
      const metadataUri = await nftContract.methods.tokenURI(nftId).call()

      console.log(metadataUri)

      if (metadataUri.indexOf('ipfs://') === 0) {
        const metadataResponse = await axios.get(
          'https://ipfs.infura.io/ipfs/' + metadataUri.slice(7),
        )
        let metadata = metadataResponse.data
        if (metadata['image'].indexOf('ipfs://') > -1) {
          metadata['image'] =
            'https://ipfs.infura.io/ipfs/' + metadata['image'].slice(7)
        }

        metadata['json'] = { image: metadata['image'] }

        resolve(metadata)
      } else {
        const metadataResponse = await axios.get(metadataUri)
        let metadata = metadataResponse.data

        if (metadata['image'].indexOf('ipfs://') > -1) {
          metadata['image'] =
            'https://ipfs.infura.io/ipfs/' + metadata['image'].slice(7)
        }

        metadata['json'] = { image: metadata['image'] }

        resolve(metadata)
      }
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}
