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
import Wizard from './components/Wizard'
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
  const [isWrongChain, setIsWrongChain] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [navigation, setNavigation] = useState('Card Maker')

  const [account, setAccount] = useState('')
  const [collections, setCollections] = useState([])

  useEffect(() => {
    window.ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
      if (chainId !== '0x2') {
        setIsWrongChain(true)
      }
    })

    window.ethereum.on('accountsChanged', () => window.location.reload())
    window.ethereum.on('chainChanged', () => window.location.reload())
  }, [])

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

        setAccount(accounts[0])
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
              <Wizard wallet={account} collections={collections} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
