import { useEffect, useState } from 'react'
import Web3 from 'web3'
import {
  FireIcon,
  HomeIcon,
  TerminalIcon,
  ClipboardListIcon,
  LibraryIcon,
} from '@heroicons/react/outline'
import { getNftBalance } from './utils/helpers'
import PreviewCard from './components/PreviewCard'
import Stepper from './Stepper.js'
function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const KovanContracts = [
  {
    name: 'Kovan Apes',
    address: '0x8901cb0ea244ea176b01e23b90d38ef65b565b9f',
    image: '',
  },
]

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [navigation, setNavigation] = useState('Card Maker')

  const [collections, setCollections] = useState([])
  const [selectedNft, setSelectedNft] = useState({})

  useEffect(async () => {
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

        setCollections(balances[0].balance)

        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    }
  }, [])

  return (
    <>
      <div className="min-h-full bg-gray-100">
        <div className="py-10">
          <div className="max-w-3xl mx-auto sm:px-6 lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="hidden lg:block lg:col-span-3 xl:col-span-2">
              <nav
                aria-label="Sidebar"
                className="sticky top-4 divide-y divide-gray-300"
              >
                <div className="pb-8 space-y-1">
                  {[
                    { name: 'Home', href: '#', icon: HomeIcon, current: true },
                    {
                      name: 'Collection',
                      href: '#',
                      icon: LibraryIcon,
                      current: false,
                    },
                    {
                      name: 'Card Maker',
                      href: '#',
                      icon: ClipboardListIcon,
                      current: false,
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      onClick={() => {
                        if (item.name !== navigation) {
                          setNavigation(item.name)
                        }
                      }}
                      className={classNames(
                        item.name === navigation
                          ? 'bg-gray-200 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50',
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer',
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.name === navigation
                            ? 'text-gray-500'
                            : 'text-gray-400 group-hover:text-gray-500',
                          'flex-shrink-0 -ml-1 mr-3 h-6 w-6',
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </nav>
            </div>

            {navigation === 'Card Maker' && (
              <main className="lg:col-span-9 xl:col-span-6">
                <h2 className="text-4xl mb-4 font-extrabold text-gray-900 sm:pr-12">
                  TCG Wizard
                </h2>

                <Stepper />

                <ul
                  role="list"
                  className="grid grid-cols-2 bg-white p-4 rounded-lg gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
                >
                  {collections.map((file) => (
                    <li
                      onClick={() => setSelectedNft(file)}
                      key={file.tokenId}
                      className="relative"
                    >
                      <div className="group block w-full aspect-w-10 aspect-h-10 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
                        <img
                          src={file.metadata.json.image}
                          alt=""
                          className="object-cover pointer-events-none group-hover:opacity-75"
                        />
                        <button
                          type="button"
                          className="absolute inset-0 focus:outline-none"
                        >
                          <span className="sr-only">
                            View details for {file.name}
                          </span>
                        </button>
                      </div>
                      <p className="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">
                        BAYC: #{file.tokenId}
                      </p>
                      <p className="block text-sm font-medium text-gray-500 pointer-events-none">
                        {file.tokenId}
                      </p>
                    </li>
                  ))}
                </ul>
              </main>
            )}

            {navigation !== 'Contract Calls' && (
              <aside className="hidden xl:block xl:col-span-4">
                <div className="sticky top-4 space-y-4">
                  <h2 className="px-6 text-4xl font-extrabold text-gray-900 sm:pr-12">
                    Card Preview
                  </h2>

                  {selectedNft.tokenId && (
                    <div className="width-full px-6 bg-gray-100 rounded-lg">
                      <PreviewCard nft={selectedNft} />
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
