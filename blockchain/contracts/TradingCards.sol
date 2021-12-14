// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TradingCards is ERC721Enumerable, Ownable {
    event NftWhitelisted (address indexed nftContract);
    event NftStaked (uint256 indexed cardId, address indexed nftContract, address indexed nftOwner, uint256 nftId, uint256 price, uint256 rarity, uint256 duration, uint256 supply, uint256 timestamp);
    event NftUnstaked (uint256 indexed cardId, address indexed nftContract, address indexed nftOwner, uint256 nftId);
    event CardBought (uint256 indexed cardId, address indexed nftContract, address indexed nftOwner, uint256 nftId, uint256 edition);

    struct StakedNft {
        uint256 tokenId;
        address tokenContract;
        uint32 timestamp;
        uint32 duration;
        uint8 supply;
        uint8 copies;
        uint8 rarity;
        bool inVault;
        uint256 price;
        address owner;
    }

    uint256 public mintStart;
    uint256 public mintEnd;

    uint256 public stakedNftCounter = 0;
    uint256 public mintedCardCounter = 0;
    string public BASE_URI = "https://l2g.eu.ngrok.io/metadata/";

    mapping (address => bool) public NFT_WHITELIST;
    mapping (uint256 => StakedNft) public STAKED_NFTS;
    mapping (uint256 => uint256) public cardToStakedNft;
    mapping (address => mapping(uint256 => bool)) public hasNFTBeenStaked;

    constructor() ERC721("L2GraphsTest", "L2GT") {
        mintStart = block.timestamp;
        mintEnd = block.timestamp + 1209600; // 2 weeks
    }

    /**
     * @notice Gets the supply cap for trading cards minted from a staked nft for a given rarity.
     *
     * @param rarity The rarity score that trading cards will have.
     * 
     * @return supply The total amount of trading cards that can be minted.
     */
    function _raritySupply(uint8 rarity) internal pure returns(uint8 supply) {
        if (rarity == 0) {
            return 100; 
        } else if (rarity == 1) {
            return 10;
        } else if (rarity == 2) {
            return 3;
        } else if (rarity == 3) {
            return 1;
        }  else {
            return 0;
        }
    }

    /**
     * @notice Gets the time an nft will be staked for a given rarity.
     *
     * @param rarity The rarity score that trading cards will have.
     * 
     * @return duration The duration in seconds for which an nft will be staked.
     */
    function _rarityDuration(uint8 rarity) internal pure returns(uint32 duration) {
        if (rarity == 0) {
            return 43200;  // 12 hours
        } else if (rarity == 1) {
            return 86400;  // 24 hours
        } else if (rarity == 2) {
            return 259200; // 3 days
        } else if (rarity == 3) {
            return 604800; // 1 week
        } else {
            return 0;
        }
    }

    /**
    * @notice Stakes an nft from a whitelisted contract allowing users to mint trading card versions of that nft,
    * for a specified price. Trading card minting is only possible for a limited time, and up to a set cap; both determined
    * by the specified rarity.
    *
    * @dev only rarity <= 3 are meaningful.
    *
    * @param nftContract The address of the ERC721 token to stake 
    * @param nftId The tokenId to stake
    * @param price The price for minting trading card(s)
    * @param rarity The rarity of the trading card(s)
    **/
    function stakeNft(address nftContract, uint256 nftId, uint256 price, uint8 rarity) external {
        require(rarity < 4, "Invalid rarity index");
        require(block.timestamp > mintStart && block.timestamp < mintEnd, "Contract window is closed");
        require(NFT_WHITELIST[nftContract] == true, "Target nft is not whitelisted for staking");
        require(hasNFTBeenStaked[nftContract][nftId] == false, "Target nft has already been staked before");
        uint32 stakingDuration = _rarityDuration(rarity);
        uint8 cardSupply = _raritySupply(rarity);
        
        hasNFTBeenStaked[nftContract][nftId] = true; 
        uint256 cardId = stakedNftCounter ++;
        STAKED_NFTS[cardId] = StakedNft(nftId, nftContract, uint32(block. timestamp), stakingDuration, cardSupply, 0, rarity, true, price, msg.sender);
        
        IERC721(nftContract).transferFrom(msg.sender , address(this), nftId);
        emit NftStaked(cardId , nftContract , address(msg.sender), nftId , price , rarity , stakingDuration , cardSupply , block.timestamp);
    }

    /**
     * @notice Unstakes a staked nft, returning it to the original stakers wallet. Can't be called until
     * the rarity dependent staking duration is over. Can only be called by the original staker.
     *
     * @param cardId The id of the trading card made from the underlying staked nft.
     */
    function unstakeNft(uint256 cardId) external {
        StakedNft memory targetCard = STAKED_NFTS[cardId];
        require(block.timestamp >= targetCard.timestamp + targetCard.duration, "Staking period not over yet");
        require(targetCard.inVault == true, "Nft already unstaked");
        require(targetCard.owner == address(msg.sender), "Only the original nft staker can unstake");

        targetCard.inVault = false;
        IERC721(targetCard.tokenContract).transferFrom(address(this), msg.sender, targetCard.tokenId);
        emit NftUnstaked(cardId, targetCard.tokenContract, msg.sender, targetCard.tokenId);
    }

    /**
     * @notice Mints a trading card nft of a staked nft. The price, and rarity being dependent having been set
     * by the staker.
     *
     * @dev If no one buys a trading card version of a staked nft within the staking duration, that nft can not be 
     * staked again later. This is intended behavior, and creates an interesting dynamic in terms of determining price.
     *
     * @param cardId The id of the trading card to be minted.
     */
    function buyTradingCard(uint256 cardId) external payable {
        require(block.timestamp > mintStart && block.timestamp < mintEnd, "Contract window is closed");
        StakedNft memory targetCard = STAKED_NFTS[cardId];
        require(targetCard.inVault == true, "Card is no longer staked");
        require(block.timestamp < (targetCard.timestamp + targetCard.duration), "Card minting window has passed");
        require(targetCard.copies < targetCard.supply, "Card has reached supply cap");
        require(msg.value == targetCard.price, "Incorrect amount of funds sent");

        STAKED_NFTS[cardId].copies++;
        uint256 cardNumber = mintedCardCounter ++;
        cardToStakedNft[cardNumber] = cardId;
        payable(targetCard.owner).transfer(msg.value);
        _mint(msg.sender , cardNumber);
        emit CardBought(cardId, targetCard.tokenContract, targetCard.owner, targetCard.tokenId, STAKED_NFTS[cardId].copies);
    }

    /**
     * @notice Returns the full publication struct for a given publication.
     *
     * @param cardId The id of the trading card to get the staking structure for
     *
     * @return cardInfo The StakedNft structure associated with a specified trading card
    */
    function getCardInfo(uint256 cardId) external view returns(StakedNft memory cardInfo) {
        return STAKED_NFTS[cardId];
    }
    
    function whitelistAddress(address nftContract) public onlyOwner {
        NFT_WHITELIST[nftContract] = true;
        emit NftWhitelisted(nftContract);
    }
    
    function _baseURI() internal view override returns (string memory) {
        return BASE_URI;
    }
    
    function setBaseUri(string memory _newUri) external onlyOwner {
        BASE_URI = _newUri;
    }
}