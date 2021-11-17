// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TradingCards is ERC721, ERC721Enumerable, ERC721URIStorage, IERC721Receiver, Ownable {
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
    mapping (address => mapping (uint256 => uint256)) public nftToStakeId;
    mapping (uint256 => uint256) public mintedNftToSourceNft;
    
    string public BASE_URI = "https://l2g.eu.ngrok.io/metadata/";

    constructor() ERC721("L2GraphsTest", "L2GT") {
    }

    function stakeNft(address nftContract, uint256 nftId, uint256 duration, uint256 price, uint256 supply) external {
        require(NFT_WHITELIST[nftContract] == true, "Target nft is not whitelisted for staking");
        require(duration > 60, "Staking duration must be longer than 1 minute");
        require(price > 0, "Price must be greater than 1 Wei");
        require(supply > 0, "Supply must be atleast 1");
        
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), nftId);

        STAKED_NFTS[stakedNftCounter] = StakedNft(nftContract, nftId, msg.sender, block.timestamp, duration, price, supply, 0, true);
        nftToStakeId[nftContract][nftId] = stakedNftCounter;
        stakedNftCounter++;

    }
    
    function unstakeNft(address nftContract, uint256 nftId) external {
        require(block.timestamp > STAKED_NFTS[nftToStakeId[nftContract][nftId]].timestamp + STAKED_NFTS[nftToStakeId[nftContract][nftId]].duration, "Staking period not over yet");
        require(STAKED_NFTS[nftToStakeId[nftContract][nftId]].inVault == true, "Nft already unstaked");
        require(STAKED_NFTS[nftToStakeId[nftContract][nftId]].owner == address(msg.sender), "Only the original nft staker can unstake");

        STAKED_NFTS[nftToStakeId[nftContract][nftId]].inVault = false;
        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, nftId);
        
        uint256 totalRevenue = STAKED_NFTS[nftToStakeId[nftContract][nftId]].copies * STAKED_NFTS[nftToStakeId[nftContract][nftId]].price;
        
        payable(msg.sender).transfer(totalRevenue);
    }
    
    
    function buyTradingCard(address nftContract, uint256 nftId) external payable {
        require(STAKED_NFTS[nftToStakeId[nftContract][nftId]].inVault == true, "Nft is no longer staked");
        require(block.timestamp < STAKED_NFTS[nftToStakeId[nftContract][nftId]].timestamp + STAKED_NFTS[nftToStakeId[nftContract][nftId]].duration, "Nft minting window has passed");
        require(STAKED_NFTS[nftToStakeId[nftContract][nftId]].copies < STAKED_NFTS[nftToStakeId[nftContract][nftId]].supply, "Nft has reached supply cap");
        require(msg.value == STAKED_NFTS[nftToStakeId[nftContract][nftId]].price, "Incorrect amount of funds sent");

        mintedNftCounter++;
        _safeMint(msg.sender, mintedNftCounter);
        
        uint256 stakedNftId = nftToStakeId[nftContract][nftId];
        
        StakedNft storage updated_staked_nft = STAKED_NFTS[stakedNftId];
        updated_staked_nft.copies = updated_staked_nft.copies + 1;

        mintedNftToSourceNft[mintedNftCounter] = stakedNftId;
    }
    
    function whitelistAddress(address nftContract) public onlyOwner {
        NFT_WHITELIST[nftContract] = true;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return BASE_URI;
    }
    
    function setBaseUri(string memory _newUri) external onlyOwner {
        BASE_URI = _newUri;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function onERC721Received(
        address operator, 
        address from, 
        uint256 tokenId, 
        bytes calldata data) external override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
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
