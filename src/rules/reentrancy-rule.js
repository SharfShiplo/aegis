const BaseRule = require('./base-rule');
const LocationHelper = require('./location-helper');

class ReentrancyRule extends BaseRule {
  constructor() {
    super(
      'REENTRANCY',
      'Reentrancy Vulnerability',
      'Detects potential reentrancy vulnerabilities in external calls',
      'CRITICAL'
    );
  }

  check(astContext) {
    const findings = [];
    const { ast, source, filePath } = astContext;

    this.traverseAST(ast, (node) => {
      if (node.type === 'FunctionDefinition') {
        const externalCalls = this.findExternalCalls(node);
        
        // Simplified: Flag any external calls in functions that modify state
        // Full reentrancy detection requires control flow analysis
        for (const call of externalCalls) {
          const line = LocationHelper.getLine(call);
          const column = LocationHelper.getColumn(call);
          
          findings.push(
            this.createFinding(
              'CRITICAL',
              'Potential reentrancy: External call detected',
              filePath,
              line,
              column,
              'Follow checks-effects-interactions pattern: update state before external calls, or use ReentrancyGuard'
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

  findExternalCalls(node) {
    const calls = [];
    this.traverseAST(node, (n) => {
      if (n.type === 'FunctionCall') {
        const expression = n.expression;
        if (expression.type === 'MemberAccess') {
          const member = expression.memberName;
          if (['call', 'delegatecall', 'send', 'transfer'].includes(member)) {
            calls.push(n);
          }
        } else if (expression.type === 'Identifier' && 
                   ['call', 'delegatecall'].includes(expression.name)) {
          calls.push(n);
        }
      }
    });
    return calls;
  }

}

module.exports = ReentrancyRule;
