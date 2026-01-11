const Scanner = require('../../scanner/scanner');
const TxOriginRule = require('../../rules/tx-origin-rule');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Scanner', () => {
  let scanner;
  let tempDir;
  let testFile;

  beforeEach(() => {
    scanner = new Scanner([new TxOriginRule()]);
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aegis-test-'));
    testFile = path.join(tempDir, 'test.sol');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.readdirSync(tempDir).forEach(file => {
        fs.unlinkSync(path.join(tempDir, file));
      });
      fs.rmdirSync(tempDir);
    }
  });

  test('should scan a file with findings', async () => {
    const code = `
      pragma solidity ^0.8.0;
      
      contract Test {
          modifier onlyOwner() {
              require(tx.origin == msg.sender);
              _;
          }
      }
    `;

    fs.writeFileSync(testFile, code);
    const results = await scanner.scanFile(testFile);

    expect(results.file).toBeDefined();
    expect(results.findings.length).toBeGreaterThan(0);
  });

  test('should handle file not found', async () => {
    const nonExistentFile = path.join(tempDir, 'nonexistent.sol');

    await expect(scanner.scanFile(nonExistentFile)).rejects.toThrow();
  });

  test('should scan a directory', async () => {
    const code = `
      pragma solidity ^0.8.0;
      contract Test {}
    `;

    fs.writeFileSync(testFile, code);
    const results = await scanner.scanDirectory(tempDir);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
  });
});
