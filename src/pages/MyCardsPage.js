import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { getNftMetadata } from '../utils/helpers'
import { COLLECTIONS, RARITY_TIERS } from '../utils/constants'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/solid'
import PreviewCard from '../components/PreviewCard'

const pages = [
  { name: 'Projects', href: '#', current: false },
  { name: 'Project Nero', href: '#', current: true },
]

export default function CollectionPage(props) {
  const { state, allCards, isAllCardsLoading } = props
  let location = useLocation()
  let navigate = useNavigate()

  const [isLoadingCollectionMeta, setIsLoadingCollectionMeta] = useState(
    state ? false : true,
  )
  const [collection, setCollection] = useState(state ? state : {})

  const [isCardsLoading, setIsCardsLoading] = useState(true)
  const [cards, setCards] = useState([])

  useEffect(() => {
    if (!state) {
      let collections = COLLECTIONS.filter(
        (_collection) =>
          _collection.address.toLowerCase() ===
          location.pathname
            .slice(location.pathname.indexOf('0x'))
            .toLowerCase(),
      )
      if (collections[0]) {
        setCollection(collections[0])
      } else {
        console.log(location)
        //navigate('/', { replace: true })
      }
    }
  }, [])

  const hydrateCards = async (cards) => {
    let hydratedCards = []
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i]
      console.log('card', card)
      let cardMetadata = await getNftMetadata(card.nftContract, card.nftId)
      card['image'] = cardMetadata.image
      card['metadata'] = { json: { image: cardMetadata.image } }
      hydratedCards.push(card)
    }

    setCards(hydratedCards)
    setIsCardsLoading(false)
  }

  useEffect(() => {
    if (allCards.length > 0) {
      console.log('ALL CARDS', allCards)
      hydrateCards(
        allCards.filter(
          (card) =>
            card.nftContract.toLowerCase() ===
            location.pathname
              .slice(location.pathname.indexOf('0x'))
              .toLowerCase(),
        ),
      ).then(() => {
        setIsCardsLoading(false)
      })
    } else if (isAllCardsLoading === false) {
      setIsCardsLoading(false)
    }
  }, [allCards, isAllCardsLoading])
  console.log('collection', collection)
  console.log('CollectionPage props', props)
  console.log('Cards', cards)
  if (!collection) {
    return <div></div>
  } else {
    return (
      <div className="w-full block lg:col-span-9 xl:col-span-10">
        <nav className="flex -mt-4 mb-4" aria-label="Breadcrumb">
          <ol role="list" className="flex items-center space-x-4">
            <li>
              <div>
                <Link to="/" className="text-gray-400 hover:text-gray-500">
                  <HomeIcon
                    className="flex-shrink-0 h-5 w-5"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Home</span>
                </Link>
              </div>
            </li>
            <div key="Explore">
              <div className="flex items-center">
                <ChevronRightIcon
                  className="flex-shrink-0 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />

                <Link
                  to="/explore"
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Explore
                </Link>
              </div>
            </div>
            <div to="/explore" key="Explore">
              <div className="flex items-center">
                <ChevronRightIcon
                  className="flex-shrink-0 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />

                <div className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                  {collection.name}
                </div>
              </div>
            </div>
          </ol>
        </nav>
        <h2 className="text-4xl mb-4 font-extrabold text-gray-900 px-6 sm:px-0 sm:pr-12">
          {collection.name}
        </h2>
        <div className="h-full mt-6 grid grid-cols-1 gap-y-2 gap-x-6 px-6 sm:px-0 sm:grid-cols-3 lg:grid-cols-3 xl:gap-x-12">
          {cards.map((card) => (
            <div className="relative ">
              <div // Link
                to={`/card/${collection.address}/${card.nftId}`}
                state={{ collection, card }}
                key={card.nftId}
                className="relative h-full flex flex-col "
              >
                <PreviewCard
                  nft={card}
                  rarity={
                    RARITY_TIERS[
                      Number(card.supply) === 100
                        ? 0
                        : Number(card.supply) === 10
                        ? 1
                        : Number(card.supply) === 3
                        ? 2
                        : 3
                    ]
                  }
                  price={card.price_eth}
                />

                <div className="mt-2 flex justify-between items-center ">
                  <div>
                    <p className=" text-xs text-gray-600">Price</p>
                    <h3 className=" text-md font-bold text-gray-700">
                      <div>{Number(card.price_eth).toFixed(2)} Ξ</div>
                    </h3>
                  </div>
                  <button className="bg-gray-300 text-gray-500 font-semibold text-md py-1 px-2 rounded-md hover:text-gray-700">
                    Buy now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}
