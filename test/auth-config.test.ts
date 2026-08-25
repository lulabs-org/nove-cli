import { expect } from 'chai';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { getApiKey, getAuthStatus, removeApiKey, saveApiKey } from '../dist/utils/auth.js';
import { getConfig, setConfig } from '../dist/utils/config.js';

describe('credential and configuration storage', () => {
  let configDir: string;

  beforeEach(() => {
    configDir = mkdtempSync(path.join(tmpdir(), 'nove-cli-config-'));
  });

  afterEach(() => {
    rmSync(configDir, { force: true, recursive: true });
  });

  it('stores credentials with restrictive permissions and never returns the key in status', () => {
    const status = saveApiKey(configDir, 'test-key');
    const authPath = path.join(configDir, 'auth.json');

    expect(status).to.include({ authenticated: true });
    expect(status).not.to.have.property('apiKey');
    expect(getApiKey(configDir)).to.equal('test-key');
    expect(getAuthStatus(configDir)).not.to.have.property('apiKey');
    if (process.platform !== 'win32') expect(statSync(authPath).mode.toString(8).slice(-3)).to.equal('600');
    expect(JSON.parse(readFileSync(authPath, 'utf8'))).to.include({ apiKey: 'test-key' });
  });

  it('removes stored credentials idempotently', () => {
    saveApiKey(configDir, 'test-key');
    expect(removeApiKey(configDir)).to.equal(true);
    expect(removeApiKey(configDir)).to.equal(false);
    expect(getAuthStatus(configDir)).to.deep.equal({ authenticated: false });
  });

  it('reports malformed authentication files explicitly', () => {
    writeFileSync(path.join(configDir, 'auth.json'), '{broken');
    expect(() => getApiKey(configDir)).to.throw('Authentication file is invalid JSON');

    writeFileSync(path.join(configDir, 'auth.json'), JSON.stringify({ apiKey: 123 }));
    expect(() => getApiKey(configDir)).to.throw('Authentication file has an invalid structure');
  });

  it('validates persistent configuration instead of silently discarding corruption', () => {
    writeFileSync(path.join(configDir, 'config.json'), '{broken');
    expect(() => getConfig(configDir)).to.throw('Configuration file is invalid JSON');

    writeFileSync(path.join(configDir, 'config.json'), JSON.stringify({ baseUrl: 'file:///tmp/api' }));
    expect(() => getConfig(configDir)).to.throw('must use http or https');

    writeFileSync(path.join(configDir, 'config.json'), JSON.stringify({ legacyKey: true }));
    expect(getConfig(configDir)).to.deep.equal({});

    rmSync(path.join(configDir, 'config.json'));
    setConfig(configDir, { baseUrl: 'https://api.example.test/base' });
    expect(getConfig(configDir)).to.deep.equal({ baseUrl: 'https://api.example.test/base' });
  });
});
