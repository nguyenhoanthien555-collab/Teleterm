/**
 * TeleTerm AnsiRingBuffer
 * High-performance, ANSI-safe circular line buffer with Carriage Return (\r) folding.
 * 
 * Mandated by Master Architecture & Argon Refactoring Spec (P0.1):
 * - Replaces unbounded string concatenation (+=) and blind .slice(-200000).
 * - Folds in-place updates (progress bars, spinners) that use standalone \r.
 * - Preserves ANSI escape sequence integrity during eviction.
 * - Handles cross-chunk split \r\n seamlessly.
 */

class AnsiRingBuffer {
    /**
     * @param {Object} options
     * @param {number} [options.maxChars=200000] Maximum buffer size in characters (~200KB)
     * @param {number} [options.maxLines=5000] Maximum scrollback line count
     */
    constructor({ maxChars = 200000, maxLines = 5000 } = {}) {
        this.maxChars = maxChars;
        this.maxLines = maxLines;
        this.lines = []; // Array of completed lines (each line does NOT include trailing \r\n)
        this.currentLine = ''; // Active line buffer currently being constructed
        this.totalChars = 0;
        this.pendingCarriageReturn = false; // Flag for \r arriving at the end of a chunk
    }

    /**
     * Append incoming terminal data chunk
     * @param {string} data
     */
    append(data) {
        if (!data || typeof data !== 'string') return;

        let i = 0;
        const len = data.length;

        // Check if previous chunk ended with an unresolved \r
        if (this.pendingCarriageReturn) {
            this.pendingCarriageReturn = false;
            if (data[0] === '\n') {
                // Split \r\n across chunks -> commit line
                this._commitCurrentLine();
                i = 1;
            } else {
                // It was a standalone \r
                this._handleCarriageReturn();
            }
        }

        while (i < len) {
            const ch = data[i];

            if (ch === '\r') {
                if (i + 1 < len) {
                    if (data[i + 1] === '\n') {
                        // Standard \r\n CRLF newline
                        this._commitCurrentLine();
                        i += 2;
                        continue;
                    } else {
                        // Standalone \r within chunk (e.g. progress bar overwrite)
                        this._handleCarriageReturn();
                        i++;
                        continue;
                    }
                } else {
                    // \r is the very last character of this chunk
                    // Defer decision to the next chunk
                    this.pendingCarriageReturn = true;
                    i++;
                    break;
                }
            } else if (ch === '\n') {
                // Standalone \n LF newline
                this._commitCurrentLine();
                i++;
                continue;
            }

            // Slice contiguous non-newline segment for high throughput
            let nextCr = data.indexOf('\r', i);
            let nextLf = data.indexOf('\n', i);

            let endIdx;
            if (nextCr === -1 && nextLf === -1) {
                endIdx = len;
            } else if (nextCr === -1) {
                endIdx = nextLf;
            } else if (nextLf === -1) {
                endIdx = nextCr;
            } else {
                endIdx = Math.min(nextCr, nextLf);
            }

            const segment = data.slice(i, endIdx);
            this.currentLine += segment;
            this.totalChars += segment.length;
            i = endIdx;
        }

        this._evictIfNeeded();
    }

    /**
     * Commit currentLine to completed lines array
     * @private
     */
    _commitCurrentLine() {
        this.lines.push(this.currentLine);
        // +2 to account for virtual \r\n separator in total budget
        this.totalChars += 2;
        this.currentLine = '';
    }

    /**
     * Handle standalone carriage return (\r)
     * Resets active line without accumulating unbounded history
     * @private
     */
    _handleCarriageReturn() {
        this.totalChars -= this.currentLine.length;
        this.currentLine = '';
    }

    /**
     * Explicit Erase in Line support (\x1b[2K or \x1b[K)
     */
    eraseCurrentLine() {
        this._handleCarriageReturn();
    }

    /**
     * Evict oldest lines when exceeding maxChars or maxLines
     * @private
     */
    _evictIfNeeded() {
        while (this.lines.length > 0 && (this.totalChars > this.maxChars || this.lines.length > this.maxLines)) {
            const evicted = this.lines.shift();
            this.totalChars -= (evicted.length + 2);
        }

        // Edge case: single active line exceeds maxChars (e.g. huge minified one-liner)
        if (this.currentLine.length > this.maxChars) {
            const safeIdx = this._findSafeAnsiCutIndex(this.currentLine, this.maxChars);
            const dropCount = this.currentLine.length - safeIdx;
            this.currentLine = this.currentLine.slice(this.currentLine.length - safeIdx);
            this.totalChars -= dropCount;
        }
    }

    /**
     * Prevent mid-sequence truncation for huge single lines
     * @private
     */
    _findSafeAnsiCutIndex(str, targetLen) {
        let start = Math.max(0, str.length - targetLen);
        const lastEsc = str.lastIndexOf('\x1b', start + 30);
        if (lastEsc !== -1 && lastEsc <= start) {
            const slice = str.slice(lastEsc, lastEsc + 32);
            // Match standard ANSI escape sequences: CSI, OSC, or 2-char modes
            const match = slice.match(/^\x1b(\[[0-9;]*[a-zA-Z]|\][^\x07\x1b]*(\x07|\x1b\\)|[()#][0-9A-Za-z]|[>=<NOm])/);
            if (match) {
                const seqEnd = lastEsc + match[0].length;
                if (start < seqEnd) {
                    start = seqEnd;
                }
            } else {
                start = Math.max(0, lastEsc);
            }
        }
        return str.length - start;
    }

    /**
     * Get clean, consolidated history string to send to newly connected clients
     * @returns {string}
     */
    getContents() {
        if (this.pendingCarriageReturn) {
            this._handleCarriageReturn();
            this.pendingCarriageReturn = false;
        }

        if (this.lines.length === 0) {
            return this.currentLine;
        }

        if (this.currentLine.length === 0) {
            return this.lines.join('\r\n') + '\r\n';
        }

        return this.lines.join('\r\n') + '\r\n' + this.currentLine;
    }

    /**
     * Coerce to string seamlessly
     * @returns {string}
     */
    toString() {
        return this.getContents();
    }

    /**
     * Current approximate character length of the buffer
     * @returns {number}
     */
    get length() {
        return Math.max(0, this.totalChars);
    }

    /**
     * Number of completed lines stored
     * @returns {number}
     */
    get lineCount() {
        return this.lines.length + (this.currentLine.length > 0 ? 1 : 0);
    }

    /**
     * Clear buffer completely
     */
    clear() {
        this.lines = [];
        this.currentLine = '';
        this.totalChars = 0;
        this.pendingCarriageReturn = false;
    }
}

module.exports = AnsiRingBuffer;
