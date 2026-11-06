import {parseCode} from './src/lib/codes.ts';
import assert from 'node:assert/strict';
assert.equal(parseCode('3017620422003').gtin,'03017620422003');
assert.equal(parseCode('010460000000001121DEMO1042').identity,'010460000000001121DEMO1042');
assert.equal(parseCode(']d2010460000000001121DEMO1042'+String.fromCharCode(29)+'91ABCD').identity,'010460000000001121DEMO1042');
assert.throws(()=>parseCode('https://evil.example/batch/b1042'));
assert.throws(()=>parseCode('foo'));
console.log('5 parser checks passed');
