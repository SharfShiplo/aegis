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
      
      // Filter results by severity if specified
      const filteredResults = results.map(result => {
        if (!result.findings) return result;
        const filteredFindings = options.severity
          ? reporter.filterBySeverity(result.findings, options.severity)
          : result.findings;
        return { ...result, findings: filteredFindings };
      });

      const report = reporter.generate(filteredResults, {
        minSeverity: options.severity,
        quiet: options.quiet
      });

      // Output report (for JSON, this is pure JSON; for text, formatted output)
      if (options.format === 'json') {
        // For JSON, ensure no console.logs elsewhere - only output JSON
        process.stdout.write(report + '\n');
      } else {
        console.log(report);
      }

      // Get summary for exit code determination
      const summary = reporter.getSummary(filteredResults);

      // Exit code rules:
      // - Exit 1 if ANY CRITICAL finding exists
      // - Exit 0 if no CRITICAL findings (even if other severities exist)
      // - Exit 0 if no findings at all
      if (summary.bySeverity.CRITICAL > 0) {
        process.exit(1);
      }

      // Exit 0 for all other cases (no findings, or only LOW/MEDIUM/HIGH)
      process.exit(0);
    } catch (error) {
      // For errors, output appropriately based on format
      if (options.format === 'json') {
        const errorReport = JSON.stringify({
          error: true,
          message: error.message,
          summary: {
            files: 0,
            totalFindings: 0,
            bySeverity: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
            filesWithIssues: 0
          },
          results: []
        }, null, 2);
        process.stdout.write(errorReport + '\n');
      } else {
        // User-friendly error messages for text mode
        if (error.message.includes('not found')) {
          console.error(`Error: ${error.message}`);
        } else if (error.message.includes('Permission denied')) {
          console.error(`Error: ${error.message}`);
        } else if (error.message.includes('Invalid path')) {
          console.error(`Error: ${error.message}`);
        } else {
          console.error(`Error: ${error.message}`);
        }
      }
      // Always exit 1 for runtime errors (invalid path, parse error, etc.)
      process.exit(1);
    }
  });

program.parse();
