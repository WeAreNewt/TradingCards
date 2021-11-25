import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Web3 from 'web3'
import {
  FireIcon,
  HomeIcon,
  TerminalIcon,
  ClipboardListIcon,
  LibraryIcon,
} from '@heroicons/react/outline'
import { InformationCircleIcon } from '@heroicons/react/solid'

import { getNftBalance, getAllCards } from './utils/helpers'
import PreviewCard from './components/PreviewCard'
import Wizard from './components/Wizard'
import CollectionPage from './pages/CollectionPage'
import CardPage from './pages/CardPage'
import { COLLECTIONS } from './utils/constants'

const KovanContracts = COLLECTIONS

function App() {
  let location = useLocation()

  const [isWrongChain, setIsWrongChain] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [navigation, setNavigation] = useState('Card Maker')

  const [isConnecting, setIsConnecting] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const [account, setAccount] = useState('')
  const [isLoadingCollections, setIsLoadingCollections] = useState(true)
  const [collections, setCollections] = useState([])

  const [isCardsLoading, setIsCardsLoading] = useState(true)
  const [allCards, setAllCards] = useState([])
  const [cardsLookup, setCardsLookup] = useState({})

  const reloadCards = async () => {
    const { cards, cardsLookup } = await getAllCards()

    setAllCards(cards)
    setIsCardsLoading(false)
    setCardsLookup(cardsLookup)
  }

  useEffect(() => {
    reloadCards()

    window.ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
      if (chainId !== '0x3') {
        setIsWrongChain(true)
      }
    })

    window.ethereum.on('accountsChanged', () => window.location.reload())
    window.ethereum.on('chainChanged', () => window.location.reload())
  }, [])

  useEffect(async () => {
    reloadBalances()
  }, [])

  const reloadBalances = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      })

      if (accounts[0]) {
        let promises = []

        KovanContracts.forEach((contract) => {
          promises.push(getNftBalance(accounts[0], contract.address))
        })

        let balances = await Promise.all(promises)
        console.log('BALANCES', balances)

        let allBalances = []
        balances.forEach(
          (balance) => (allBalances = allBalances.concat(balance.balance)),
        )

        setCollections(allBalances)
        setIsLoadingCollections(false)

        setAccount(accounts[0])
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    }
  }

  return (
    <>
      <div className="min-h-full bg-gray-100">
        <header className="bg-gray-900">
          <nav className="max-w-7xl mx-auto " aria-label="Top">
            <div className="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
              <div className="flex items-center">
                <Link to="/">
                  <span className="sr-only">Workflow</span>
                  <img
                    className="h-10 w-auto"
                    src="https://tailwindui.com/img/logos/workflow-mark.svg?color=white"
                    alt=""
                  />
                </Link>
                <Link to="/" className="text-gray-50 ml-4 font-bold text-2xl">
                  NFT Trading Cards
                </Link>
              </div>
              <div className="hidden ml-10 space-x-8 lg:block">
                {[
                  {
                    name: 'explore',
                    title: 'Explore',
                  },
                  {
                    name: 'collection',
                    title: 'Collection',
                  },
                  {
                    name: 'wizard',
                    title: 'Wizard',
                  },
                ].map((link) => (
                  <Link
                    to={link.name}
                    key={link.title}
                    className={`text-base font-medium ${
                      location.pathname.slice(1) === link.name
                        ? 'text-white '
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </header>
        <div className="py-10">
          <div className="max-w-3xl mx-auto sm:px-6 lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-12 lg:gap-8">
            <Routes>
              <Route
                path="/"
                element={
                  <div className="w-full block lg:col-span-12 xl:col-span-12">
                    <div className="flex flex-col w-full justify-center items-center">
                      <h2 className="text-4xl mb-4 font-extrabold text-gray-900">
                        Create Trading Cards from your NFTs
                      </h2>
                      <h3 className="text-2xl font-semibold text-gray-600">
                        Buy, sell, and create NFT trading cards instantly
                      </h3>
                    </div>
                    <div className="mt-24 grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2 lg:grid-cols-2 xl:gap-x-8">
                      <div className="w-full h-full flex flex-col justify-start items-center">
                        <Link
                          to="/explore"
                          className="w-60 h-60 bg-gray-400 hover:bg-gray-300"
                        ></Link>
                        <h4 className="mt-4 text-xl font-semibold text-gray-700 text-center">
                          Collect cards of your favorite NFTs!
                        </h4>
                        <div className="mt-4 w-full flex justify-center items-center">
                          <Link
                            to="/explore"
                            className="bg-gray-200 z-50 px-8 py-2 text-lg text-gray-500 rounded-full hover:bg-gray-300 hover:text-gray-700"
                          >
                            Explore
                          </Link>
                        </div>
                      </div>
                      <div className="w-full h-full flex flex-col justify-start items-center text-center">
                        <Link
                          to="/wizard"
                          className="w-60 h-60 bg-gray-400 hover:bg-gray-400"
                        ></Link>
                        <h4 className="mt-4 text-xl font-semibold text-gray-700">
                          Earn money by licensing the IP you own!
                        </h4>
                        <div className="mt-4 w-full flex justify-center items-center">
                          <Link
                            to="/wizard"
                            className="bg-gray-200 px-8 py-2 text-lg text-gray-500 rounded-full hover:bg-gray-300 hover:text-gray-700"
                          >
                            Create cards
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              />
              <Route
                path="/collection/:nftContract"
                element={
                  <CollectionPage
                    wallet={account}
                    allCards={allCards}
                    isCardsLoading={isCardsLoading}
                  />
                }
              />
              <Route
                path="/card/:nftContract/:nftId"
                element={
                  <CardPage
                    allCards={allCards}
                    isCardsLoading={isCardsLoading}
                  />
                }
              />

              <Route
                path="/explore"
                element={
                  <div className="w-full block lg:col-span-9 xl:col-span-10">
                    <h2 className="text-4xl mb-4 font-extrabold text-gray-900 px-6 sm:px-0 sm:pr-12">
                      All NFT Collections
                    </h2>
                    <div className="mt-6 grid grid-cols-1 gap-y-4 gap-x-6 px-6 sm:px-0 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
                      {KovanContracts.map((collection) => (
                        <Link
                          to={`/collection/${collection.address}`}
                          state={collection}
                          key={collection.address}
                          className="group relative cursor-pointer"
                        >
                          <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                            <img
                              src={collection.image}
                              className="w-full h-full object-center object-cover lg:w-full lg:h-full"
                            />
                          </div>
                          <div className="mt-2 flex justify-between group-hover:opacity-75">
                            <div>
                              <p className=" text-xs text-gray-600">Price</p>
                              <h3 className=" text-md font-bold text-gray-700">
                                <div>
                                  <span
                                    aria-hidden="true"
                                    className="absolute inset-0"
                                  />
                                  {allCards
                                    .filter(
                                      (card) =>
                                        card.nftContract.toLowerCase() ===
                                        collection.address.toLowerCase(),
                                    )
                                    .sort(
                                      (a, b) =>
                                        Number(b.price_eth) -
                                        Number(a.price_eth),
                                    ).length > 0
                                    ? allCards
                                        .filter(
                                          (card) =>
                                            card.nftContract.toLowerCase() ===
                                            collection.address.toLowerCase(),
                                        )
                                        .sort(
                                          (a, b) =>
                                            Number(b.price_eth) -
                                            Number(a.price_eth),
                                        )[0].price_eth
                                    : 0}{' '}
                                  Ξ
                                </div>
                              </h3>
                            </div>
                            <div>
                              <p className=" text-xs text-gray-600">
                                No. of cards
                              </p>
                              <h3 className=" text-md font-bold text-gray-700 text-right">
                                {
                                  allCards.filter(
                                    (card) =>
                                      card.nftContract.toLowerCase() ===
                                      collection.address.toLowerCase(),
                                  ).length
                                }
                              </h3>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                }
              />
              <Route
                path="/wizard"
                element={
                  <Wizard
                    isWrongChain={isWrongChain}
                    wallet={account}
                    isLoadingCollections={isLoadingCollections}
                    collections={collections}
                    reloadBalances={reloadBalances}
                    reloadCards={reloadCards}
                    connectButton={() => {
                      if (!account) {
                        return (
                          <div className="rounded-md bg-amber-50 p-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <InformationCircleIcon
                                  className="h-5 w-5 text-amber-400"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="ml-3 flex-1 items-center md:flex md:justify-between">
                                <p className="text-sm text-amber-700">
                                  You need to connect your account to use the
                                  trading card wizard.
                                </p>
                                <button
                                  onClick={async () => {
                                    if (!isConnecting) {
                                      setIsConnecting(true)
                                      try {
                                        await window.ethereum.request({
                                          method: 'eth_requestAccounts',
                                        })
                                      } catch (error) {
                                        setIsConnecting(false)
                                      }
                                    }
                                  }}
                                  className="bg-amber-400 text-amber-700 rounded-full p-1 px-2 text-sm"
                                >
                                  {!isConnecting && 'Connect'}
                                  {isConnecting && (
                                    <svg
                                      class="animate-spin mx-auto h-6 w-6 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        class="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        stroke-width="4"
                                      ></circle>
                                      <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      if (isWrongChain) {
                        return (
                          <div className="rounded-md bg-amber-50 p-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <InformationCircleIcon
                                  className="h-5 w-5 text-amber-400"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="ml-3 flex-1 items-center md:flex md:justify-between">
                                <p className="text-sm text-amber-700">
                                  You need to be on the Ropsten testnet to use
                                  the wizard
                                </p>
                                <button
                                  onClick={async () => {
                                    if (!isSwitching) {
                                      setIsSwitching(true)
                                      try {
                                        await window.ethereum.request({
                                          method: 'wallet_switchEthereumChain',
                                          params: [{ chainId: '0x3' }],
                                        })
                                      } catch (error) {
                                        setIsSwitching(false)
                                      }
                                    }
                                  }}
                                  className="bg-amber-400 text-amber-700 rounded-full p-1 px-4 text-sm"
                                >
                                  {!isSwitching && 'Switch'}
                                  {isSwitching && (
                                    <svg
                                      class="animate-spin mx-auto h-6 w-6 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        class="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        stroke-width="4"
                                      ></circle>
                                      <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return <> </>
                    }}
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
