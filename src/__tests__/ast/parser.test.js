const ASTParser = require('../../ast/parser');

describe('ASTParser', () => {
  const simpleContract = `
    pragma solidity ^0.8.0;
    
    contract Test {
        uint256 public value;
    }
  `;

  test('should parse valid Solidity code', () => {
    const result = ASTParser.parse(simpleContract);
    expect(result.ast).toBeDefined();
    expect(result.source).toBe(simpleContract);
  });

  test('should extract version from pragma', () => {
    const version = ASTParser.extractVersion(simpleContract);
    expect(version).toBe('^0.8.0');
  });

  test('should return null for code without pragma', () => {
    const code = 'contract Test {}';
    const version = ASTParser.extractVersion(code);
    expect(version).toBeNull();
  });

  test('should detect version >= 0.8.0', () => {
    expect(ASTParser.isVersion08OrHigher('^0.8.0')).toBe(true);
    expect(ASTParser.isVersion08OrHigher('0.8.5')).toBe(true);
    expect(ASTParser.isVersion08OrHigher('>=0.8.0')).toBe(true);
    expect(ASTParser.isVersion08OrHigher('0.9.0')).toBe(true);
  });

  test('should detect version < 0.8.0', () => {
    expect(ASTParser.isVersion08OrHigher('^0.7.0')).toBe(false);
    expect(ASTParser.isVersion08OrHigher('0.7.6')).toBe(false);
    expect(ASTParser.isVersion08OrHigher('>=0.7.0')).toBe(false);
  });

  test('should throw error for invalid Solidity code', () => {
    const invalidCode = 'contract Test { invalid syntax }';
    expect(() => {
      ASTParser.parse(invalidCode);
    }).toThrow();
  });
});
