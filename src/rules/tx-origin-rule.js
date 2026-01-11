const BaseRule = require('./base-rule');
const LocationHelper = require('./location-helper');

class TxOriginRule extends BaseRule {
  constructor() {
    super(
      'TX_ORIGIN',
      'tx.origin Authorization Misuse',
      'Detects use of tx.origin for authorization',
      'HIGH'
    );
  }

  check(astContext) {
    const findings = [];
    const { ast, source, filePath } = astContext;

    this.traverseAST(ast, (node) => {
      if (node.type === 'MemberAccess' && node.memberName === 'origin') {
        const expression = node.expression;
        if (expression.type === 'Identifier' && expression.name === 'tx') {
          const line = LocationHelper.getLine(node);
          const column = LocationHelper.getColumn(node);
          
          findings.push(
            this.createFinding(
              'HIGH',
              'Use of tx.origin for authorization - prefer msg.sender',
              filePath,
              line,
              column,
              'Use msg.sender instead of tx.origin. tx.origin can be manipulated by intermediate contracts in a call chain.'
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

module.exports = TxOriginRule;
