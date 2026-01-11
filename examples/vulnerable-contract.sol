// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract VulnerableContract {
    mapping(address => uint256) public balances;
    address public owner;
    
    // Vulnerable: tx.origin usage
    modifier onlyOwner() {
        require(tx.origin == owner, "Not owner");
        _;
    }
    
    // Vulnerable: Reentrancy - external call before state change
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        msg.sender.call{value: amount}("");
        balances[msg.sender] -= amount;
    }
    
    // Vulnerable: Unchecked low-level call
    function sendFunds(address payable recipient, uint256 amount) public {
        recipient.send(amount);
        // Missing return value check
    }
    
    // Vulnerable: Integer overflow (Solidity < 0.8)
    function addBalance(address user, uint256 amount) public {
        balances[user] += amount; // Potential overflow
    }
    
    // Vulnerable: Unbounded loop
    function distributeRewards(address[] memory recipients) public {
        for (uint i = 0; i < recipients.length; i++) {
            balances[recipients[i]] += 100;
        }
    }
    
    // Vulnerable: Deprecated function
    function emergencyDestroy() public onlyOwner {
        suicide(owner); // Deprecated: use selfdestruct
    }
    
    // Vulnerable: Integer operations
    function calculate(uint256 a, uint256 b) public pure returns (uint256) {
        return a * b; // Potential overflow
    }
}
