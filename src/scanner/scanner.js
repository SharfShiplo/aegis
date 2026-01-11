const ASTParser = require('../ast/parser');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

class Scanner {
  constructor(rules = []) {
    this.rules = rules;
  }

  /**
   * Add a rule to the scanner
   */
  addRule(rule) {
    this.rules.push(rule);
  }

  /**
   * Scan a single file
   * @param {string} filePath - Path to Solidity file
   * @returns {Promise<Object>} Scan results
   */
  async scanFile(filePath) {
    const absolutePath = path.resolve(filePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const parsed = ASTParser.parseFile(absolutePath);
    const version = ASTParser.extractVersion(parsed.source);
    const isVersion08Plus = ASTParser.isVersion08OrHigher(version);

    const findings = [];
    
    for (const rule of this.rules) {
      try {
        const ruleFindings = rule.check({
          ...parsed,
          version,
          isVersion08Plus
        });
        
        if (Array.isArray(ruleFindings)) {
          findings.push(...ruleFindings);
        }
      } catch (error) {
        // Log rule errors but continue scanning
        console.error(`Error in rule ${rule.id}: ${error.message}`);
      }
    }

    return {
      file: absolutePath,
      version,
      findings,
      error: null
    };
  }

  /**
   * Scan a directory for Solidity files
   * @param {string} directory - Directory path
   * @returns {Promise<Object[]>} Array of scan results
   */
  async scanDirectory(directory) {
    const absoluteDir = path.resolve(directory);
    const pattern = path.join(absoluteDir, '**', '*.sol').replace(/\\/g, '/');
    
    const files = await glob(pattern, {
      ignore: ['**/node_modules/**', '**/vendor/**']
    });

    if (files.length === 0) {
      return [];
    }

    const results = [];
    for (const file of files) {
      try {
        const result = await this.scanFile(file);
        results.push(result);
      } catch (error) {
        results.push({
          file,
          version: null,
          findings: [],
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Scan a file or directory
   * @param {string} target - File or directory path
   * @returns {Promise<Object[]>} Array of scan results
   */
  async scan(target) {
    const absolutePath = path.resolve(target);
    const stats = fs.statSync(absolutePath);

    if (stats.isFile()) {
      return [await this.scanFile(absolutePath)];
    } else if (stats.isDirectory()) {
      return await this.scanDirectory(absolutePath);
    } else {
      throw new Error(`Invalid target: ${target}`);
    }
  }
}

module.exports = Scanner;
