const BaseRule = require('./base-rule');
const LocationHelper = require('./location-helper');

class DeprecatedRule extends BaseRule {
  constructor() {
    super(
      'DEPRECATED',
      'Deprecated Functions/Opcodes',
      'Detects usage of deprecated Solidity functions and opcodes',
      'MEDIUM'
    );
  }

  check(astContext) {
    const findings = [];
    const { ast, source, filePath } = astContext;

    const deprecatedItems = {
      'callcode': 'callcode is deprecated, use delegatecall instead',
      'suicide': 'suicide is deprecated, use selfdestruct instead',
      'throw': 'throw is deprecated, use revert() or require() instead'
    };

    this.traverseAST(ast, (node) => {
      if (node.type === 'FunctionCall') {
        const expression = node.expression;
        if (expression.type === 'Identifier') {
          const name = expression.name;
          if (deprecatedItems[name]) {
            const line = LocationHelper.getLine(node);
            const column = LocationHelper.getColumn(node);
            
            findings.push(
              this.createFinding(
                'MEDIUM',
                `Use of deprecated function: ${name}`,
                filePath,
                line,
                column,
                deprecatedItems[name]
              )
            );
          }
        } else if (expression.type === 'MemberAccess') {
          const member = expression.memberName;
          if (deprecatedItems[member]) {
            const line = LocationHelper.getLine(node);
            const column = LocationHelper.getColumn(node);
            
            findings.push(
              this.createFinding(
                'MEDIUM',
                `Use of deprecated opcode/function: ${member}`,
                filePath,
                line,
                column,
                deprecatedItems[member]
              )
            );
          }
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

module.exports = DeprecatedRule;
