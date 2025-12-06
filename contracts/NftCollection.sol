// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NftCollection
 * @dev ERC-721 compatible NFT smart contract with minting, transfers, approvals, and metadata support.
 */
contract NftCollection {
    // ERC-721 Standard Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    // Configuration Events
    event MintingPaused();
    event MintingUnpaused();

    // Contract Configuration
    string public name = "NFT Collection";
    string public symbol = "NFT";
    uint256 public maxSupply = 10000;
    uint256 public totalSupply = 0;
    string public baseURI = "https://metadata.example.com/";

    // Access Control
    address private admin;
    bool private mintingPaused = false;

    // Token Data
    mapping(uint256 => address) private _tokenOwner;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Constructor
    constructor() {
        admin = msg.sender;
    }

    // ============ Access Control ============
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier notPaused() {
        require(!mintingPaused, "Minting is paused");
        _;
    }

    // ============ Admin Functions ============
    function pauseMinting() external onlyAdmin {
        mintingPaused = true;
        emit MintingPaused();
    }

    function unpauseMinting() external onlyAdmin {
        mintingPaused = false;
        emit MintingUnpaused();
    }

    function setBaseURI(string memory newBaseURI) external onlyAdmin {
        baseURI = newBaseURI;
    }

    // ============ ERC-721 Core Functions ============
    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "Address zero is not a valid owner");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = _tokenOwner[tokenId];
        require(owner != address(0), "ERC721: invalid token ID");
        return owner;
    }

    function safeMint(address to, uint256 tokenId) external onlyAdmin notPaused {
        _mint(to, tokenId);
    }

    function mint(address to, uint256 tokenId) external onlyAdmin notPaused {
        _mint(to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(_tokenOwner[tokenId] == from, "From address is not the owner");
        require(
            msg.sender == from || msg.sender == _tokenApprovals[tokenId] || _operatorApprovals[from][msg.sender],
            "Caller is not authorized to transfer"
        );

        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        transferFrom(from, to, tokenId);
        _checkOnERC721Received(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) external {
        transferFrom(from, to, tokenId);
        _checkOnERC721Received(from, to, tokenId, data);
    }

    function approve(address to, uint256 tokenId) external {
        address owner = _tokenOwner[tokenId];
        require(owner != address(0), "ERC721: approve to nonexistent token");
        require(msg.sender == owner || _operatorApprovals[owner][msg.sender], "Caller is not owner or approved operator");

        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external {
        require(operator != msg.sender, "Cannot approve yourself");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        require(_tokenOwner[tokenId] != address(0), "ERC721: approved query for nonexistent token");
        return _tokenApprovals[tokenId];
    }

    function isApprovedForAll(address owner, address operator) external view returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    // ============ Metadata Functions ============
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_tokenOwner[tokenId] != address(0), "ERC721: URI query for nonexistent token");
        return string(abi.encodePacked(baseURI, _toString(tokenId), ".json"));
    }

    // ============ Internal Functions ============
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Mint to the zero address");
        require(_tokenOwner[tokenId] == address(0), "Token already minted");
        require(totalSupply < maxSupply, "Max supply exceeded");
        require(tokenId > 0 && tokenId <= maxSupply, "Invalid token ID");

        _tokenOwner[tokenId] = to;
        _balances[to]++;
        totalSupply++;

        emit Transfer(address(0), to, tokenId);
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        _balances[from]--;
        _balances[to]++;
        _tokenOwner[tokenId] = to;
        _tokenApprovals[tokenId] = address(0);

        emit Transfer(from, to, tokenId);
    }

    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory data) internal {
        // Simple check - could be extended to call onERC721Received if to is a contract
        // For now, we accept all transfers
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        temp = value;
        while (temp != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(temp % 10)));
            temp /= 10;
        }
        return string(buffer);
    }

    // ============ Optional Burn Function ============
    function burn(uint256 tokenId) external {
        require(_tokenOwner[tokenId] == msg.sender, "Only token owner can burn");
        address owner = _tokenOwner[tokenId];
        
        _balances[owner]--;
        totalSupply--;
        delete _tokenOwner[tokenId];
        delete _tokenApprovals[tokenId];

        emit Transfer(owner, address(0), tokenId);
    }
}
