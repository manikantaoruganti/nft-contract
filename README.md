# nft-contract

ERC-721 NFT Smart Contract with Comprehensive Automated Test Suite and Docker Support

## Overview

This project implements a fully functional, production-ready ERC-721 compatible non-fungible token (NFT) smart contract written in Solidity. It includes:

- **Complete ERC-721 Implementation**: Ownership, transfers, approvals, metadata support
- **Business Rules**: Maximum supply enforcement, token ID validation, minting pause/unpause
- **Comprehensive Test Suite**: Over 40 tests covering success paths, failure cases, events, and gas usage
- **Docker Support**: Fully containerized testing environment
- **Production Quality**: Access control, input validation, atomic state changes

## Project Structure

```
nft-contract/
├── contracts/
│   └── NftCollection.sol          # ERC-721 smart contract
├── test/
│   └── NftCollection.test.js      # Comprehensive test suite
├── package.json                   # NPM dependencies
├── hardhat.config.js              # Hardhat configuration
├── Dockerfile                     # Docker build configuration
├── .dockerignore                  # Docker ignore patterns
└── README.md                      # This file
```

## Installation

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- Docker (for containerized testing)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/manikantaoruganti/nft-contract.git
cd nft-contract

# Install dependencies
npm install

# Compile contracts
npm run compile
```

## Running Tests

### Locally

```bash
# Run all tests
npm test

# Run with verbose output
npm test -- --reporter spec
```

### Via Docker

```bash
# Build Docker image
docker build -t nft-contract .

# Run tests in Docker
docker run nft-contract
```

## Contract Features

### Core ERC-721 Functions
- `balanceOf(owner)` - Get number of tokens owned by address
- `ownerOf(tokenId)` - Get owner of a specific token
- `transferFrom(from, to, tokenId)` - Transfer token between addresses
- `safeTransferFrom(from, to, tokenId)` - Safe transfer with receiver validation
- `approve(to, tokenId)` - Approve address to transfer token
- `setApprovalForAll(operator, approved)` - Grant/revoke operator approval for all tokens
- `getApproved(tokenId)` - Get approved address for token
- `isApprovedForAll(owner, operator)` - Check if address is approved operator

### Business Rules
- `mint(to, tokenId)` - Mint new token (admin only)
- `burn(tokenId)` - Burn token and remove from circulation
- `pauseMinting()` - Pause minting (admin only)
- `unpauseMinting()` - Resume minting (admin only)
- `setBaseURI(newBaseURI)` - Update metadata base URI (admin only)

### Metadata
- `tokenURI(tokenId)` - Get metadata URI for token (base URI + tokenId format)
- `name()` - Contract name
- `symbol()` - Contract symbol
- `maxSupply()` - Maximum number of tokens
- `totalSupply()` - Current number of minted tokens

## Test Coverage

The test suite includes 40+ tests covering:

- ✅ Deployment and initial configuration
- ✅ Minting (success and failure cases)
- ✅ Minting pause/unpause functionality
- ✅ Token transfers (owner and approved transfers)
- ✅ Approvals (single token and operator-wide)
- ✅ Metadata retrieval
- ✅ Token burning
- ✅ Gas usage optimization
- ✅ Event emission validation
- ✅ Balance and supply invariants
- ✅ Authorization checks
- ✅ Input validation (zero address, non-existent tokens, etc.)

## Configuration

### package.json
- **Solidity**: ^0.8.20
- **Hardhat**: ^2.19.0
- **ethers.js**: ^6.0.0
- **Chai**: ^4.3.7

### Docker Configuration
- **Base Image**: node:18-alpine
- **Working Directory**: /app
- **Default Command**: `npx hardhat test`

## Security Considerations

- **Access Control**: Only contract owner/admin can mint, pause minting, and update configuration
- **Input Validation**: All public functions validate inputs (no zero address operations)
- **Atomic State Changes**: Token transfers and minting are atomic with full reverts on failure
- **ERC-721 Compliance**: Implements all required ERC-721 events and functions
- **No Re-entrancy**: Contract design prevents re-entrancy attacks

## Gas Optimization

- Efficient storage layout with mappings for O(1) lookups
- Minimal storage writes in transfer and approval functions
- Optimized Solidity ^0.8.20 compiler version
- Tests validate reasonable gas bounds for critical operations

## Deployment

To deploy to a live network:

```bash
# Create .env file with your private key and RPC URL
echo "PRIVATE_KEY=your_private_key" > .env
echo "RPC_URL=https://your-rpc-url" >> .env

# Deploy contract (requires deployment script)
# npx hardhat run scripts/deploy.js --network yournetwork
```

## License

MIT

## Author

Manikanta Venkateswarlu Oruganti

## Acknowledgments

- ERC-721 Standard: https://eips.ethereum.org/EIPS/eip-721
- Hardhat Documentation: https://hardhat.org/
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts/
- W3B
