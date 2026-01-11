const TxOriginRule = require('../../rules/tx-origin-rule');
const ASTParser = require('../../ast/parser');

describe('TxOriginRule', () => {
  let rule;

  beforeEach(() => {
    rule = new TxOriginRule();
  });

  test('should detect tx.origin usage', () => {
    const code = `
      pragma solidity ^0.8.0;
      
      contract Test {
          address public owner;
          
          modifier onlyOwner() {
              require(tx.origin == owner, "Not owner");
              _;
          }
      }
    `;

    const parsed = ASTParser.parse(code);
    const findings = rule.check(parsed);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].ruleId).toBe('TX_ORIGIN');
    expect(findings[0].severity).toBe('HIGH');
    expect(findings[0].message).toContain('tx.origin');
  });

  test('should not flag msg.sender', () => {
    const code = `
      pragma solidity ^0.8.0;
      
      contract Test {
          address public owner;
          
          modifier onlyOwner() {
              require(msg.sender == owner, "Not owner");
              _;
          }
      }
    `;

    const parsed = ASTParser.parse(code);
    const findings = rule.check(parsed);

    expect(findings.length).toBe(0);
  });
});
