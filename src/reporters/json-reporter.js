const BaseReporter = require('./base-reporter');
const path = require('path');

class JSONReporter extends BaseReporter {
  normalizePath(filePath) {
    // Normalize path to use forward slashes for cross-platform consistency
    // Convert to relative path from cwd for better CI/CD compatibility
    if (!filePath) return filePath;
    const relativePath = path.relative(process.cwd(), filePath);
    return relativePath.replace(/\\/g, '/');
  }

  generate(results, options = {}) {
    const minSeverity = options.minSeverity;
    
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

    return JSON.stringify({
      summary,
      results: filteredResults.map(result => ({
        file: this.normalizePath(result.file),
        version: result.version,
        error: result.error,
        findings: result.findings ? result.findings.map(f => {
          const json = f.toJSON();
          return { ...json, file: this.normalizePath(json.file) };
        }) : []
      }))
    }, null, 2);
  }
}

module.exports = JSONReporter;
