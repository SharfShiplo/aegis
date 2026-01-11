const BaseRule = require('./base-rule');
const LocationHelper = require('./location-helper');

class UncheckedCallRule extends BaseRule {
  constructor() {
    super(
      'UNCHECKED_CALL',
      'Unchecked Low-Level Call',
      'Detects unchecked low-level calls',
      'HIGH'
    );
  }

  check(astContext) {
    const findings = [];
    const { ast, source, filePath } = astContext;

    this.traverseAST(ast, (node) => {
      if (node.type === 'FunctionCall') {
        const expression = node.expression;
        if (expression.type === 'MemberAccess') {
          const member = expression.memberName;
          if (['call', 'delegatecall', 'callcode', 'send'].includes(member)) {
            // Simplified: flag all low-level calls
            // Full implementation would check for return value handling
            const line = LocationHelper.getLine(node);
            const column = LocationHelper.getColumn(node);
            
            findings.push(
              this.createFinding(
                'HIGH',
                `Low-level call: ${member}. Always check the return value.`,
                filePath,
                line,
                column,
                `Check the return value of ${member} or use a try-catch block. Low-level calls can fail silently.`
              )
            );
          }
        }
      }
    });

    return findings;
  }

  isCallChecked(node) {
    // Simplified: always flag unchecked calls
    // Full implementation would need parent context analysis
    return false;
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

module.exports = UncheckedCallRule;
