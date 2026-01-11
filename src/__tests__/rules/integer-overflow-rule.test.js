const IntegerOverflowRule = require('../../rules/integer-overflow-rule');
const ASTParser = require('../../ast/parser');

describe('IntegerOverflowRule', () => {
  let rule;

  beforeEach(() => {
    rule = new IntegerOverflowRule();
  });

  test('should detect integer operations in Solidity < 0.8', () => {
    const code = `
      pragma solidity ^0.7.0;
      
      contract Test {
          uint256 public value;
          
          function add(uint256 a, uint256 b) public pure returns (uint256) {
              return a + b;
          }
      }
    `;

    const parsed = ASTParser.parse(code);
    parsed.isVersion08Plus = false;
    const findings = rule.check(parsed);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].ruleId).toBe('INTEGER_OVERFLOW');
  });

  test('should not flag integer operations in Solidity >= 0.8', () => {
    const code = `
      pragma solidity ^0.8.0;
      
      contract Test {
          uint256 public value;
          
          function add(uint256 a, uint256 b) public pure returns (uint256) {
              return a + b;
          }
      }
    `;

    const parsed = ASTParser.parse(code);
    parsed.isVersion08Plus = true;
    const findings = rule.check(parsed);

    expect(findings.length).toBe(0);
  });
});
