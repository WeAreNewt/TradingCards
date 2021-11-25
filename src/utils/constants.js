import BAYC from '../assets/collection_covers/boredape.png'
import COOLCAT from '../assets/collection_covers/coolcat.png'
import CRYPTOADZ from '../assets/collection_covers/cryptoadz.png'

import Silver from '../assets/images/silver.png'
import Gold from '../assets/images/gold.png'
import Platinum from '../assets/images/platinum.png'
import Titanium from '../assets/images/titanium.png'

export const TRADING_CARDS_ADDRESS_ROPSTEN =
  '0x0d6305E0b868ef632F505e0BC5D07Ce542b2A86a'

export const COLLECTIONS = [
  {
    name: 'Ropsten Monkeys',
    address: '0x7Cb60F872a8a9A8D2bf5ed50C862CAf5cb85D679',
    image: BAYC,
  },
  {
    name: 'Coolest Cats',
    address: '0x29e3Ce5A46123A066d1CB9fD948110a4156D1163',
    image: COOLCAT,
  },
  {
    name: 'CrypticToadz',
    address: '0x486CFe11EEEEf1f38F5Ad17557a0049471c58A7e',
    image: CRYPTOADZ,
  },
]

export const RARITY_TIERS = [
  {
    tier: 0,
    name: 'Silver',
    duration: '12',
    durationType: 'hours',
    duration_seconds: 43200,
    supply: '100',
    price: '0.01',
    image: Silver,
    background: {
      backgroundImage: `url(${Silver})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100%',
    },
  },
  {
    tier: 1,
    name: 'Gold',
    duration: '1',
    durationType: 'day',
    duration_seconds: 86400,
    supply: '10',
    price: '0.10',
    image: Gold,
    background: {
      backgroundImage: `url(${Gold})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100%',
    },
  },
  {
    tier: 2,
    name: 'Platinum',
    duration: '3',
    durationType: 'days',
    duration_seconds: 259200,
    supply: '3',
    price: '0.25',
    image: Platinum,
    background: {
      backgroundImage: `url(${Platinum})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100%',
    },
  },
  {
    tier: 3,
    name: 'Titanium',
    duration: '1',
    durationType: 'week',
    duration_seconds: 604800,
    supply: '1',
    price: '1.00',
    image: Titanium,
    background: {
      backgroundImage: `url(${Titanium})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100%',
    },
  },
]
