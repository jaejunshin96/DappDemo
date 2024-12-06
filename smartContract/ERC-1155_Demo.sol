// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Pausable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Web3builder is ERC1155, Ownable, ERC1155Pausable, ERC1155Supply {
    uint256 public publicPrice = 0.002 ether;
    uint256 public allowListPrice = 0.001 ether;
    uint256 public maxSupply = 42;
    uint public maxPerWallet = 3;

    bool public publicMintOpen = false;
    bool public allowListMintOpen = true;

    mapping(address => bool) allowList;
    mapping(address => uint) purchasesPerWallet;

    constructor(address initialOwner)
        ERC1155("ipfs://QmUyN956522yEbjxp2qLyXkivc65pwrz9UVHkwQv2CuBhZ/")
        Ownable(initialOwner)
    {}

    function editMintWindows(
        bool _publicMintOpen,
        bool _allowListMintOpen
    ) external onlyOwner {
        publicMintOpen = _publicMintOpen;
        allowListMintOpen = _allowListMintOpen;
    }

    function setAllowList(address[] calldata addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            allowList[addresses[i]] = true;
        }
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function allowListMint(uint256 id, uint256 amount) public payable {
        require(allowListMintOpen, "AllowList Mint is closed");
        require(allowList[msg.sender], "You are not in the allowList");
        require(msg.value == allowListPrice * amount, "WRONG: Not engouth money sent");
        mint(id, amount);
    }

    function publicMint(uint256 id, uint256 amount)
        public
        payable
    {
        require(publicMintOpen, "Public Mint is closed");
        require(msg.value == publicPrice * amount, "WRONG: Not engouth money sent");
        mint(id, amount);
    }

    function mint(uint256 id, uint256 amount) internal {
        require(purchasesPerWallet[msg.sender] + amount <= maxPerWallet, "You have reacted the limit of purchase");
        require(id <= 3, "Sorry id is out of range");
        require(totalSupply(id) + amount <= maxSupply, "Sorry, not enough nfts for that amount");
        _mint(msg.sender, id, amount, "");
        purchasesPerWallet[msg.sender] += amount;
    }

    function withdraw(address _addr) external onlyOwner {
        uint256 balance = address(this).balance;
        payable(_addr).transfer(balance);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Pausable, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }

    function uri(uint256 _id) public view virtual override returns (string memory) {
        require(exists(_id), "URI: nonexistent token");

        return string(abi.encodePacked(super.uri(_id), Strings.toString(_id), ".json"));
    }
}
