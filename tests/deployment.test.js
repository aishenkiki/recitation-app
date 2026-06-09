const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

test('deploys every static script referenced by the game page', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const staticBuilds = new Set(
    vercelConfig.builds
      .filter(build => build.use === '@vercel/static')
      .map(build => `/${build.src}`)
  );
  const scriptSources = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map(match => match[1]);

  assert.ok(scriptSources.length > 0, 'the page should reference at least one static script');
  scriptSources.forEach(source => {
    assert.ok(staticBuilds.has(source), `${source} must be included as a Vercel static build`);
    assert.ok(fs.existsSync(path.join(root, source.replace(/^\//, ''))), `${source} must exist on disk`);
  });
});
