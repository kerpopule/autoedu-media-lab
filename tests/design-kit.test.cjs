const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = path.join(__dirname, '../static/design-kit.js');

test('one brief produces a coordinated editable four-format kit without execution', () => {
  assert.ok(fs.existsSync(source), 'design kit feature is missing');
  const {buildPlan} = require(source);
  const plan = buildPlan({brief:'Launch a neighbourhood garden workshop', brand:'Example Garden', look:'Warm paper, forest green', copy:'Grow together'});
  assert.equal(plan.version, 1);
  assert.equal(plan.outputs.length, 4);
  assert.deepEqual(plan.outputs.map(o => o.orientation), ['portrait','square','landscape','portrait']);
  assert.deepEqual(plan.outputs.map(o => o.kind), ['image','image','image','video']);
  for (const output of plan.outputs) {
    assert.ok(output.prompt.includes('Example Garden'));
    assert.ok(output.prompt.includes('Warm paper, forest green'));
    assert.ok(output.prompt.includes('Grow together'));
    assert.ok(output.prompt.length <= 8192);
  }
  assert.equal(plan.status, 'draft');
});

test('frontend and offline shell wire the new workspace without a new execution channel', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'static/index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'static/sw.js'), 'utf8');
  for (const file of ['design-kit.js', 'design-kit-ui.js', 'design-kit.css']) {
    assert.ok(html.includes('/static/'+file));
    assert.ok(sw.includes('/static/'+file));
  }
  assert.ok(html.includes('id="designKit"'));
  const ui = fs.readFileSync(path.join(root, 'static/design-kit-ui.js'), 'utf8');
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/.test(ui), false);
  assert.equal(/muapi|fal-image|fal-video/.test(ui), false);
});

test('invalid and oversized briefs fail instead of losing information', () => {
  const {buildPlan} = require(source);
  assert.throws(() => buildPlan({brief:'   '}), /brief/i);
  assert.throws(() => buildPlan({brief:'x'.repeat(4001)}), /4000/);
  assert.throws(() => buildPlan({brief:'ok', brand:'x'.repeat(121)}), /120/);
  assert.throws(() => buildPlan(null), /brief/i);
});

test('import preserves edits but rejects execution fields and invalid output contracts', () => {
  const {buildPlan, parsePlan} = require(source);
  const plan = buildPlan({brief:'Example workshop'});
  plan.outputs[0].prompt = '<script>alert(1)</script> is literal user copy';
  assert.equal(parsePlan(JSON.stringify(plan)).outputs[0].prompt, plan.outputs[0].prompt);
  assert.throws(() => parsePlan('{bad'), /JSON/);
  assert.throws(() => parsePlan(JSON.stringify({...plan, version:2})), /version/i);
  assert.throws(() => parsePlan(JSON.stringify({...plan, outputs:[]})), /outputs/i);
  assert.throws(() => parsePlan(JSON.stringify({...plan, engine:'fal-image'})), /fields/i);
  plan.outputs[0].orientation = 'landscape';
  assert.throws(() => parsePlan(JSON.stringify(plan)), /format/i);
});
