#!/usr/bin/env node

const { Command } = require('commander');
const Scanner = require('../scanner/scanner');
const { getDefaultRules, getRulesExcluding } = require('../rules');
const { getReporter } = require('../reporters');
const version = require('../utils/version');
const path = require('path');

const program = new Command();

program
  .name('aegis')
  .description('A static analysis tool for Solidity smart contracts')
  .version(version);

program
  .command('scan')
  .description('Scan Solidity files or directories')
  .argument('<target>', 'File or directory to scan')
  .option('-f, --format <format>', 'Output format (json|text)', 'text')
  .option('-s, --severity <level>', 'Minimum severity level (CRITICAL|HIGH|MEDIUM|LOW)')
  .option('-i, --ignore-rules <ruleIds>', 'Comma-separated list of rule IDs to ignore')
  .option('--quiet', 'Suppress summary output', false)
  .action(async (target, options) => {
    try {
      // Parse ignore rules
      const ignoreRules = options.ignoreRules
        ? options.ignoreRules.split(',').map(id => id.trim())
        : [];

      // Get rules
      const rules = ignoreRules.length > 0
        ? getRulesExcluding(ignoreRules)
        : getDefaultRules();

      // Initialize scanner
      const scanner = new Scanner(rules);

      // Scan target
      const results = await scanner.scan(target);

      // Generate report
      const reporter = getReporter(options.format);
      const report = reporter.generate(results, {
        minSeverity: options.severity,
        quiet: options.quiet
      });

      // Output report
      console.log(report);

      // Get summary for exit code
      const summary = reporter.getSummary(
        results.map(result => {
          if (!result.findings) return result;
          const filteredFindings = options.severity
            ? reporter.filterBySeverity(result.findings, options.severity)
            : result.findings;
          return { ...result, findings: filteredFindings };
        })
      );

      // Exit with non-zero code if CRITICAL issues found
      if (summary.bySeverity.CRITICAL > 0) {
        process.exit(1);
      }

      // Exit with non-zero code if HIGH issues found (optional - you might want to make this configurable)
      // For now, only exit on CRITICAL
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
