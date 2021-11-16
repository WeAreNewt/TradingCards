// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TestApeToken is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter public _tokenIdCounter;

    constructor() ERC721("Test Ape Token Club", "TATC") {}

    function _baseURI() internal pure override returns (string memory) {
        return "https://l2g.eu.ngrok.io/metadata/";
    }

    function safeMint(address to) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }
}