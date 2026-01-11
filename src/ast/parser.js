const parser = require('@solidity-parser/parser');
const fs = require('fs');
const path = require('path');

class ASTParser {
  /**
   * Parse a Solidity source file and return the AST
   * @param {string} filePath - Path to the Solidity file
   * @returns {Object} Parsed AST
   */
  static parseFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return this.parse(content, filePath);
    } catch (error) {
      if (error.message.includes('SyntaxError')) {
        throw new Error(`Syntax error in ${filePath}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Parse Solidity source code string
   * @param {string} source - Solidity source code
   * @param {string} filePath - Optional file path for error reporting
   * @returns {Object} Parsed AST
   */
  static parse(source, filePath = 'unknown') {
    try {
      const ast = parser.parse(source, { tolerant: false, loc: true });
      return {
        ast,
        source,
        filePath
      };
    } catch (error) {
      if (error.message) {
        throw new Error(`Parse error in ${filePath}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Extract Solidity version from pragma statement
   * @param {string} source - Solidity source code
   * @returns {string|null} Version string or null
   */
  static extractVersion(source) {
    const pragmaMatch = source.match(/pragma\s+solidity\s+([^;]+);/i);
    if (pragmaMatch) {
      return pragmaMatch[1].trim();
    }
    return null;
  }

  /**
   * Check if version is >= 0.8.0
   * @param {string} versionString - Version string from pragma
   * @returns {boolean}
   */
  static isVersion08OrHigher(versionString) {
    if (!versionString) return false;
    
    // Handle caret and version ranges
    const cleanVersion = versionString
      .replace(/[\^>=<~]/g, '')
      .trim()
      .split(' ')[0];
    
    const match = cleanVersion.match(/^(\d+)\.(\d+)/);
    if (match) {
      const major = parseInt(match[1], 10);
      const minor = parseInt(match[2], 10);
      return major > 0 || (major === 0 && minor >= 8);
    }
    
    return false;
  }
}

module.exports = ASTParser;
