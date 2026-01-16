const ReentrancyRule = require('../../rules/reentrancy-rule');
const ASTParser = require('../../ast/parser');

describe('ReentrancyRule', () => {
  let rule;

  beforeEach(() => {
    rule = new ReentrancyRule();
  });

  test('should detect reentrancy vulnerability when state is modified after external call', () => {
    const code = `
      pragma solidity ^0.8.0;
      
      contract Vulnerable {
          mapping(address => uint256) public balances;
          
          function withdraw(uint256 amount) public {
              require(balances[msg.sender] >= amount);
              msg.sender.call{value: amount}("");
              balances[msg.sender] -= amount; // State change after call - VULNERABLE
          }
      }
    `;

    const astContext = ASTParser.parse(code, 'test.sol');
    const findings = rule.check(astContext);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some(f => f.ruleId === 'REENTRANCY' && f.severity === 'CRITICAL')).toBe(true);
  });

  test('should NOT flag safe pattern where state is updated before external call', () => {
    const code = `
      pragma solidity ^0.8.0;
      
      contract Safe {
          mapping(address => uint256) public balances;
          
          function withdraw(uint256 amount) public {
              require(balances[msg.sender] >= amount);
              balances[msg.sender] -= amount; // State change first - SAFE
              payable(msg.sender).transfer(amount); // External call after
          }
      }
    `;

    const astContext = ASTParser.parse(code, 'test.sol');
    const findings = rule.check(astContext);

    // Should not have CRITICAL findings
    const criticalFindings = findings.filter(f => f.severity === 'CRITICAL' && f.ruleId === 'REENTRANCY');
    expect(criticalFindings.length).toBe(0);
  });

  test('should skip functions with nonReentrant modifier', () => {
    const code = `
      pragma solidity ^0.8.0;
      
      contract Protected {
          mapping(address => uint256) public balances;
          
          function withdraw(uint256 amount) public nonReentrant {
              require(balances[msg.sender] >= amount);
              msg.sender.call{value: amount}("");
              balances[msg.sender] -= amount; // Protected by nonReentrant modifier
          }
      }
    `;

    const astContext = ASTParser.parse(code, 'test.sol');
    const findings = rule.check(astContext);

    // Should not have findings due to nonReentrant modifier
    const reentrancyFindings = findings.filter(f => f.ruleId === 'REENTRANCY');
    expect(reentrancyFindings.length).toBe(0);
  });

  test('should skip view and pure functions', () => {
    const code = `
      pragma solidity ^0.8.0;
      
      contract Test {
          mapping(address => uint256) public balances;
          
          function getBalance(address user) public view returns (uint256) {
              return balances[user];
          }
          
          function calculate(uint256 a, uint256 b) public pure returns (uint256) {
              return a * b;
          }
      }
    `;

    const astContext = ASTParser.parse(code, 'test.sol');
    const findings = rule.check(astContext);

    const reentrancyFindings = findings.filter(f => f.ruleId === 'REENTRANCY');
    expect(reentrancyFindings.length).toBe(0);
  });

  test('should detect external calls with different syntax', () => {
    const code = `
      pragma solidity ^0.8.0;
      
      contract Test {
          mapping(address => uint256) public balances;
          
          function withdraw(uint256 amount) public {
              require(balances[msg.sender] >= amount);
              (bool success, ) = msg.sender.call{value: amount}("");
              require(success);
              balances[msg.sender] -= amount; // After call - should flag
          }
      }
    `;

    const astContext = ASTParser.parse(code, 'test.sol');
    const findings = rule.check(astContext);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some(f => f.ruleId === 'REENTRANCY' && f.severity === 'CRITICAL')).toBe(true);
  });
});
