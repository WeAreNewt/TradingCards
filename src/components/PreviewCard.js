import { MailIcon, PhoneIcon } from '@heroicons/react/solid'
import { LightningBoltIcon, CreditCardIcon } from '@heroicons/react/outline'
import BAYC from '../assets/images/bayc.png'
import C1 from '../assets/images/c1.png'
import C2 from '../assets/images/c2.png'
import C3 from '../assets/images/c3.png'
import C4 from '../assets/images/c4.png'
import C5 from '../assets/images/c5.png'
import C6 from '../assets/images/c6.png'

import texture from '../assets/images/8.png'
import sticker from '../assets/images/1.jpg'

const post = {
  title: 'Boost your conversion rate',
  href: '#',
  category: { name: 'Article', href: '#' },
  description:
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto accusantium praesentium eius.',
  date: 'Mar 16, 2020',
  datetime: '2020-03-16',
  imageUrl:
    'https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1679&q=80',
  readingTime: '6 min',
  author: {
    name: 'Roel Aufderehar',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
}

export default function Example(props) {
  const { nft, rarity } = props
  return (
    <div
      className={`w-full relative ${
        nft.metadata
          ? ''
          : 'border-gray-200 border-4 z-50 rounded-lg border-dashed '
      } `}
    >
      {!nft.metadata && <div className="w-full h-64" />}
      {!nft.metadata && <div className="w-full h-52" />}

      <div
        key={post.title}
        className={`${
          nft.metadata ? '' : 'hidden '
        } z-30 flex flex-col rounded-lg shadow-lg overflow-hidden p-2 bg-white absolute`}
        style={{
          backgroundImage: `url(${C4})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'Cover',
        }}
      >
        <div
          className="flex flex-col rounded-lg overflow-hidden p-2 bg-white"
          style={{
            backgroundColor: '#fbfbfb',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='180' height='170' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M81.28 88H68.413l19.298 19.298L81.28 88zm2.107 0h13.226L90 107.838 83.387 88zm15.334 0h12.866l-19.298 19.298L98.72 88zm-32.927-2.207L73.586 78h32.827l.5.5 7.294 7.293L115.414 87l-24.707 24.707-.707.707L64.586 87l1.207-1.207zm2.62.207L74 80.414 79.586 86H68.414zm16 0L90 80.414 95.586 86H84.414zm16 0L106 80.414 111.586 86h-11.172zm-8-6h11.173L98 85.586 92.414 80zM82 85.586L87.586 80H76.414L82 85.586zM17.414 0L.707 16.707 0 17.414V0h17.414zM4.28 0L0 12.838V0h4.28zm10.306 0L2.288 12.298 6.388 0h8.198zM180 17.414L162.586 0H180v17.414zM165.414 0l12.298 12.298L173.612 0h-8.198zM180 12.838L175.72 0H180v12.838zM0 163h16.413l.5.5 7.294 7.293L25.414 172l-8 8H0v-17zm0 10h6.613l-2.334 7H0v-7zm14.586 7l7-7H8.72l-2.333 7h8.2zM0 165.414L5.586 171H0v-5.586zM10.414 171L16 165.414 21.586 171H10.414zm-8-6h11.172L8 170.586 2.414 165zM180 163h-16.413l-7.794 7.793-1.207 1.207 8 8H180v-17zm-14.586 17l-7-7h12.865l2.333 7h-8.2zM180 173h-6.613l2.334 7H180v-7zm-21.586-2l5.586-5.586 5.586 5.586h-11.172zM180 165.414L174.414 171H180v-5.586zm-8 5.172l5.586-5.586h-11.172l5.586 5.586zM152.933 25.653l1.414 1.414-33.94 33.942-1.416-1.416 33.943-33.94zm1.414 127.28l-1.414 1.414-33.942-33.94 1.416-1.416 33.94 33.943zm-127.28 1.414l-1.414-1.414 33.94-33.942 1.416 1.416-33.943 33.94zm-1.414-127.28l1.414-1.414 33.942 33.94-1.416 1.416-33.94-33.943zM0 85c2.21 0 4 1.79 4 4s-1.79 4-4 4v-8zm180 0c-2.21 0-4 1.79-4 4s1.79 4 4 4v-8zM94 0c0 2.21-1.79 4-4 4s-4-1.79-4-4h8zm0 180c0-2.21-1.79-4-4-4s-4 1.79-4 4h8z' fill='%231fbfe1' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        >
          <div className="flex-shrink-0 shadow-inner rounded-xl aspect-w-10 aspect-h-10">
            <img
              className="object-cover rounded-xl shadow-inner"
              src={nft.metadata ? nft.metadata.json.image : ''}
              alt=""
            />
          </div>

          <div className="flex-1 mt-3 flex flex-col justify-between ">
            <div
              className="flex-1 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 p-1 rounded-xl "
              style={{
                backgroundImage: `url(${C4})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'Cover',
                backgroundPosition: 'Center',
              }}
            >
              <div className="flex-1 bg-white rounded-xl">
                <div className="block ">
                  <p className=" rounded-t-xl text-xl px-2 pt-2 pb-1 font-semibold text-gray-900 border-b-2 border-dashed border-gray-200 ">
                    <div className="bg-clip-text text-transparent bg-gradient-to-r from-sky-800 via-blue-400 to-sky-800">
                      BAYC #2467 Trading Card
                    </div>
                  </p>
                  <p className="px-2 pb-1 text-base text-gray-500 flex flex-col space-y-0 mr-6 pt-1">
                    <div className="group flex items-center px-3 py-1 pt-1 text-sm font-medium rounded-md cursor-pointer">
                      <LightningBoltIcon className="text-yellow-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                      <div className="text-gray-700 text-md">
                        Ape has been traded 8 times
                      </div>
                    </div>
                    <div className="group flex items-center px-3 py-1 pt-0 text-sm font-medium rounded-md cursor-pointer pb-2 ">
                      <CreditCardIcon className="text-lime-600 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                      <div className="text-gray-700 text-md overflow-hidden whitespace-nowrap">
                        Ape has made 328 Eth in sales
                      </div>
                    </div>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-centershadow-sm rounded-md p-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200">
              <div className="flex-shrink-0">
                <a href={post.author.href}>
                  <span className="sr-only">{post.author.name}</span>
                  <img className="h-10 w-10 rounded-full" src={BAYC} alt="" />
                </a>
              </div>

              <div className="ml-3 w-full ">
                <p className="text-sm font-medium text-gray-900">
                  <a href={post.author.href} className="hover:underline">
                    Bored Ape Yacht Club
                  </a>
                </p>
                <div className="flex flex-row w-full justify-between">
                  <div className="flex space-x-1 text-sm text-gray-500">
                    <div>Id</div>
                    <div>2476/8000</div>
                  </div>
                  <div className="flex w-full justify-end items-end space-x-1 text-sm text-gray-500">
                    1/{rarity ? rarity.supply : 100}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*
      <div
        key={post.title}
        className={`${
          nft.metadata ? 'z-40' : 'hidden '
        } flex flex-col rounded-lg shadow-lg overflow-hidden p-2 bg-white transform translate-x-6 translate-y-4`}
        style={{
          backgroundImage: `url(${C5})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'Cover',
        }}
      >
        <div
          className="flex flex-col rounded-lg overflow-hidden p-2 bg-gray-200"
          style={{
            backgroundColor: '#fbfbfb',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='180' height='170' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M81.28 88H68.413l19.298 19.298L81.28 88zm2.107 0h13.226L90 107.838 83.387 88zm15.334 0h12.866l-19.298 19.298L98.72 88zm-32.927-2.207L73.586 78h32.827l.5.5 7.294 7.293L115.414 87l-24.707 24.707-.707.707L64.586 87l1.207-1.207zm2.62.207L74 80.414 79.586 86H68.414zm16 0L90 80.414 95.586 86H84.414zm16 0L106 80.414 111.586 86h-11.172zm-8-6h11.173L98 85.586 92.414 80zM82 85.586L87.586 80H76.414L82 85.586zM17.414 0L.707 16.707 0 17.414V0h17.414zM4.28 0L0 12.838V0h4.28zm10.306 0L2.288 12.298 6.388 0h8.198zM180 17.414L162.586 0H180v17.414zM165.414 0l12.298 12.298L173.612 0h-8.198zM180 12.838L175.72 0H180v12.838zM0 163h16.413l.5.5 7.294 7.293L25.414 172l-8 8H0v-17zm0 10h6.613l-2.334 7H0v-7zm14.586 7l7-7H8.72l-2.333 7h8.2zM0 165.414L5.586 171H0v-5.586zM10.414 171L16 165.414 21.586 171H10.414zm-8-6h11.172L8 170.586 2.414 165zM180 163h-16.413l-7.794 7.793-1.207 1.207 8 8H180v-17zm-14.586 17l-7-7h12.865l2.333 7h-8.2zM180 173h-6.613l2.334 7H180v-7zm-21.586-2l5.586-5.586 5.586 5.586h-11.172zM180 165.414L174.414 171H180v-5.586zm-8 5.172l5.586-5.586h-11.172l5.586 5.586zM152.933 25.653l1.414 1.414-33.94 33.942-1.416-1.416 33.943-33.94zm1.414 127.28l-1.414 1.414-33.942-33.94 1.416-1.416 33.94 33.943zm-127.28 1.414l-1.414-1.414 33.94-33.942 1.416 1.416-33.943 33.94zm-1.414-127.28l1.414-1.414 33.942 33.94-1.416 1.416-33.94-33.943zM0 85c2.21 0 4 1.79 4 4s-1.79 4-4 4v-8zm180 0c-2.21 0-4 1.79-4 4s1.79 4 4 4v-8zM94 0c0 2.21-1.79 4-4 4s-4-1.79-4-4h8zm0 180c0-2.21-1.79-4-4-4s-4 1.79-4 4h8z' fill='%23D8BFD8' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        >
          <div className="flex-shrink-0 shadow-inner rounded-xl aspect-w-10 aspect-h-10">
            <div className="w-full h-full bg-indigo-200 rounded-xl" />
          </div>

          <div className="flex-1 mt-3 flex flex-col justify-between ">
            <div className="flex-1">
              <a href={post.href} className="block ">
                <p className="text-xl font-semibold text-gray-900">
                  BAYC #2467 Trading Card
                </p>
                <p className="mt-3 text-base text-gray-500">
                  {post.description}
                </p>
              </a>
            </div>

            <div className="mt-6 flex items-center bg-white shadow-sm rounded-md p-2">
              <div className="flex-shrink-0">
                <a href={post.author.href}>
                  <span className="sr-only">{post.author.name}</span>
                  <img className="h-10 w-10 rounded-full" src={BAYC} alt="" />
                </a>
              </div>

              <div className="ml-3 w-full ">
                <p className="text-sm font-medium text-gray-900">
                  <a href={post.author.href} className="hover:underline">
                    Bored Ape Yacht Club
                  </a>
                </p>
                <div className="flex flex-row w-full justify-between">
                  <div className="flex space-x-1 text-sm text-gray-500">
                    <div>Id</div>
                    <div>2476/8000</div>
                  </div>
                  <div className="flex w-full justify-end items-end space-x-1 text-sm text-gray-500">
                    2/20
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      */}
    </div>
  )
}
