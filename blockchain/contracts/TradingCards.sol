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
    event NftStaked (uint256 indexed cardId, address indexed nftContract, address indexed nftOwner, uint256 nftId, uint256 price, uint256 rarity);
    event CardBought (uint256 indexed cardId, address indexed nftContract, address indexed nftOwner, uint256 nftId);

    struct StakedNft {
        address tokenContract;
        uint256 tokenId;
        address owner;
        uint256 timestamp;
        uint256 duration;
        uint256 price;
        uint256 supply;
        uint256 copies;
        bool inVault;
    }
    
    uint256 public stakedNftCounter = 0;
    uint256 public mintedNftCounter = 0;
    
    mapping (address => bool) public NFT_WHITELIST;
    mapping (uint256 => StakedNft) public STAKED_NFTS;
    mapping (uint256 => uint256) public cardToStakedNft;
    
    string public BASE_URI = "https://l2g.eu.ngrok.io/metadata/";

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize() initializer public {
        __ERC721_init("MyToken", "MTK");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __Ownable_init();
    }

    function _raritySupply(uint256 rarity) public pure returns(uint256 supply) {
        if (rarity == 0) {
            // SILVER => supply: 100
            return (100); 
        } else if (rarity == 1) {
            // GOLD => supply: 10
            return (10);
        } else if (rarity == 2) {
            // PLATINUM => supply: 3
            return (3);
        } else if (rarity == 3) {
            // TITANIUM => supply: 1
            return (1);
        }
    }

    function _rarityDuration(uint256 rarity) public pure returns(uint256 duration) {
        if (rarity == 0) {
            // SILVER => duration: 12 hours
            return (43200); 
        } else if (rarity == 1) {
            // GOLD => duration: 24 hours
            return (86400);
        } else if (rarity == 2) {
            // PLATINUM => duration: 3 days
            return (259200);
        } else if (rarity == 3) {
            // TITANIUM => duration: 1 week
            return (604800);
        }
    }

    function stakeNft(address nftContract, uint256 nftId, uint256 price, uint256 rarity) external {
        require(NFT_WHITELIST[nftContract] == true, "Target nft is not whitelisted for staking");
        
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), nftId);
        STAKED_NFTS[stakedNftCounter] = StakedNft(nftContract, nftId, msg.sender, block.timestamp, _raritySupply(rarity), price, _raritySupply(rarity), 0, true);

        emit NftStaked(stakedNftCounter, nftContract, address(msg.sender), nftId, price, rarity);
        stakedNftCounter++;
    }
    
    function unstakeNft(uint256 cardId) external {
        StakedNft memory targetCard = STAKED_NFTS[cardId];
        require(block.timestamp > targetCard.timestamp + targetCard.duration, "Staking period not over yet");
        require(targetCard.inVault == true, "Nft already unstaked");
        require(targetCard.owner == address(msg.sender), "Only the original nft staker can unstake");

        targetCard.inVault = false;
        IERC721(targetCard.tokenContract).safeTransferFrom(address(this), msg.sender, targetCard.tokenId);
        uint256 totalRevenue = targetCard.copies * targetCard.price;
        
        payable(msg.sender).transfer(totalRevenue);
    }
    
    
    function buyTradingCard(uint256 cardId) external payable {
        StakedNft memory targetCard = STAKED_NFTS[cardId];
        require(targetCard.inVault == true, "Nft is no longer staked");
        require(block.timestamp < targetCard.timestamp + targetCard.duration, "Nft minting window has passed");
        require(targetCard.copies < targetCard.supply, "Nft has reached supply cap");
        require(msg.value == targetCard.price, "Incorrect amount of funds sent");

        STAKED_NFTS[cardId].copies++;
        mintedNftCounter++;

        _safeMint(msg.sender, mintedNftCounter);

        cardToStakedNft[mintedNftCounter] = cardId;

        emit CardBought(cardId, targetCard.tokenContract, targetCard.owner, targetCard.tokenId);
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
