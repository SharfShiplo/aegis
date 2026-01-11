const BaseRule = require('./base-rule');
const LocationHelper = require('./location-helper');

class IntegerOverflowRule extends BaseRule {
  constructor() {
    super(
      'INTEGER_OVERFLOW',
      'Integer Overflow/Underflow',
      'Detects potential integer overflow/underflow (only for Solidity < 0.8)',
      'HIGH'
    );
  }

  check(astContext) {
    const findings = [];
    const { ast, source, filePath, isVersion08Plus } = astContext;

    // Solidity >= 0.8.0 has built-in overflow protection
    if (isVersion08Plus) {
      return findings;
    }

    this.traverseAST(ast, (node) => {
      if (node.type === 'BinaryOperation') {
        const operator = node.operator;
        if (['+', '-', '*'].includes(operator)) {
          const line = LocationHelper.getLine(node);
          const column = LocationHelper.getColumn(node);
          
          findings.push(
            this.createFinding(
              'HIGH',
              `Potential integer ${operator === '+' ? 'overflow' : operator === '-' ? 'underflow' : 'overflow'} - no overflow protection in Solidity < 0.8`,
              filePath,
              line,
              column,
              'Use SafeMath library or upgrade to Solidity >= 0.8.0 which has built-in overflow protection'
            )
          );
        }
      } else if (node.type === 'UnaryOperation') {
        if (['++', '--'].includes(node.operator)) {
          const line = LocationHelper.getLine(node);
          const column = LocationHelper.getColumn(node);
          
          findings.push(
            this.createFinding(
              'MEDIUM',
              'Potential integer overflow/underflow with increment/decrement',
              filePath,
              line,
              column,
              'Use SafeMath library or upgrade to Solidity >= 0.8.0'
            )
          );
        }
      }
    });

    return findings;
  }

  traverseAST(node, callback) {
    if (!node) return;
    callback(node);
    
    for (const key in node) {
      if (key === 'parent' || key === 'range') continue;
      const value = node[key];
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item && typeof item === 'object') {
            this.traverseAST(item, callback);
          }
        });
      } else if (value && typeof value === 'object') {
        this.traverseAST(value, callback);
      }
    }
  }

}

module.exports = IntegerOverflowRule;
