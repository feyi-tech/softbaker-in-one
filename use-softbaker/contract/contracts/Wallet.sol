// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./IERC20.sol";
interface IFactory {
    function receiveFunds(address from) external payable;
    function receiveTokens(address token, uint256 amount) external;
}

contract Wallet {

    address public factory;

    receive() external payable {
        IFactory(factory).receiveFunds{value: address(this).balance}(msg.sender);
    }

    constructor() {
        factory = msg.sender;
    }

    function initialize() external {
        require(msg.sender == factory, "Wallet: FORBIDDEN");
        IFactory(factory).receiveFunds{value: address(this).balance}(address(0));
    }

    // Approves the factory to pull ERC-20 tokens and calls receiveTokens
    function authorizeTokenTransfer(address token) external {
        require(msg.sender == factory, "Wallet: FORBIDDEN");
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "Wallet: NO_TOKENS");

        bool approved = IERC20(token).approve(factory, balance);
        require(approved, "Wallet: APPROVAL_FAILED");

        IFactory(factory).receiveTokens(token, balance);
    }
}