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
        // Skip view and pure functions - they don't modify state
        if (node.stateMutability === 'view' || node.stateMutability === 'pure') {
          return;
        }

        // Check for nonReentrant modifier - if present, skip this function
        if (node.modifiers && node.modifiers.some(mod => {
          const modName = mod.name ? (mod.name.name || mod.name) : mod;
          return modName === 'nonReentrant';
        })) {
          return;
        }

        // Check for reentrancy in function body
        const bodyFindings = this.checkFunctionBody(node, filePath);
        findings.push(...bodyFindings);
      }
    });

    return findings;
  }

  checkFunctionBody(functionNode, filePath) {
    const findings = [];
    
    if (!functionNode.body || !functionNode.body.statements) {
      return findings;
    }

    // Collect all external calls and state modifications with their positions
    const operations = this.collectOperations(functionNode.body);

    if (operations.externalCalls.length === 0 || operations.stateModifications.length === 0) {
      return findings; // No reentrancy risk if no external calls or no state changes
    }

    // Check if any state modification occurs AFTER an external call
    for (const call of operations.externalCalls) {
      const callLine = LocationHelper.getLine(call.node);
      
      // Find state modifications that occur after this external call
      for (const stateMod of operations.stateModifications) {
        const modLine = LocationHelper.getLine(stateMod.node);
        
        // Only flag if state modification line is greater than call line
        // This ensures we catch the pattern: external call, then state change
        if (modLine > 0 && callLine > 0 && modLine > callLine) {
          const line = LocationHelper.getLine(call.node);
          const column = LocationHelper.getColumn(call.node);
          
          findings.push(
            this.createFinding(
              'CRITICAL',
              'Potential reentrancy: State modification after external call detected',
              filePath,
              line,
              column,
              'Follow checks-effects-interactions pattern: update state before external calls, or use ReentrancyGuard'
            )
          );
          break; // Only flag once per external call
        }
      }
    }

    return findings;
  }

  collectOperations(body) {
    const externalCalls = [];
    const stateModifications = [];
    
    const traverse = (node, depth = 0) => {
      if (!node) return;
      
      // Check for external calls in any FunctionCall node
      if (this.isExternalCall(node)) {
        externalCalls.push({ node, depth });
      }
      
      // Check for state modifications
      if (this.isStateModification(node)) {
        stateModifications.push({ node, depth });
      }
      
      // Continue traversal
      if (node.type === 'Block' && node.statements) {
        node.statements.forEach(stmt => traverse(stmt, depth));
      } else if (node.type === 'IfStatement') {
        traverse(node.trueBody, depth + 1);
        traverse(node.falseBody, depth + 1);
      } else if (node.type === 'ForStatement' || node.type === 'WhileStatement') {
        traverse(node.body, depth + 1);
      } else if (node.type === 'ExpressionStatement' && node.expression) {
        // Also check the expression itself
        traverse(node.expression, depth);
      } else {
        // Recursively traverse all properties
        for (const key in node) {
          if (key === 'parent' || key === 'range' || key === 'loc') continue;
          const value = node[key];
          if (Array.isArray(value)) {
            value.forEach(item => {
              if (item && typeof item === 'object') {
                traverse(item, depth);
              }
            });
          } else if (value && typeof value === 'object') {
            traverse(value, depth);
          }
        }
      }
    };
    
    traverse(body);
    
    return { externalCalls, stateModifications };
  }

  isExternalCall(node) {
    if (!node) return false;
    
    if (node.type === 'FunctionCall') {
      const expression = node.expression;
      
      // Handle direct MemberAccess: msg.sender.call()
      if (expression.type === 'MemberAccess') {
        const member = expression.memberName;
        if (['call', 'delegatecall', 'send', 'transfer'].includes(member)) {
          return true;
        }
      }
      // Handle call with value: msg.sender.call{value: amount}()
      // In AST, this is represented as FunctionCall with NameValueExpression
      else if (expression.type === 'NameValueExpression' && expression.expression) {
        const nestedExpr = expression.expression;
        if (nestedExpr.type === 'MemberAccess') {
          const member = nestedExpr.memberName;
          if (['call', 'delegatecall', 'send', 'transfer'].includes(member)) {
            return true;
          }
        }
      }
      // Handle direct Identifier: call()
      else if (expression.type === 'Identifier' && 
               ['call', 'delegatecall'].includes(expression.name)) {
        return true;
      }
    }
    
    return false;
  }

  isStateModification(node) {
    if (!node) return false;

    // Assignment to storage variables (e.g., balances[user] = value)
    if (node.type === 'Assignment') {
      const left = node.left;
      // Check if assignment target is likely a storage variable
      // This includes index access (balances[key]), member access (user.balance), or identifiers
      if (left.type === 'IndexAccess' || left.type === 'MemberAccess' || 
          (left.type === 'Identifier' && left.name)) {
        return true;
      }
    }

    // Compound assignments like balances[user] += amount or balances[user] -=
    if (node.type === 'BinaryOperation' && 
        (node.operator === '+=' || node.operator === '-=' || 
         node.operator === '*=' || node.operator === '/=')) {
      const left = node.left;
      // Check if left side is a storage variable access
      if (left && (left.type === 'IndexAccess' || left.type === 'MemberAccess' || 
                   (left.type === 'Identifier' && left.name))) {
        return true;
      }
    }

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

module.exports = ReentrancyRule;
