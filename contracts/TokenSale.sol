// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./MyERC20.sol";
import "./MyERC721.sol";

contract TokenSale {
    uint256 public ratio;
    uint256 public price;
    MyERC20Token public paymentToken;
    MyERC721 public nftContract;

    constructor(uint256 ratio_, uint256 price_, address paymentToken_, address nftContract_) {
        ratio = ratio_;
        price = price_;
        paymentToken = MyERC20Token(paymentToken_);
        nftContract = MyERC721(nftContract_);
    }

    function buyTokens() external payable {
        uint256 amountToBeMinted = msg.value * ratio;
        paymentToken.mint(msg.sender, amountToBeMinted);
    }

    function returnTokens(uint256 amount) external {
        paymentToken.burnFrom(msg.sender, amount);
        payable(msg.sender).transfer(amount / ratio);
    }

    function mintToken(uint256 nftId) external {
        paymentToken.transferFrom(msg.sender, address(this), price);
        // TODO: mint nft of id nftId
        nftContract.safeMint(msg.sender, nftId);
    }

}


