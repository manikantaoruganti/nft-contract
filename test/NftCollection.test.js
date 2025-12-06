const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NftCollection", function () {
  let nftContract;
  let owner, addr1, addr2, addrs;
  const maxSupply = 10000;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const NftCollection = await ethers.getContractFactory("NftCollection");
    nftContract = await NftCollection.deploy();
    await nftContract.waitForDeployment();
  });

  // ============ Deployment Tests ============
  describe("Deployment", function () {
    it("Should set correct initial configuration", async function () {
      expect(await nftContract.name()).to.equal("NFT Collection");
      expect(await nftContract.symbol()).to.equal("NFT");
      expect(await nftContract.maxSupply()).to.equal(maxSupply);
      expect(await nftContract.totalSupply()).to.equal(0);
    });
  });

  // ============ Minting Tests ============
  describe("Minting", function () {
    it("Should mint token to address", async function () {
      await nftContract.mint(addr1.address, 1);
      expect(await nftContract.ownerOf(1)).to.equal(addr1.address);
      expect(await nftContract.totalSupply()).to.equal(1);
    });

    it("Should increment balance on mint", async function () {
      await nftContract.mint(addr1.address, 1);
      await nftContract.mint(addr1.address, 2);
      const balance = await nftContract.balanceOf(addr1.address);
      expect(balance).to.equal(2);
    });

    it("Should revert when minting to zero address", async function () {
      await expect(nftContract.mint(ethers.ZeroAddress, 1)).to.be.revertedWith("Mint to the zero address");
    });

    it("Should revert on double mint", async function () {
      await nftContract.mint(addr1.address, 1);
      await expect(nftContract.mint(addr2.address, 1)).to.be.revertedWith("Token already minted");
    });

    it("Should revert when non-admin mints", async function () {
      await expect(nftContract.connect(addr1).mint(addr2.address, 1)).to.be.revertedWith("Only admin can call this function");
    });

    it("Should revert on invalid token ID", async function () {
      await expect(nftContract.mint(addr1.address, 0)).to.be.revertedWith("Invalid token ID");
      await expect(nftContract.mint(addr1.address, maxSupply + 1)).to.be.revertedWith("Invalid token ID");
    });

    it("Should emit Transfer event on mint", async function () {
      await expect(nftContract.mint(addr1.address, 1))
        .to.emit(nftContract, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, 1);
    });
  });

  // ============ Minting Pause Tests ============
  describe("Minting Pause", function () {
    it("Should pause minting", async function () {
      await nftContract.pauseMinting();
      await expect(nftContract.mint(addr1.address, 1)).to.be.revertedWith("Minting is paused");
    });

    it("Should unpause minting", async function () {
      await nftContract.pauseMinting();
      await nftContract.unpauseMinting();
      await nftContract.mint(addr1.address, 1);
      expect(await nftContract.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should emit pause events", async function () {
      await expect(nftContract.pauseMinting()).to.emit(nftContract, "MintingPaused");
      await expect(nftContract.unpauseMinting()).to.emit(nftContract, "MintingUnpaused");
    });
  });

  // ============ Transfer Tests ============
  describe("Transfers", function () {
    beforeEach(async function () {
      await nftContract.mint(owner.address, 1);
    });

    it("Should transfer token from owner", async function () {
      await nftContract.transferFrom(owner.address, addr1.address, 1);
      expect(await nftContract.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should update balances on transfer", async function () {
      await nftContract.transferFrom(owner.address, addr1.address, 1);
      expect(await nftContract.balanceOf(owner.address)).to.equal(0);
      expect(await nftContract.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should emit Transfer event", async function () {
      await expect(nftContract.transferFrom(owner.address, addr1.address, 1))
        .to.emit(nftContract, "Transfer")
        .withArgs(owner.address, addr1.address, 1);
    });

    it("Should revert transfer to zero address", async function () {
      await expect(nftContract.transferFrom(owner.address, ethers.ZeroAddress, 1)).to.be.revertedWith("Transfer to zero address");
    });

    it("Should revert transfer of non-existent token", async function () {
      await expect(nftContract.transferFrom(owner.address, addr1.address, 999)).to.be.revertedWith("From address is not the owner");
    });

    it("Should revert unauthorized transfer", async function () {
      await expect(nftContract.connect(addr1).transferFrom(owner.address, addr2.address, 1)).to.be.revertedWith("Caller is not authorized");
    });
  });

  // ============ Approval Tests ============
  describe("Approvals", function () {
    beforeEach(async function () {
      await nftContract.mint(owner.address, 1);
    });

    it("Should approve address for token", async function () {
      await nftContract.approve(addr1.address, 1);
      expect(await nftContract.getApproved(1)).to.equal(addr1.address);
    });

    it("Should emit Approval event", async function () {
      await expect(nftContract.approve(addr1.address, 1))
        .to.emit(nftContract, "Approval")
        .withArgs(owner.address, addr1.address, 1);
    });

    it("Approved address can transfer", async function () {
      await nftContract.approve(addr1.address, 1);
      await nftContract.connect(addr1).transferFrom(owner.address, addr2.address, 1);
      expect(await nftContract.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should revert approval of non-existent token", async function () {
      await expect(nftContract.approve(addr1.address, 999)).to.be.revertedWith("approve to nonexistent token");
    });
  });

  // ============ Operator Approval Tests ============
  describe("Operator Approvals", function () {
    beforeEach(async function () {
      await nftContract.mint(owner.address, 1);
    });

    it("Should set operator approval", async function () {
      await nftContract.setApprovalForAll(addr1.address, true);
      expect(await nftContract.isApprovedForAll(owner.address, addr1.address)).to.be.true;
    });

    it("Should emit ApprovalForAll event", async function () {
      await expect(nftContract.setApprovalForAll(addr1.address, true))
        .to.emit(nftContract, "ApprovalForAll")
        .withArgs(owner.address, addr1.address, true);
    });

    it("Operator can transfer any token", async function () {
      await nftContract.setApprovalForAll(addr1.address, true);
      await nftContract.connect(addr1).transferFrom(owner.address, addr2.address, 1);
      expect(await nftContract.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should revoke operator approval", async function () {
      await nftContract.setApprovalForAll(addr1.address, true);
      await nftContract.setApprovalForAll(addr1.address, false);
      expect(await nftContract.isApprovedForAll(owner.address, addr1.address)).to.be.false;
    });
  });

  // ============ Metadata Tests ============
  describe("Metadata", function () {
    beforeEach(async function () {
      await nftContract.mint(owner.address, 1);
    });

    it("Should return tokenURI", async function () {
      const uri = await nftContract.tokenURI(1);
      expect(uri).to.include("1.json");
    });

    it("Should revert tokenURI for non-existent token", async function () {
      await expect(nftContract.tokenURI(999)).to.be.revertedWith("URI query for nonexistent token");
    });
  });

  // ============ Burn Tests ============
  describe("Burn", function () {
    beforeEach(async function () {
      await nftContract.mint(owner.address, 1);
    });

    it("Should burn token", async function () {
      await nftContract.burn(1);
      expect(await nftContract.totalSupply()).to.equal(0);
      expect(await nftContract.balanceOf(owner.address)).to.equal(0);
    });

    it("Should emit Transfer event on burn", async function () {
      await expect(nftContract.burn(1))
        .to.emit(nftContract, "Transfer")
        .withArgs(owner.address, ethers.ZeroAddress, 1);
    });

    it("Should revert burn by non-owner", async function () {
      await expect(nftContract.connect(addr1).burn(1)).to.be.revertedWith("Only token owner can burn");
    });
  });

  // ============ Gas Tests ============
  describe("Gas Usage", function () {
    it("Mint + Transfer should be reasonable", async function () {
      const mintTx = await nftContract.mint(owner.address, 1);
      const mintReceipt = await mintTx.wait();
      const mintGas = mintReceipt.gasUsed;

      const transferTx = await nftContract.transferFrom(owner.address, addr1.address, 1);
      const transferReceipt = await transferTx.wait();
      const transferGas = transferReceipt.gasUsed;

      const totalGas = BigInt(mintGas) + BigInt(transferGas);
      const gasLimit = BigInt(400000); // Reasonable limit
      expect(totalGas).to.be.lessThan(gasLimit);
    });
  });
});
