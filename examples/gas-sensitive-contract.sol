// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * Gas-Sensitive Contract
 * 
 * This contract demonstrates secure Solidity patterns but may have MEDIUM findings
 * related to unbounded loops (gas limit considerations).
 * 
 * Note: While loops are bounded by require checks, the static analyzer may still
 * flag them as potentially unbounded. This is acceptable for many use cases but
 * should be reviewed for gas optimization.
 */
contract GasSensitiveContract is Ownable, ReentrancyGuard {
    mapping(address => uint256) public balances;
    
    // Safe: Uses msg.sender instead of tx.origin
    modifier onlyOwner() {
        require(msg.sender == owner(), "Not owner");
        _;
    }
    
    // Safe: Follows checks-effects-interactions pattern
    function withdraw(uint256 amount) public nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount; // State change first
        payable(msg.sender).transfer(amount); // External call after
    }
    
    // Safe: Uses transfer instead of send (transfer reverts on failure)
    function sendFunds(address payable recipient, uint256 amount) public {
        recipient.transfer(amount); // transfer reverts on failure, safer than send
    }
    
    // Safe: Solidity >= 0.8 has built-in overflow protection
    function addBalance(address user, uint256 amount) public {
        balances[user] += amount; // Safe in Solidity >= 0.8
    }
    
    // Safe: Bounded loop with explicit limit
    function distributeRewards(address[] memory recipients) public {
        require(recipients.length <= 100, "Too many recipients");
        for (uint i = 0; i < recipients.length; i++) {
            balances[recipients[i]] += 100;
        }
    }
    
    // Safe: Uses selfdestruct instead of suicide
    function emergencyDestroy() public onlyOwner {
        selfdestruct(payable(owner()));
    }
}
