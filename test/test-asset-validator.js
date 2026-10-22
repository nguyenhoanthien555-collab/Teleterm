const assert = require('assert');
const validator = require('../src/server/avatar/asset-validator');

console.log('--- RUNNING 3D ASSET VALIDATOR TESTS ---');

// 1. Reject empty buffer
const resEmpty = validator.validateBuffer(null);
assert.strictEqual(resEmpty.valid, false);

// 2. Reject non-glTF bytes
const fakeText = Buffer.from('this is not a 3D model at all');
const resFake = validator.validateBuffer(fakeText);
assert.strictEqual(resFake.valid, false);
assert(resFake.error.includes('.GLB hoặc .VRM'));
console.log('✓ Invalid magic bytes correctly rejected');

// 3. Reject oversized buffer (> 12MB)
const oversized = Buffer.alloc(13 * 1024 * 1024);
const resOver = validator.validateBuffer(oversized);
assert.strictEqual(resOver.valid, false);
assert(resOver.error.includes('12MB'));
console.log('✓ Oversized asset (> 12MB) strictly rejected');

// 4. Accept valid glTF 2.0 binary header
const validHeader = Buffer.alloc(12);
validHeader.writeUInt32LE(0x46546C67, 0); // magic: glTF
validHeader.writeUInt32LE(2, 4);          // version: 2
validHeader.writeUInt32LE(12, 8);         // total length: 12
const resValid = validator.validateBuffer(validHeader, 'custom_avatar.glb');
assert.strictEqual(resValid.valid, true);
assert.strictEqual(resValid.format, 'glb');
console.log('✓ Valid glTF binary accepted');

console.log('--- ALL ASSET VALIDATOR TESTS PASSED! ---');
