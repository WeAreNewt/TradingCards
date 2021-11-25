// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract TradingCards is Initializable, ERC721Upgradeable, IERC721ReceiverUpgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable, OwnableUpgradeable {
    event NftWhitelisted (address indexed nftContract);
    event NftStaked (uint256 indexed cardId, address indexed nftContract, address indexed nftOwner, uint256 nftId, uint256 price, uint256 rarity, uint256 duration, uint256 supply, uint256 timestamp);
    event CardBought (uint256 indexed cardId, address indexed nftContract, address indexed nftOwner, uint256 nftId, uint256 edition);

    struct StakedNft {
        address tokenContract;
        uint256 tokenId;
        address owner;
        uint256 timestamp;
        uint256 duration;
        uint256 price;
        uint256 supply;
        uint256 copies;
        uint256 rarity;
        bool inVault;
    }
    
    uint256 public stakedNftCounter;
    uint256 public mintedCardCounter;
    
    mapping (address => bool) public NFT_WHITELIST;
    mapping (uint256 => StakedNft) public STAKED_NFTS;
    mapping (uint256 => uint256) public cardToStakedNft;
    
    string public BASE_URI;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize() initializer public {
        __ERC721_init("MyToken", "MTK");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __Ownable_init();
        stakedNftCounter = 0;
        mintedCardCounter = 0;
        BASE_URI = "https://l2g.eu.ngrok.io/metadata/";
    }

    function _raritySupply(uint256 rarity) public pure returns(uint256 supply) {
        if (rarity == 0) {
            return (100); 
        } else if (rarity == 1) {
            return (10);
        } else if (rarity == 2) {
            return (3);
        } else if (rarity == 3) {
            return (1);
        }
    }

    function _rarityDuration(uint256 rarity) public pure returns(uint256 duration) {
        if (rarity == 0) {
            return (43200);  // 12 hours 
        } else if (rarity == 1) {
            return (86400);  // 24 hours
        } else if (rarity == 2) {
            return (259200); // 3 days
        } else if (rarity == 3) {
            return (604800); // 1 week
        }
    }

    function stakeNft(address nftContract, uint256 nftId, uint256 price, uint256 rarity) external {
        require(NFT_WHITELIST[nftContract] == true, "Target nft is not whitelisted for staking");
        uint256 stakingDuration = _rarityDuration(rarity);
        uint256 cardSupply = _raritySupply(rarity);
        
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), nftId);
        STAKED_NFTS[stakedNftCounter] = StakedNft(nftContract, nftId, msg.sender, block.timestamp, stakingDuration, price, cardSupply, 0, rarity, true);
        
        emit NftStaked(stakedNftCounter, nftContract, address(msg.sender), nftId, price, rarity, stakingDuration, cardSupply, block.timestamp);
        stakedNftCounter++;
    }
    
    function unstakeNft(uint256 cardId) external {
        StakedNft memory targetCard = STAKED_NFTS[cardId];
        require(block.timestamp > targetCard.timestamp + targetCard.duration, "Staking period not over yet");
        require(targetCard.inVault == true, "Nft already unstaked");
        require(targetCard.owner == address(msg.sender), "Only the original nft staker can unstake");

        targetCard.inVault = false;
        IERC721(targetCard.tokenContract).safeTransferFrom(address(this), msg.sender, targetCard.tokenId);
    }
    
    function buyTradingCard(uint256 cardId) external payable {
        StakedNft memory targetCard = STAKED_NFTS[cardId];
        require(targetCard.inVault == true, "Card is no longer staked");
        require(block.timestamp < (targetCard.timestamp + targetCard.duration), "Card minting window has passed");
        require(targetCard.copies < targetCard.supply, "Card has reached supply cap");
        require(msg.value == targetCard.price, "Incorrect amount of funds sent");

        STAKED_NFTS[cardId].copies++;

        cardToStakedNft[mintedCardCounter] = cardId;
        payable(targetCard.owner).transfer(msg.value);

        _safeMint(msg.sender, mintedCardCounter);
        
        emit CardBought(cardId, targetCard.tokenContract, targetCard.owner, targetCard.tokenId, STAKED_NFTS[cardId].copies);
        mintedCardCounter++;
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
        bytes calldata data) external override returns (bytes4) {
        return IERC721ReceiverUpgradeable.onERC721Received.selector;
    } 

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}
