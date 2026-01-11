const BaseReporter = require('./base-reporter');
const chalk = require('chalk');
const path = require('path');

class TextReporter extends BaseReporter {
  generate(results, options = {}) {
    const minSeverity = options.minSeverity;
    const quiet = options.quiet || false;
    
    // Filter findings by severity if specified
    const filteredResults = results.map(result => {
      if (!result.findings) return result;
      
      const filteredFindings = minSeverity 
        ? this.filterBySeverity(result.findings, minSeverity)
        : result.findings;
      
      return {
        ...result,
        findings: filteredFindings
      };
    });

    const summary = this.getSummary(filteredResults);
    let output = '';

    if (!quiet) {
      output += '\n' + chalk.bold('Aegis Scan Results\n');
      output += '='.repeat(50) + '\n\n';
    }

    // Print findings for each file
    for (const result of filteredResults) {
      if (result.findings && result.findings.length > 0) {
        const relativePath = path.relative(process.cwd(), result.file);
        output += chalk.bold.underline(relativePath);
        if (result.version) {
          output += chalk.gray(` (Solidity ${result.version})`);
        }
        output += '\n';

        // Sort findings by severity
        const sortedFindings = result.findings.sort((a, b) => {
          const aIndex = this.severityOrder.indexOf(a.severity);
          const bIndex = this.severityOrder.indexOf(b.severity);
          return aIndex - bIndex;
        });

        for (const finding of sortedFindings) {
          output += this.formatFinding(finding);
        }
        output += '\n';
      } else if (result.error && !quiet) {
        output += chalk.red(`Error in ${result.file}: ${result.error}\n\n`);
      }
    }

    // Print summary
    if (!quiet) {
      output += '='.repeat(50) + '\n';
      output += this.formatSummary(summary);
    }

    return output;
  }

  formatFinding(finding) {
    const severityColor = {
      CRITICAL: chalk.red.bold,
      HIGH: chalk.red,
      MEDIUM: chalk.yellow,
      LOW: chalk.gray
    };

    const colorFn = severityColor[finding.severity] || chalk.gray;
    const severityLabel = colorFn(`[${finding.severity}]`);
    
    let output = `  ${severityLabel} ${finding.message}\n`;
    output += chalk.gray(`    Rule: ${finding.ruleId}`);
    if (finding.line > 0) {
      output += chalk.gray(` | Line: ${finding.line}:${finding.column}`);
    }
    output += '\n';
    
    if (finding.suggestion) {
      output += chalk.cyan(`    Suggestion: ${finding.suggestion}\n`);
    }
    output += '\n';
    
    return output;
  }

  formatSummary(summary) {
    let output = '\nSummary:\n';
    output += `  Files scanned: ${summary.files}\n`;
    output += `  Files with issues: ${summary.filesWithIssues}\n`;
    output += `  Total findings: ${summary.totalFindings}\n\n`;

    output += 'Findings by severity:\n';
    for (const severity of this.severityOrder) {
      const count = summary.bySeverity[severity];
      if (count > 0) {
        const colorFn = {
          CRITICAL: chalk.red.bold,
          HIGH: chalk.red,
          MEDIUM: chalk.yellow,
          LOW: chalk.gray
        }[severity] || chalk.gray;
        output += `  ${colorFn(`${severity}: ${count}`)}\n`;
      }
    }

    return output;
  }
}

module.exports = TextReporter;
