const JSONReporter = require('../../reporters/json-reporter');
const Finding = require('../../core/finding');

describe('JSONReporter', () => {
  let reporter;

  beforeEach(() => {
    reporter = new JSONReporter();
  });

  test('should generate valid JSON output', () => {
    const findings = [
      new Finding('TEST_RULE', 'HIGH', 'Test message', 'test.sol', 10, 5, 'Fix this')
    ];

    const results = [
      {
        file: 'test.sol',
        version: '^0.8.0',
        findings,
        error: null
      }
    ];

    const output = reporter.generate(results);
    const parsed = JSON.parse(output);

    expect(parsed.summary).toBeDefined();
    expect(parsed.results).toBeDefined();
    expect(parsed.results.length).toBe(1);
    expect(parsed.results[0].findings.length).toBe(1);
  });

  test('should filter by severity', () => {
    const findings = [
      new Finding('TEST1', 'CRITICAL', 'Critical issue', 'test.sol', 1, 1),
      new Finding('TEST2', 'LOW', 'Low issue', 'test.sol', 2, 1)
    ];

    const results = [
      {
        file: 'test.sol',
        version: '^0.8.0',
        findings,
        error: null
      }
    ];

    const output = reporter.generate(results, { minSeverity: 'HIGH' });
    const parsed = JSON.parse(output);

    expect(parsed.results[0].findings.length).toBe(1);
    expect(parsed.results[0].findings[0].severity).toBe('CRITICAL');
  });

  test('should include summary statistics', () => {
    const results = [
      {
        file: 'test.sol',
        version: '^0.8.0',
        findings: [
          new Finding('TEST1', 'CRITICAL', 'Critical', 'test.sol', 1, 1),
          new Finding('TEST2', 'HIGH', 'High', 'test.sol', 2, 1)
        ],
        error: null
      }
    ];

    const output = reporter.generate(results);
    const parsed = JSON.parse(output);

    expect(parsed.summary.totalFindings).toBe(2);
    expect(parsed.summary.bySeverity.CRITICAL).toBe(1);
    expect(parsed.summary.bySeverity.HIGH).toBe(1);
  });
});
