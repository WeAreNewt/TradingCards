import { useEffect, useState } from 'react'
import {
  ArrowNarrowLeftIcon,
  ArrowNarrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
} from '@heroicons/react/solid'
import {
  ClockIcon,
  TicketIcon,
  CreditCardIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/outline'
import { RadioGroup } from '@headlessui/react'
import PreviewCard from './PreviewCard'
import {
  giveApproval,
  stakeNft,
  mintNft,
  getApproval,
} from '../utils/helpers.js'
import { RARITY_TIERS } from '../utils/constants'

const steps = [
  { id: 1, name: 'Select NFT', href: '#', status: 'current' },
  { id: 2, name: 'Rarity', href: '#', status: 'upcoming' },
  { id: 3, name: 'Confirm', href: '#', status: 'upcoming' },
]

const plans = RARITY_TIERS

export default function Wizard(props) {
  const {
    wallet,
    isWrongChain,
    isLoadingCollections,
    collections,
    reloadBalances,
    reloadCards,
    connectButton,
  } = props

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isRightChain, setIsRightChain] = useState(false)
  const [isSwitchingChain, setIsSwitchingChains] = useState(false)

  const [isMintingNft, setIsMintingNft] = useState(false)
  const [isMintingCatNft, setIsMintingCatNft] = useState(false)
  const [isMintingToadNft, setIsMintingToadNft] = useState(false)

  const [isApproving, setIsApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [isMining, setIsMining] = useState(false)
  const [isMined, setIsMined] = useState(false)

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedNft, setSelectedNft] = useState({})
  const [selected, setSelected] = useState(plans[0])

  const [price, setPrice] = useState('')

  useEffect(() => {
    setSelected(plans[0])
  }, [])

  useEffect(() => {
    if (selectedNft.collection) {
      getApproval(wallet, selectedNft.collection).then((approved) => {
        setIsApproved(approved)
      })
    }
    setIsApproved(false)
  }, [selectedNft])

  const approve = async () => {
    if (selectedNft.collection && !isApproving) {
      setIsApproving(true)
      try {
        await giveApproval(wallet, selectedNft.collection)
        setIsApproved(true)
        setIsApproving(false)
      } catch (error) {
        console.log(error)
        setIsApproving(false)
      }
    }
  }

  const confirm = async () => {
    if (selectedNft.collection && !isApproving && isApproved && !isMining) {
      setIsMining(true)
      try {
        await stakeNft(
          wallet,
          selectedNft.collection,
          selectedNft.tokenId,
          selected,
          price,
        )
        setIsMined(true)
        setIsMining(false)
        reloadCards()
      } catch (error) {
        console.log(error)
        setIsMining(false)
      }
    }
  }

  if (!wallet || isWrongChain) {
    return (
      <>
        <main className="lg:col-span-9 xl:col-span-6">
          <h2 className="text-4xl mb-4 font-extrabold text-gray-900 sm:pr-12">
            TCG Wizard
          </h2>
          {connectButton()}
        </main>
      </>
    )
  }

  return (
    <>
      <main className="lg:col-span-9 xl:col-span-6 ">
        <h2 className="text-4xl mb-4 font-extrabold text-gray-900 sm:pr-12">
          TCG Wizard
        </h2>

        <nav aria-label="Progress" className="mb-4">
          <ol
            role="list"
            className="space-y-4 md:flex md:space-y-0 md:space-x-8"
          >
            {steps.map((step) => (
              <li key={step.name} className="md:flex-1">
                {currentStep === step.id ? (
                  <div
                    onClick={() => {
                      if (step.id < currentStep) {
                        setCurrentStep(step.id)
                      } else if (
                        step.id > currentStep &&
                        step.id === 2 &&
                        selectedNft
                      ) {
                        setCurrentStep(2)
                      } else if (
                        currentStep === 2 &&
                        step.id === 3 &&
                        selectedNft
                      ) {
                        setCurrentStep(3)
                      }
                    }}
                    className="group pl-4 py-2 flex flex-col border-l-4 border-sky-300 cursor-pointer hover:border-sky-400 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
                  >
                    <span className="text-xs text-sky-400 font-semibold tracking-wide uppercase group-hover:text-sky-500">
                      {step.id}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                ) : currentStep === step.id ? (
                  <div
                    onClick={() => {
                      if (step.id < currentStep) {
                        setCurrentStep(step.id)
                      } else if (
                        step.id > currentStep &&
                        step.id === 2 &&
                        selectedNft
                      ) {
                        setCurrentStep(2)
                      } else if (
                        currentStep === 2 &&
                        step.id === 3 &&
                        selectedNft
                      ) {
                        setCurrentStep(3)
                      }
                    }}
                    className="pl-4 py-2 flex flex-col border-l-4 border-sky-300 cursor-pointer md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
                    aria-current="step"
                  >
                    <span className="text-xs text-sky-400 font-semibold tracking-wide uppercase">
                      {step.id}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      if (step.id < currentStep) {
                        setCurrentStep(step.id)
                      } else if (
                        step.id > currentStep &&
                        step.id === 2 &&
                        selectedNft
                      ) {
                        setCurrentStep(2)
                      } else if (
                        currentStep === 2 &&
                        step.id === 3 &&
                        selectedNft
                      ) {
                        setCurrentStep(3)
                      }
                    }}
                    className="group pl-4 py-2 flex flex-col border-l-4 border-gray-200 cursor-pointer hover:border-gray-300 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
                  >
                    <span className="text-xs text-gray-500 font-semibold tracking-wide uppercase group-hover:text-gray-700">
                      {step.id}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {currentStep === 1 && (
          <ul
            role="list"
            className="grid grid-cols-2 bg-white p-4 rounded-lg gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
          >
            {collections
              .filter(
                (collection) =>
                  collection.collection.toLowerCase() !==
                  '0x486CFe11EEEEf1f38F5Ad17557a0049471c58A7e'.toLowerCase(),
              )
              .map((file) => (
                <li
                  onClick={() => setSelectedNft(file)}
                  key={file.collection + file.tokenId}
                  className={`relative ${
                    file.tokenId === selectedNft.tokenId &&
                    file.collection === selectedNft.collection
                      ? ''
                      : 'opacity-40'
                  }`}
                >
                  <div className="group block w-full aspect-w-10 aspect-h-10 rounded-lg bg-gray-100  overflow-hidden">
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
                    {file.collection ===
                    '0x7Cb60F872a8a9A8D2bf5ed50C862CAf5cb85D679'
                      ? 'BAYC'
                      : 'Cool Cat'}
                    : #{file.tokenId}
                  </p>
                  <p className="block text-sm font-medium text-gray-500 pointer-events-none">
                    {file.tokenId}
                  </p>
                </li>
              ))}
            <li
              onClick={async () => {
                if (!isMintingNft) {
                  setIsMintingNft(true)
                  try {
                    await mintNft(
                      wallet,
                      '0x7Cb60F872a8a9A8D2bf5ed50C862CAf5cb85D679',
                    )
                  } catch (error) {
                    setIsMintingNft(false)
                  }
                  await reloadBalances()
                  setIsMintingNft(false)
                }
              }}
              key="test ape"
              className="relative"
            >
              <div className="group block w-full aspect-w-10 aspect-h-10 rounded-lg bg-gray-100 border-dashed border-4 overflow-hidden">
                {isMintingNft && (
                  <div className="w-full h-full flex justify-center items-center">
                    <svg
                      class="animate-spin mx-auto h-10 w-10 text-gray-300"
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
                  </div>
                )}
                <button
                  type="button"
                  className="absolute inset-0 focus:outline-none"
                ></button>
              </div>
              <p className="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">
                Mint
              </p>
              <p className="block text-sm font-medium text-gray-500 pointer-events-none">
                Test Ape Token
              </p>
            </li>
            <li
              onClick={async () => {
                if (!isMintingCatNft) {
                  setIsMintingCatNft(true)
                  try {
                    await mintNft(
                      wallet,
                      '0x29e3Ce5A46123A066d1CB9fD948110a4156D1163',
                    )
                  } catch (error) {
                    setIsMintingCatNft(false)
                  }
                  await reloadBalances()
                  setIsMintingCatNft(false)
                }
              }}
              key="test ape"
              className="relative"
            >
              <div className="group block w-full aspect-w-10 aspect-h-10 rounded-lg bg-gray-100 border-dashed border-4 overflow-hidden">
                {isMintingCatNft && (
                  <div className="w-full h-full flex justify-center items-center">
                    <svg
                      class="animate-spin mx-auto h-10 w-10 text-gray-300"
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
                  </div>
                )}
                <button
                  type="button"
                  className="absolute inset-0 focus:outline-none"
                ></button>
              </div>
              <p className="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">
                Mint
              </p>
              <p className="block text-sm font-medium text-gray-500 pointer-events-none">
                Cool Cat Token
              </p>
            </li>
          </ul>
        )}

        {currentStep === 2 && (
          <div
            className="bg-white px-4 py-8 rounded-lg shadow-inner"
            style={{
              background: 'linear-gradient(315deg, #ffffff 0%, #d7e1ec 74%)',
            }}
          >
            <div className="w-full">
              <div className="w-full max-w-md mx-auto">
                <RadioGroup value={selected} onChange={setSelected}>
                  <RadioGroup.Label className="sr-only">
                    Rarity
                  </RadioGroup.Label>
                  <div className="space-y-6">
                    {plans.map((plan) => (
                      <RadioGroup.Option
                        key={plan.name}
                        value={plan}
                        style={
                          selected === plan
                            ? plan.background
                            : { background: 'white' }
                        }
                        className={({ active, checked }) =>
                          `${active ? 'ring-none ' : ''}
                  ${checked ? 'bg-white shadow-md' : 'bg-white opacity-80'}
                    relative rounded-lg cursor-pointer flex focus:outline-none `
                        }
                      >
                        {({ active, checked }) => (
                          <>
                            <div className="flex items-center px-5 py-3 pb-4 justify-between w-full cursor-pointer">
                              <div className="flex items-center">
                                <div className="text-sm">
                                  <RadioGroup.Label
                                    as="p"
                                    className={`font-medium inline-flex items-center text-lg justify-between ${
                                      plan === selected
                                        ? 'text-white font-bold text-2xl'
                                        : 'text-gray-900'
                                    }
                                    `}
                                  >
                                    {plan.name}
                                    <ExclamationCircleIcon className="ml-2 h-4 w-4 text-gray-300 hover:text-gray-500 cursor-pointer" />
                                  </RadioGroup.Label>
                                  <RadioGroup.Description
                                    as="span"
                                    className={`pt-1 grid grid-cols-3 gap-1 text-md items-center ${
                                      plan === selected
                                        ? 'text-gray-50 font-bold'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    <div className="flex flex-row items-center space-x-1 w-24">
                                      <TicketIcon
                                        className={`${
                                          selected === plan
                                            ? 'text-white'
                                            : 'text-gray-300'
                                        } w-5 inline`}
                                      />
                                      <span>
                                        {plan.supply}
                                        {' cards'}
                                      </span>
                                    </div>
                                    <div className="flex flex-row items-center space-x-1 w-24">
                                      <ClockIcon
                                        className={`${
                                          selected === plan
                                            ? 'text-white'
                                            : 'text-gray-300'
                                        } w-5 inline`}
                                      />
                                      <span>
                                        {plan.duration} {plan.durationType}
                                      </span>
                                    </div>
                                    {/*
                                    <div className="flex flex-row items-center space-x-1 w-24">
                                      <CreditCardIcon
                                        className={`${
                                          selected === plan
                                            ? 'text-white'
                                            : 'text-gray-300'
                                        } w-5 inline`}
                                      />
                                      <span>
                                        {plan.price}
                                        {' Eth'}
                                      </span>
                                    </div>
                                      */}
                                  </RadioGroup.Description>
                                </div>
                              </div>

                              {/* checked && (
                                <div className="flex-shrink-0 text-lime-500">
                                  <CheckIcon className="w-6 h-6" />
                                </div>
                              ) */}
                            </div>
                          </>
                        )}
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )}
        {currentStep === 3 && (
          <>
            <div className="bg-white px-4 py-3 rounded-lg space-y-4 mb-6 shadow">
              <div className="w-full flex flex-row space-between items-center">
                <div className="flex flex-col">
                  <h2 className="text-lg font-medium text-gray-900">
                    Set trading card mint price
                  </h2>
                  <p className="mt-1 mb-2 text-sm text-gray-500">
                    This is the price it will cost for users to mint a copy of
                    your nft. If you set it to 1 ETH and your card has a supply
                    cap of 3, you will receive 3 Eth (minus fees) if your card
                    is minted to it's supply cap.
                  </p>

                  <label
                    htmlFor="price"
                    className=" flex justify-between w-full text-sm font-medium text-gray-700"
                  >
                    Price
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Ξ</span>
                    </div>
                    <input
                      onChange={(e) => {
                        //setError('')
                        setPrice(e.target.value)
                      }}
                      type="text"
                      name="price"
                      id="price"
                      className="focus:ring-sky-300 focus:border-sky-300 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                      aria-describedby="price-currency"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span
                        className="text-gray-500 sm:text-sm"
                        id="price-currency"
                      >
                        ETH
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white px-8 py-6 rounded-lg space-y-4 ">
              <div className="w-full flex flex-row space-between items-center">
                <div className="flex flex-col">
                  <h2 className="text-lg font-medium text-gray-900">
                    1. Approve Contract
                  </h2>
                  <p className="mt-1 mb-2 text-sm text-gray-500">
                    In order to stake your nft you first need to give the
                    trading card contract approval to transfer your nft.
                  </p>
                </div>

                {!isApproved && (
                  <button
                    type="button"
                    onClick={() => approve()}
                    className="inline-flex flex-grow-1 min-w-16 max-w-16 h-12 items-center text-center justify-center mt-2 px-3 py-3 border border-transparent text-md leading-4 font-medium rounded-md text-orange-400 bg-orange-100 hover:bg-orange-200 "
                  >
                    {isApproving && (
                      <>
                        <div className="w-5" />
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
                        <div className="w-5" />
                      </>
                    )}
                    {!isApproving && 'Approve'}
                  </button>
                )}
                {isApproved && (
                  <button
                    type="button"
                    className="inline-flex flex-grow-1 max-w-16 h-12 items-center text-center justify-center mt-2 px-3 py-3 border border-transparent text-md leading-4 font-medium rounded-md text-lime-500 bg-lime-100"
                  >
                    Approved
                  </button>
                )}
              </div>
              <div
                className={`w-full flex flex-row space-between items-center ${
                  isApproved ? '' : 'opacity-25'
                }`}
              >
                <div className="flex flex-col">
                  <h2 className="text-lg font-medium text-gray-900">
                    2. Send Transaction
                  </h2>
                  <p className="mt-1 mb-2 text-sm text-gray-500">
                    As soon as your transaction gets mined, your trading cards
                    will be ready to mint.
                  </p>
                </div>
                {!isMined && (
                  <button
                    type="button"
                    onClick={() => {
                      confirm()
                    }}
                    className="inline-flex flex-grow-1 max-w-16 h-12 items-center text-center justify-center mt-2 px-3 py-3 border border-transparent text-md leading-4 font-medium rounded-md text-sky-400 bg-sky-100 hover:bg-sky-200 "
                  >
                    {isMining && (
                      <>
                        <div className="w-5" />
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
                        <div className="w-5" />
                      </>
                    )}
                    {!isMining && <div className="px-3">Send</div>}
                  </button>
                )}
                {isMined && (
                  <button
                    type="button"
                    className="inline-flex flex-grow-1 max-w-16 h-12 items-center text-center justify-center mt-2 px-3 py-3 border border-transparent text-md leading-4 font-medium rounded-md text-lime-500 bg-lime-100"
                  >
                    Mined
                  </button>
                )}
              </div>
              <div
                className={`w-full flex flex-row space-between items-center ${
                  isMined ? '' : 'opacity-25'
                }`}
              >
                <div className="flex flex-col">
                  <h2 className="text-lg font-medium text-gray-900">
                    3. Claim
                  </h2>
                  <p className="mt-1 mb-2 text-sm text-gray-500">
                    Your NFT is now locked for {selected.duration}{' '}
                    {selected.durationType}. After this period is over, you can
                    retrieve your nft from the vault
                  </p>
                </div>

                <button
                  type="button"
                  className="inline-flex flex-grow-1 max-w-16 h-12 whitespace-nowrap	 items-center text-center justify-center mt-2 px-3 py-3 border border-transparent text-md leading-4 font-medium rounded-md text-gray-400 bg-gray-100"
                >
                  See Vault
                </button>
              </div>
            </div>
          </>
        )}

        <div className="w-full flex flex-row justify-end items-center mt-2">
          {currentStep !== 3 && (
            <div
              onClick={() => {
                if (currentStep === 1 && selectedNft.collection) {
                  setCurrentStep(currentStep + 1)
                } else if (currentStep === 2) {
                  setCurrentStep(currentStep + 1)
                }
              }}
              className="border-transparent pl-1 cursor-pointer inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Next
              <ArrowNarrowRightIcon
                className="ml-3 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </main>

      <aside className="hidden xl:block xl:col-span-4">
        <div className="sticky top-4 space-y-4">
          <h2 className="px-6 text-4xl font-extrabold text-gray-900 sm:pr-12">
            Card Preview
          </h2>

          <div className="width-full px-6 bg-gray-100 rounded-lg">
            <PreviewCard
              nft={selectedNft}
              rarity={selected}
              price={price}
              isWizard={true}
            />
          </div>
        </div>
      </aside>
    </>
  )
}
