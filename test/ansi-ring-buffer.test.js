const assert = require('assert');
const AnsiRingBuffer = require('../src/server/ansi-ring-buffer');

console.log('=== Running AnsiRingBuffer Unit Tests ===\n');

// Test 1: Basic append and contents
{
    const buf = new AnsiRingBuffer({ maxChars: 1000 });
    buf.append('Hello world\r\n');
    assert.strictEqual(buf.getContents(), 'Hello world\r\n');
    console.log('✅ Test 1 Passed: Basic append & getContents');
}

// Test 2: Standard CRLF and LF newline handling
{
    const buf = new AnsiRingBuffer({ maxChars: 1000 });
    buf.append('Line 1\r\nLine 2\nLine 3');
    assert.strictEqual(buf.getContents(), 'Line 1\r\nLine 2\r\nLine 3');
    console.log('✅ Test 2 Passed: Mixed CRLF / LF line normalization');
}

// Test 3: Carriage Return (\r) in-place overwrite (Progress bar)
{
    const buf = new AnsiRingBuffer({ maxChars: 1000 });
    buf.append('Downloading: 10%\r');
    buf.append('Downloading: 50%\r');
    buf.append('Downloading: 100%\r\n');
    buf.append('Done!\r\n');

    const output = buf.getContents();
    assert.strictEqual(output, 'Downloading: 100%\r\nDone!\r\n');
    // Buffer should NOT contain the 10% or 50% lines!
    assert.ok(!output.includes('10%'));
    assert.ok(!output.includes('50%'));
    console.log('✅ Test 3 Passed: In-place Carriage Return overwrite folds cleanly');
}

// Test 4: Cross-chunk split \r\n
{
    const buf = new AnsiRingBuffer({ maxChars: 1000 });
    // Chunk 1 ends with \r
    buf.append('Line A\r');
    // Chunk 2 starts with \n
    buf.append('\nLine B\r\n');
    
    assert.strictEqual(buf.getContents(), 'Line A\r\nLine B\r\n');
    console.log('✅ Test 4 Passed: Split \\r and \\n across chunks correctly committed');
}

// Test 5: Eviction by maxLines
{
    const buf = new AnsiRingBuffer({ maxLines: 3, maxChars: 10000 });
    buf.append('Line 1\r\nLine 2\r\nLine 3\r\nLine 4\r\n');
    const content = buf.getContents();
    assert.ok(!content.includes('Line 1'));
    assert.ok(content.includes('Line 2'));
    assert.ok(content.includes('Line 3'));
    assert.ok(content.includes('Line 4'));
    assert.strictEqual(buf.lineCount, 3);
    console.log('✅ Test 5 Passed: Oldest lines evicted when exceeding maxLines');
}

// Test 6: Eviction by maxChars budget
{
    const buf = new AnsiRingBuffer({ maxChars: 40 });
    buf.append('1234567890\r\n'); // ~12 chars
    buf.append('ABCDEFGHIJ\r\n'); // ~12 chars
    buf.append('KLMNOPQRST\r\n'); // ~12 chars
    buf.append('UVWXYZ1234\r\n'); // ~12 chars
    buf.append('FINAL_LINE\r\n'); // ~12 chars

    assert.ok(buf.length <= 40, `Buffer length ${buf.length} should be <= 40`);
    assert.ok(buf.getContents().includes('FINAL_LINE'));
    console.log('✅ Test 6 Passed: Eviction maintains strict maxChars budget');
}

// Test 7: ANSI escape sequence preservation
{
    const buf = new AnsiRingBuffer({ maxChars: 200 });
    const coloredLine = '\x1b[32m[SUCCESS]\x1b[0m All tests passed\r\n';
    buf.append(coloredLine);
    assert.strictEqual(buf.getContents(), coloredLine);
    console.log('✅ Test 7 Passed: ANSI escape sequences preserved verbatim');
}

// Test 8: High throughput stress test (10,000 progress updates)
{
    const buf = new AnsiRingBuffer({ maxChars: 200000 });
    const start = Date.now();
    for (let p = 0; p <= 10000; p++) {
        buf.append(`[Progress] Task index ${p}/10000\r`);
    }
    buf.append('\nComplete!\r\n');
    const elapsed = Date.now() - start;

    const content = buf.getContents();
    assert.ok(content.includes('10000/10000'));
    assert.ok(content.includes('Complete!'));
    assert.ok(buf.length < 500, `Buffer length should be tiny (${buf.length} chars) after 10k overwrites`);
    console.log(`✅ Test 8 Passed: 10,000 progress updates processed in ${elapsed}ms without memory bloat`);
}

console.log('\n🎉 ALL 8 UNIT TESTS PASSED PERFECTLY!\n');
