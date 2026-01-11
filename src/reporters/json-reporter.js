const BaseReporter = require('./base-reporter');

class JSONReporter extends BaseReporter {
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
        file: result.file,
        version: result.version,
        error: result.error,
        findings: result.findings ? result.findings.map(f => f.toJSON()) : []
      }))
    }, null, 2);
  }
}

module.exports = JSONReporter;
