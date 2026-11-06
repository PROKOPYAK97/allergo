import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
const dir = await mkdtemp(path.join(tmpdir(), 'allergo-test-'));
const child = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, PORT: '3097', DATA_DIR: dir }, stdio: ['ignore', 'pipe', 'inherit'] });
try {
  await new Promise((resolve, reject) => { child.stdout.once('data', resolve); child.once('error', reject); });
  const endpoint='http://127.0.0.1:3097';
  assert.equal((await fetch(endpoint+'/scan')).status,200);
  assert.equal((await fetch(endpoint+'/api/db')).status,404);
  const fixture={ companies:[], products:[], batches:[], scans:[], complaints:[] };
  assert.equal((await fetch(endpoint+'/api/db',{method:'PUT',body:JSON.stringify(fixture)})).status,204);
  assert.deepEqual(await (await fetch(endpoint+'/api/db')).json(),fixture);
  assert.equal((await fetch(endpoint+'/api/db',{method:'PUT',body:'{}'})).status,400);
  assert.equal((await fetch(endpoint+'/api/db',{method:'PUT',headers:{Origin:'https://evil.example'},body:JSON.stringify(fixture)})).status,403);
  assert.equal((await fetch(endpoint+'/api/media/btest/photo',{method:'PUT',headers:{'Content-Type':'image/svg+xml'},body:'x'})).status,415);
  assert.equal((await fetch(endpoint+'/api/media/btest/photo',{method:'PUT',headers:{'Content-Type':'image/png'},body:new Uint8Array([1,2,3])})).status,204);
  assert.deepEqual(new Uint8Array(await (await fetch(endpoint+'/api/media/btest/photo')).arrayBuffer()),new Uint8Array([1,2,3]));
  console.log('9 API checks passed');
} finally { child.kill(); await new Promise(r=>child.once('exit',r)); await rm(dir,{recursive:true,force:true}); }
