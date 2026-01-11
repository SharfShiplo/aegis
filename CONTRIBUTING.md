# Contributing to Aegis

Thank you for your interest in contributing to Aegis! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/aegis.git`
3. Install dependencies: `npm install`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

- `src/cli/` - Command-line interface
- `src/core/` - Core types (Finding, Rule base classes)
- `src/scanner/` - Scanner implementation
- `src/ast/` - AST parsing utilities
- `src/rules/` - Vulnerability detection rules
- `src/reporters/` - Output formatters
- `src/utils/` - Utility functions
- `examples/` - Example Solidity contracts
- `src/__tests__/` - Test files

## Adding New Rules

To add a new vulnerability detection rule:

1. Create a new rule file in `src/rules/` (e.g., `my-rule.js`)
2. Extend the `BaseRule` class
3. Implement the `check(astContext)` method
4. Register the rule in `src/rules/index.js`

### Example Rule

```javascript
const BaseRule = require('./base-rule');

class MyRule extends BaseRule {
  constructor() {
    super(
      'MY_RULE_ID',           // Unique rule ID
      'My Rule Name',         // Human-readable name
      'Rule description',     // Description
      'HIGH'                  // Severity: CRITICAL, HIGH, MEDIUM, or LOW
    );
  }

  check(astContext) {
    const findings = [];
    const { ast, source, filePath } = astContext;

    // Traverse AST and detect issues
    this.traverseAST(ast, (node) => {
      // Your detection logic here
      if (/* condition */) {
        findings.push(
          this.createFinding(
            'HIGH',
            'Issue description',
            filePath,
            this.getLineNumber(source, node.range[0]),
            this.getColumnNumber(source, node.range[0]),
            'Remediation suggestion'
          )
        );
      }
    });

    return findings;
  }

  traverseAST(node, callback) {
    // AST traversal logic
  }

  getLineNumber(source, position) {
    // Helper to get line number from position
  }

  getColumnNumber(source, position) {
    // Helper to get column number from position
  }
}

module.exports = MyRule;
```

## Writing Tests

All new features should include tests. Tests should be placed in `src/__tests__/` following the same directory structure as the source code.

### Test Example

```javascript
const MyRule = require('../../rules/my-rule');
const ASTParser = require('../../ast/parser');

describe('MyRule', () => {
  let rule;

  beforeEach(() => {
    rule = new MyRule();
  });

  test('should detect issue', () => {
    const code = `
      pragma solidity ^0.8.0;
      contract Test {
          // Test code
      }
    `;

    const parsed = ASTParser.parse(code);
    const findings = rule.check(parsed);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].ruleId).toBe('MY_RULE_ID');
  });
});
```

## Code Style

- Use 2 spaces for indentation
- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code patterns
- Keep functions focused and small

## Commit Messages

Use clear, descriptive commit messages:

- `feat: Add new rule for X vulnerability`
- `fix: Correct line number calculation in Y rule`
- `docs: Update README with new examples`
- `test: Add tests for Z rule`
- `refactor: Simplify AST traversal logic`

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Ensure code follows the project's style
3. Update documentation if needed
4. Write a clear PR description
5. Reference any related issues

## Testing Your Changes

Before submitting a PR:

1. Run the full test suite: `npm test`
2. Test your changes manually:
   ```bash
   npm start scan examples/vulnerable-contract.sol
   ```
3. Test with different options:
   ```bash
   npm start scan examples/ --format json
   npm start scan examples/ --severity HIGH
   ```

## Reporting Bugs

When reporting bugs, please include:

- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Solidity version (if relevant)
- Example code (if possible)

## Feature Requests

Feature requests are welcome! Please:

- Describe the feature clearly
- Explain the use case
- Consider backwards compatibility
- Suggest implementation approach (optional)

## Questions?

Feel free to open an issue for questions or discussions about contributions.

Thank you for contributing to Aegis! 🎉
