# Aegis

A static analysis tool for Solidity smart contracts focused on security, correctness, and productivity. Aegis helps developers, auditors, and researchers identify common vulnerabilities and code smells in Solidity code.

## Features

- 🔍 **Static Analysis**: Analyzes Solidity source code without execution
- 🚨 **Vulnerability Detection**: Identifies common security issues and code smells
- 🎯 **Actionable Suggestions**: Provides remediation guidance for each finding
- 📊 **Multiple Output Formats**: Supports JSON and human-readable text output
- ⚡ **Fast & Reliable**: Built for speed and CI/CD integration
- 🔧 **Extensible**: Modular rule system for easy customization

## Installation

The npm package is published under the scoped name `@aegis-security/aegis`. Although the package is published under a scoped name, the CLI command is simply `aegis`.

For local development:
```bash
npm install
```

For global installation:
```bash
npm install -g @aegis-security/aegis
```

Or use via npx:
```bash
npx @aegis-security/aegis scan .
```

## Quick Start

### Scan a single file

```bash
aegis scan contracts/Token.sol
```

### Scan a directory

```bash
aegis scan contracts/
```

### Get JSON output

```bash
aegis scan . --format json
```

### Filter by severity

```bash
aegis scan . --severity HIGH
```

### Ignore specific rules

```bash
aegis scan . --ignore-rules UNBOUNDED_LOOP,DEPRECATED
```

### Quiet mode

```bash
aegis scan . --quiet
```

## Command Line Options

```
Usage: aegis scan <target> [options]

Arguments:
  target                  File or directory to scan

Options:
  -f, --format <format>   Output format (json|text) (default: "text")
  -s, --severity <level>  Minimum severity level (CRITICAL|HIGH|MEDIUM|LOW)
  -i, --ignore-rules      Comma-separated list of rule IDs to ignore
  --quiet                 Suppress summary output
  -h, --help              Display help for command
  -V, --version           Display version
```

## Detected Issues

Aegis currently detects the following issues:

### CRITICAL

- **REENTRANCY**: Potential reentrancy vulnerabilities in external calls

### HIGH

- **TX_ORIGIN**: Use of `tx.origin` for authorization
- **UNCHECKED_CALL**: Unchecked low-level calls (`call()`, `delegatecall()`, etc.)
- **INTEGER_OVERFLOW**: Integer overflow/underflow (Solidity < 0.8)

### MEDIUM

- **UNBOUNDED_LOOP**: Potentially unbounded loops
- **DEPRECATED**: Usage of deprecated functions/opcodes

## Output Formats

### Text Output (Default)

```
Aegis Scan Results
==================================================

contracts/VulnerableContract.sol (Solidity ^0.7.0)
  [HIGH] Use of tx.origin for authorization - prefer msg.sender
    Rule: TX_ORIGIN | Line: 10:15
    Suggestion: Use msg.sender instead of tx.origin. tx.origin can be manipulated by intermediate contracts in a call chain.

==================================================
Summary:
  Files scanned: 1
  Files with issues: 1
  Total findings: 1

Findings by severity:
  HIGH: 1
```

### JSON Output

```json
{
  "summary": {
    "files": 1,
    "totalFindings": 1,
    "bySeverity": {
      "CRITICAL": 0,
      "HIGH": 1,
      "MEDIUM": 0,
      "LOW": 0
    },
    "filesWithIssues": 1
  },
  "results": [
    {
      "file": "/path/to/contracts/VulnerableContract.sol",
      "version": "^0.7.0",
      "findings": [
        {
          "ruleId": "TX_ORIGIN",
          "severity": "HIGH",
          "message": "Use of tx.origin for authorization - prefer msg.sender",
          "file": "/path/to/contracts/VulnerableContract.sol",
          "line": 10,
          "column": 15,
          "suggestion": "Use msg.sender instead of tx.origin..."
        }
      ]
    }
  ]
}
```

## Exit Codes

- `0`: Scan completed successfully, no CRITICAL issues found
- `1`: Scan completed but CRITICAL issues were detected, or an error occurred

This makes Aegis suitable for CI/CD pipelines where non-zero exit codes can trigger build failures.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Security Scan

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm install -g .
      - run: aegis scan contracts/ --format json > scan-results.json
      - uses: actions/upload-artifact@v3
        with:
          name: scan-results
          path: scan-results.json
```

## Examples
Some examples intentionally trigger MEDIUM findings to demonstrate how Aegis reports non-critical issues.

See the `examples/` directory for sample Solidity contracts:

- `vulnerable-contract.sol`: Contains various vulnerabilities for testing
- `safe-contract.sol`: Demonstrates mostly safe patterns but may still trigger non-critical findings (e.g. gas-related warnings)
- `clean-example.sol`: Demonstrates a contract with zero findings

Run Aegis on these examples:

```bash
aegis scan examples/vulnerable-contract.sol
```

## Development

### Running Tests

```bash
npm test
```

### Running Tests with Coverage

```bash
npm run test:coverage
```

### Project Structure

```
aegis/
├── src/
│   ├── cli/           # CLI interface
│   ├── core/          # Core types (Finding, Rule)
│   ├── scanner/       # Scanner implementation
│   ├── ast/           # AST parsing utilities
│   ├── rules/         # Vulnerability detection rules
│   ├── reporters/     # Output formatters (JSON, Text)
│   └── utils/         # Utility functions
├── examples/          # Example Solidity contracts
├── src/__tests__/     # Test files
└── README.md
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to Aegis.

## License

MIT

## Disclaimer

Aegis is an automated static analysis tool and does not guarantee the detection of all security vulnerabilities. It should not be considered a substitute for a comprehensive security audit or professional review. Always perform thorough testing and independent audits before deploying smart contracts to mainnet. This software is provided “as is” without warranties of any kind.

