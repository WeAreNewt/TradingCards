import Web3 from 'web3'
import axios from 'axios'
import erc721_abi from '../assets/abis/erc721'

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

      console.log('Transfer events', transfers)
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

            currentBalance.push({
              tokenId: token_id,
              collection: nftAddress,
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

            currentBalance.push({
              tokenId: token_id,
              collection: nftAddress,
              metadata: metadata,
            })
          }
        }
      }

      resolve({ collection: nftAddress, balance: currentBalance })
    } else {
      reject('No injected web3 in browser')
    }
  })
}
