// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CoinDistributorWithLocker {
    struct LockedFunds {
        uint256 amount;
        uint256 releaseTime;
    }

    struct LockInfo {
        uint256 lockId;
        uint256 amount;
        uint256 releaseTime;
    }

    mapping(address => mapping(uint256 => LockedFunds)) public lockedFunds;
    mapping(address => uint256) public lockCount;  // Tracks the number of locks for each address
    mapping(address => uint256[]) public userLockIds;

    /**
    * @notice Distributes the BNB sent to this function to the specified wallets based on the given amounts.
    * @param recipients The list of wallet addresses to distribute to.
    * @param amounts The list of amounts for each recipient.
    */
    function distribute(address[] calldata recipients, uint256[] calldata amounts) external payable {
        require(recipients.length == amounts.length, "Recipients and amounts length mismatch");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        require(totalAmount <= msg.value, "Total amount exceeds sent value");

        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 amount = amounts[i];
            (bool success, ) = recipients[i].call{value: amount}("");
            require(success, "Transfer failed");
        }
    }

    /**
     * @notice Locks BNB in the contract for a specified period of time.
     * @param lockDuration The duration in seconds for which the funds will be locked.
     * @return newLockId The ID of the lock entry.
     */
    function lockFunds(uint256 lockDuration) external payable returns (uint256 newLockId) {
        require(msg.value > 0, "Must send some BNB to lock");
        require(lockDuration > 0, "Lock duration must be greater than zero");

        newLockId = lockCount[msg.sender];
        lockedFunds[msg.sender][newLockId] = LockedFunds({
            amount: msg.value,
            releaseTime: block.timestamp + lockDuration
        });

        userLockIds[msg.sender].push(newLockId);

        lockCount[msg.sender]++;  // Increment the lock count for the sender
    }

    /**
     * @notice Adds more funds to an existing lock entry.
     * @param lockId The ID of the lock entry to add funds to.
     */
    function lockFundsWithId(uint256 lockId) external payable {
        require(msg.value > 0, "Must send some BNB to lock");
        require(lockId < lockCount[msg.sender], "Lock ID does not exist");
        require(block.timestamp < lockedFunds[msg.sender][lockId].releaseTime, "Cannot add funds to a released lock");

        // Update the existing lock
        lockedFunds[msg.sender][lockId].amount += msg.value; // Increase locked amount
    }

    /**
     * @notice Allows users to withdraw a specific lock entry after its lock period has ended.
     * @param lockId The ID of the lock entry to withdraw.
     */
    function withdrawLockedFunds(uint256 lockId) external {
        LockedFunds storage userFunds = lockedFunds[msg.sender][lockId];
        require(userFunds.amount > 0, "No locked funds available for this lock ID");
        require(block.timestamp >= userFunds.releaseTime, "Funds are still locked");

        uint256 amountToTransfer = userFunds.amount;
        userFunds.amount = 0;  // Reset locked amount to prevent re-entrancy attacks
        
        // Remove from the lockId from the list of the user's lockIds
        for (uint256 i = 0; i < userLockIds[msg.sender].length; i++) {
            if (userLockIds[msg.sender][i] == lockId) {
                userLockIds[msg.sender][i] = userLockIds[msg.sender][userLockIds[msg.sender].length - 1];
                userLockIds[msg.sender].pop();
                break;
            }
        }

        (bool success, ) = msg.sender.call{value: amountToTransfer}("");
        require(success, "Transfer failed");
    }

    /**
    * @notice Retrieves a list of lock IDs that have reached their release time and are available for the specified locker.
    * @param locker The address whose ripe locks are being queried.
    * @return locks An array of lock information for ripe locks.
    */
    function getRipeLocks(address locker) external view returns (LockInfo[] memory locks) {
        uint256 counts = 0;

        // First pass: Count ripe locks
        for (uint256 i = 0; i < userLockIds[locker].length; i++) {
            if (block.timestamp >= lockedFunds[locker][userLockIds[locker][i]].releaseTime) {
                counts++;
            }
        }

        // Allocate memory for ripe locks
        locks = new LockInfo[](counts);
        uint256 index = 0;

        // Second pass: Populate ripe locks details
        for (uint256 i = 0; i < userLockIds[locker].length; i++) {
            uint256 lockId = userLockIds[locker][i];
            if (block.timestamp >= lockedFunds[locker][lockId].releaseTime) {
                locks[index] = LockInfo({
                    lockId: lockId,
                    amount: lockedFunds[locker][lockId].amount,
                    releaseTime: lockedFunds[locker][lockId].releaseTime
                });
                index++;
            }
        }
    }

    /**
    * @notice Retrieves a list of lock IDs, amounts, and release times for locks that are still inactive.
    * @param locker The address whose unripe locks are being queried.
    * @return locks An array of `LockInfo` structs containing inactive lock details.
    */
    function getUnRipeLocks(address locker) external view returns (LockInfo[] memory locks) {
        uint256 counts = 0;

        // First pass: Count unripe locks
        for (uint256 i = 0; i < userLockIds[locker].length; i++) {
            if (block.timestamp < lockedFunds[locker][userLockIds[locker][i]].releaseTime) {
                counts++;
            }
        }

        // Allocate memory for unripe locks
        locks = new LockInfo[](counts);
        uint256 index = 0;

        // Second pass: Populate unripe locks details
        for (uint256 i = 0; i < userLockIds[locker].length; i++) {
            uint256 lockId = userLockIds[locker][i];
            if (block.timestamp < lockedFunds[locker][lockId].releaseTime) {
                locks[index] = LockInfo({
                    lockId: lockId,
                    amount: lockedFunds[locker][lockId].amount,
                    releaseTime: lockedFunds[locker][lockId].releaseTime
                });
                index++;
            }
        }
    }

    /**
    * @notice Retrieves the total amount of locked funds for a specified locker.
    * @param locker The address whose total locked amount is being queried.
    * @return total The total amount of locked funds for the specified locker.
    */
    function getTotalLockedAmount(address locker) external view returns (uint256 total) {
        for (uint256 i = 0; i < userLockIds[locker].length; i++) {
            total += lockedFunds[locker][userLockIds[locker][i]].amount;
        }
    }
    
    function getTotalRipeLockedAmount(address locker) external view returns (uint256 total) {

        for (uint256 i = 0; i < userLockIds[locker].length; i++) {
            if (block.timestamp >= lockedFunds[locker][userLockIds[locker][i]].releaseTime) {
                total += lockedFunds[locker][userLockIds[locker][i]].amount; // Sum the amounts of unwithdrawn locks
            }
        }
    }

    function getTotalUnRipeLockedAmount(address locker) external view returns (uint256 total) {

        for (uint256 i = 0; i < userLockIds[locker].length; i++) {
            if (block.timestamp < lockedFunds[locker][userLockIds[locker][i]].releaseTime) {
                total += lockedFunds[locker][userLockIds[locker][i]].amount; // Sum the amounts of unwithdrawn locks
            }
        }
    }
}