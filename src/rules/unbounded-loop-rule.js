const BaseRule = require('./base-rule');
const LocationHelper = require('./location-helper');

class UnboundedLoopRule extends BaseRule {
  constructor() {
    super(
      'UNBOUNDED_LOOP',
      'Unbounded Loop',
      'Detects potentially unbounded loops',
      'MEDIUM'
    );
  }

  check(astContext) {
    const findings = [];
    const { ast, source, filePath } = astContext;

    this.traverseAST(ast, (node) => {
      if (node.type === 'ForStatement') {
        const init = node.initExpression;
        const condition = node.conditionExpression;
        
        // Check if loop has a bounded condition
        const isBounded = this.isLoopBounded(condition, source);
        
        if (!isBounded) {
          const line = LocationHelper.getLine(node);
          const column = LocationHelper.getColumn(node);
          
          findings.push(
            this.createFinding(
              'MEDIUM',
              'Potentially unbounded loop - may cause gas limit issues',
              filePath,
              line,
              column,
              'Ensure loop has a bounded iteration count to avoid gas limit issues'
            )
          );
        }
      } else if (node.type === 'WhileStatement') {
        const condition = node.condition;
        const isBounded = this.isLoopBounded(condition, source);
        
        if (!isBounded) {
          const line = LocationHelper.getLine(node);
          const column = LocationHelper.getColumn(node);
          
          findings.push(
            this.createFinding(
              'MEDIUM',
              'Potentially unbounded while loop - may cause gas limit issues',
              filePath,
              line,
              column,
              'Ensure while loop has a bounded iteration count or break condition'
            )
          );
        }
      }
    });

    return findings;
  }

  isLoopBounded(condition, source) {
    if (!condition) return false;
    
    // Simplified: always flag loops as potentially unbounded
    // Full implementation would need to analyze the condition structure
    // For MVP, we'll be conservative and flag all loops
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

module.exports = UnboundedLoopRule;
