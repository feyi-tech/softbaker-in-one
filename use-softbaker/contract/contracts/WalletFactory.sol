// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./Address.sol";
import "./SafeMath.sol";
import "./IWallet.sol";
import "./Wallet.sol";
import "./IERC20.sol";

contract WalletFactory {
    using Address for address;
    using SafeMath for uint256;
    
    address[] public wallets;
    mapping(bytes32 => address) public saltToWallet;
    mapping(address => bytes32) public walletToSalt;
    mapping(address => bool) public walletCreated;
    mapping(address => uint256) public walletToDeposits;
    mapping(address => mapping(address => uint256)) public walletToTokenDeposits;

    mapping(address => bool) public isWalletCreator;
    address[] public walletCreators;

    address public owner;

    event WalletCreated(bytes32 indexed salt, address indexed wallet);
    event Transfer(address indexed from, address indexed toWallet, uint amount);
    event TokenTransfer(address indexed token, address indexed toWallet, uint amount);
    event FeesReturned(address indexed executor, uint amount);
    
    constructor(
        address walletCreator
    ) public {
        owner = msg.sender;
        isWalletCreator[walletCreator] = true;
        walletCreators.push(walletCreator);
    }

    function receiveFunds(address from) external payable {
        // You can implement distribution logic here
        if(walletCreated[msg.sender] && msg.value > 0) {
            walletToDeposits[msg.sender] += msg.value;
            emit Transfer(from, msg.sender, msg.value);
        }
    }
    
    function receiveTokens(address token, uint256 amount) external {
        require(walletCreated[msg.sender], "Factory: WALLET_NOT_CREATED");
        require(amount > 0, "Factory: INVALID_AMOUNT");

        bool success = IERC20(token).transferFrom(msg.sender, address(this), amount);
        require(success, "Factory: TRANSFER_FAILED");

        walletToTokenDeposits[msg.sender][token] += amount;
        emit TokenTransfer(token, msg.sender, amount);
    }


    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier onlyOwnerOrCreator() {
        require(msg.sender == owner || isWalletCreator[msg.sender], "Only the owner or wallet creator can call this function");
        _;
    }

    function changeOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }
    
    function addWalletCreator(address newWalletCreator) external onlyOwner {
        require(!isWalletCreator[newWalletCreator], "Wallet creator already exists");
        
        isWalletCreator[newWalletCreator] = true;
        walletCreators.push(newWalletCreator);
    }
    
    function removeWalletCreator(address walletCreatorToRemove) external onlyOwner {
        require(isWalletCreator[walletCreatorToRemove], "Wallet creator does not exist");
        
        // Remove from the mapping
        isWalletCreator[walletCreatorToRemove] = false;

        // Remove from the array
        for (uint256 i = 0; i < walletCreators.length; i++) {
            if (walletCreators[i] == walletCreatorToRemove) {
                walletCreators[i] = walletCreators[walletCreators.length - 1];
                walletCreators.pop();
                break;
            }
        }
    }

    function createWallets(bytes32[] memory salts, uint256 gasFeeReturn) external onlyOwnerOrCreator {
        bytes memory bytecode = type(Wallet).creationCode;
        address wallet;
        bytes32 salt;
        for (uint32 index = 0; index < salts.length; index++) {
            salt = salts[index];
            assembly {
                wallet := create2(0, add(bytecode, 32), mload(bytecode), salt)
            }
            walletCreated[wallet] = true;
            saltToWallet[salt] = wallet;
            walletToSalt[wallet] = salt;
            wallets.push(wallet);
            emit WalletCreated(salt, wallet);
            IWallet(wallet).initialize();
        }
        uint256 amount = address(this).balance;
        if(amount > gasFeeReturn && gasFeeReturn > 0) {
            payable(msg.sender).transfer(gasFeeReturn);
        }
    }

    function moveTokens(bytes32[] memory salts, uint256 gasFeeReturn) external onlyOwnerOrCreator {
        bytes memory bytecode = type(Wallet).creationCode;
        address wallet;
        bytes32 salt;
        for (uint32 index = 0; index < salts.length; index++) {
            salt = salts[index];
            assembly {
                wallet := create2(0, add(bytecode, 32), mload(bytecode), salt)
            }
            walletCreated[wallet] = true;
            saltToWallet[salt] = wallet;
            walletToSalt[wallet] = salt;
            wallets.push(wallet);
            emit WalletCreated(salt, wallet);
            IWallet(wallet).initialize();
        }
        uint256 amount = address(this).balance;
        if(amount > gasFeeReturn && gasFeeReturn > 0) {
            payable(msg.sender).transfer(gasFeeReturn);
        }
    }

    function getTxFee(uint256 txFee) external onlyOwnerOrCreator {
        payable(msg.sender).transfer(txFee);
    }
    
    function distributeEther(address[] calldata uwallets, uint256[] calldata amounts) external onlyOwnerOrCreator {
        require(uwallets.length == amounts.length, "Arrays length mismatch");

        for (uint256 i = 0; i < uwallets.length; i++) {
            // Transfer ether to the wallet
            payable(uwallets[i]).transfer(amounts[i]);
        }
    }

    function getSaltAddress(bytes32 salt) public view returns (address wallet, bool isCreated) {
        (wallet, isCreated) = _getSaltAddress(salt);
    }

    function _getSaltAddress(bytes32 salt) private view returns (address wallet, bool isCreated) {
        wallet = saltToWallet[salt];
        isCreated = walletCreated[wallet];
        if(!isCreated) {
            bytes memory bytecode = type(Wallet).creationCode;
            bytes32 bytecodeHash = keccak256(bytecode);
            wallet = address(uint160(uint256(keccak256(abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                bytecodeHash
            )))));
        }
    }

    function getAllSaltsTotalBalance(bytes32[] memory salts) external view returns(uint256 totalBalance) {
        address wallet;
        bool isCreated;
        bytes32 salt;
        for (uint32 index = 0; index < salts.length; index++) {
            salt = salts[index];
            (wallet, isCreated) = _getSaltAddress(salt);
            totalBalance += isCreated? walletToDeposits[wallet] : wallet.balance;
        }
    }

    function getCreatedSaltsTotalBalance(bytes32[] memory salts) external view returns(uint256 totalBalance) {
        address wallet;
        bool isCreated;
        bytes32 salt;
        for (uint32 index = 0; index < salts.length; index++) {
            salt = salts[index];
            (wallet, isCreated) = _getSaltAddress(salt);
            if(isCreated) {
                totalBalance += walletToDeposits[wallet];
            }
        }
    }

    function getNonCreatedSaltsTotalBalance(bytes32[] memory salts) external view returns(uint256 totalBalance) {
        address wallet;
        bool isCreated;
        bytes32 salt;
        for (uint32 index = 0; index < salts.length; index++) {
            salt = salts[index];
            (wallet, isCreated) = _getSaltAddress(salt);
            if(!isCreated) {
                totalBalance += wallet.balance;
            }
        }
    }

    function walletsCount() external view returns (uint256) {
        return wallets.length;
    }
    
    function getSaltBalance(bytes32 salt) external view returns(address wallet, bool isCreated, uint256 balance) {
        (wallet, isCreated) = _getSaltAddress(salt);
        balance = isCreated? walletToDeposits[wallet] : wallet.balance;
    }
}