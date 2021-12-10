// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TradingCards is ERC721, IERC721Receiver, ERC721Enumerable, ERC721URIStorage, Ownable {
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

    uint256 public stakedNftCounter = 0;
    uint256 public mintedCardCounter = 0;
    string public BASE_URI = "https://l2g.eu.ngrok.io/metadata/";

    mapping (address => bool) public NFT_WHITELIST;
    mapping (uint256 => StakedNft) public STAKED_NFTS;
    mapping (uint256 => uint256) public cardToStakedNft;
    mapping (address => mapping(uint256 => bool)) public hasNFTBeenStaked; // Only let users stake each nft once (or do a global cap on trading cards?) tbd


    constructor() ERC721("L2GraphsTest", "L2GT") {
    }

    function _raritySupply(uint8 rarity) internal pure returns(uint8 supply) {
        if (rarity == 0) {
            return (100); 
        } else if (rarity == 1) {
            return (10);
        } else if (rarity == 2) {
            return (3);
        } else if (rarity == 3) {
            return (1);
        }  else {
            return (0);
        }
    }

    function _rarityDuration(uint8 rarity) internal pure returns(uint32 duration) {
        if (rarity == 0) {
            return (43200);  // 12 hours
        } else if (rarity == 1) {
            return (86400);  // 24 hours
        } else if (rarity == 2) {
            return (259200); // 3 days
        } else if (rarity == 3) {
            return (604800); // 1 week
        } else {
            return (0);
        }
    }

    function stakeNft(address nftContract, uint256 nftId, uint256 price, uint8 rarity) external {
        require(rarity < 4, "Invalid rarity index");
        require(NFT_WHITELIST[nftContract] == true, "Target nft is not whitelisted for staking");
        require(hasNFTBeenStaked[nftContract][nftId] == false, "Target nft has already been staked");
        uint32 stakingDuration = _rarityDuration(rarity);
        uint8 cardSupply = _raritySupply(rarity);
        
        hasNFTBeenStaked[nftContract][nftId] = true; uint256 cardId = stakedNftCounter ++;
        STAKED_NFTS[cardId] = StakedNft(nftId, nftContract, uint32(block. timestamp), stakingDuration, cardSupply, 0, rarity, true, price, msg.sender);
        
        IERC721(nftContract).safeTransferFrom(msg.sender , address(this), nftId);
        emit NftStaked(cardId , nftContract , address(msg.sender), nftId , price , rarity , stakingDuration , cardSupply , block.timestamp);
    }
    
    function unstakeNft(uint256 cardId) external {
        StakedNft memory targetCard = STAKED_NFTS[cardId];
        require(block.timestamp >= targetCard.timestamp + targetCard.duration, "Staking period not over yet");
        require(targetCard.inVault == true, "Nft already unstaked");
        require(targetCard.owner == address(msg.sender), "Only the original nft staker can unstake");

        targetCard.inVault = false;
        IERC721(targetCard.tokenContract).safeTransferFrom(address(this), msg.sender, targetCard.tokenId);
        emit NftUnstaked(cardId, targetCard.tokenContract, msg.sender, targetCard.tokenId);
    }
    
    function buyTradingCard(uint256 cardId) external payable {
        StakedNft memory targetCard = STAKED_NFTS[cardId];
        require(targetCard.inVault == true, "Card is no longer staked");
        require(block.timestamp < (targetCard.timestamp + targetCard.duration), "Card minting window has passed");
        require(targetCard.copies < targetCard.supply, "Card has reached supply cap");
        require(msg.value == targetCard.price, "Incorrect amount of funds sent");

        STAKED_NFTS[cardId].copies++;
        uint256 cardNumber = mintedCardCounter ++;
        cardToStakedNft[cardNumber] = cardId;
        payable(targetCard.owner).transfer(msg.value); _safeMint(msg.sender , cardNumber);
        emit CardBought(cardId, targetCard.tokenContract, targetCard.owner, targetCard.tokenId, STAKED_NFTS[cardId].copies);
    }

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
    
    function onERC721Received(
        address operator, 
        address from, 
        uint256 tokenId, 
        bytes calldata data) external override pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    } 

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}
