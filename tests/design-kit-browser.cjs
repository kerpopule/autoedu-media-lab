/* Real shipped frontend, isolated browser, synthetic APIs. No listening socket. */
const fs = require('fs'), path = require('path'), assert = require('node:assert/strict');
const modulePath = process.env.PLAYWRIGHT_MODULE || process.env.HOME+'/.hermes/hermes-agent/node_modules/playwright';
const {chromium} = require(modulePath);
const root = path.resolve(__dirname,'..'), results=[], writes=[], errors=[];
const out = path.join(root,'docs/evidence/design-kit-20261010');
fs.mkdirSync(out,{recursive:true});
let browser;
function check(name, value) { results.push({name,pass:!!value}); assert.ok(value,name); console.log('PASS',name); }
(async()=>{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({acceptDownloads:true,serviceWorkers:'block'});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.stack));
  page.on('dialog',d=>d.accept());
  await page.route('**/*', async route=>{
    const req=route.request(),u=new URL(req.url());
    if(req.method()!=='GET') { writes.push({path:u.pathname,body:req.postData()}); return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Fixture engine offline — no render attempted.'})}); }
    if(u.hostname!=='media-lab.test') return route.abort();
    if(u.pathname.startsWith('/api/')) {
      let data={};
      if(['/api/gallery','/api/characters','/api/storyboards','/api/voices','/api/jobs'].includes(u.pathname)) data=[];
      if(u.pathname==='/api/styles') data={video:[{group:'Fixture styles',styles:[{id:'none',emoji:'',label:'No extra style'}]}],character:[{group:'Fixture styles',styles:[{id:'photoreal',emoji:'',label:'Photoreal'}]}],templates:[{group:'Fixture templates',templates:[]}],char_engines:[{id:'qwen',label:'Fixture local painter'}]};
      if(u.pathname==='/api/image/models') data={ok:false,models:[]};
      if(u.pathname==='/api/maestro/models') data={models:[]};
      if(u.pathname==='/api/me') data={role:'user',owner:false};
      if(u.pathname==='/api/known-characters') data={characters:[]};
      if(u.pathname==='/api/queue') data={active:[],history:[],active_counts:{local:0,online:0},active_total:0};
      return route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
    }
    const file=path.resolve(root,'.'+(u.pathname==='/'?'/static/index.html':decodeURIComponent(u.pathname)));
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)) return route.fulfill({status:404,body:''});
    const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'}[path.extname(file)]||'application/octet-stream';
    return route.fulfill({contentType:type,body:fs.readFileSync(file)});
  });
  await page.goto('http://media-lab.test/',{waitUntil:'networkidle'});
  await page.locator('.nv[data-tab="tab-images"]').click();
  await page.locator('#designKit summary').click();
  await page.locator('#dkBuild').click();
  check('empty brief shows useful error',(await page.locator('#dkStatus').textContent()).includes('brief'));
  await page.locator('#dkBrief').fill('Promote a neighbourhood garden workshop.');
  await page.locator('#dkBrand').fill('Example Garden');
  await page.locator('#dkLook').fill('Forest green, warm paper, soft morning light');
  await page.locator('#dkCopy').fill('Grow together');
  await page.locator('#dkBuild').click();
  check('four editable output cards',await page.locator('.dk-output').count()===4);
  check('planning starts no jobs',writes.length===0);
  for(const width of [320,375,768,1440]) {
    await page.setViewportSize({width,height:900});
    check('no horizontal overflow '+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    check('all draft controls labeled '+width,await page.locator('#designKit input:not([type=file]),#designKit textarea').evaluateAll(els=>els.every(el=>document.querySelector('label[for="'+el.id+'"]'))));
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('#designKit').scrollIntoViewIfNeeded();
  await page.screenshot({path:out+'/desktop.png',fullPage:true});
  await page.setViewportSize({width:375,height:900});
  await page.screenshot({path:out+'/mobile.png',fullPage:true});
  await page.locator('#dkPrompt0').fill('Edited <script>window.__injected=1</script> poster concept.');
  const downloadWait=page.waitForEvent('download');
  await page.locator('#dkExport').click();
  const download=await downloadWait; const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  check('export preserves edits',exported.outputs[0].prompt.includes('Edited <script>'));
  check('no script injection',await page.evaluate(()=>window.__injected===undefined));
  await page.locator('#dkImport').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad')});
  await page.waitForFunction(()=>document.querySelector('#dkStatus').classList.contains('dk-error'));
  check('malformed import retains drafts',await page.locator('.dk-output').count()===4);
  await page.locator('#dkImport').setInputFiles({name:'kit.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
  await page.waitForFunction(()=>document.querySelector('#dkStatus').textContent.includes('restored'));
  check('import restores edits',(await page.locator('#dkPrompt0').inputValue())===exported.outputs[0].prompt);
  const beforeEngine=await page.locator('#i_engine .chip.sel').getAttribute('data-v');
  await page.locator('#dkBrand').fill('Changed brand');
  await page.locator('.dk-output button').nth(0).click();
  check('changed brief requires explicit rebuild',(await page.locator('#dkStatus').textContent()).includes('changed'));
  check('stale brief did not overwrite image maker',(await page.locator('#i_prompt').inputValue())==='');
  await page.locator('#dkBrand').fill(exported.brand);
  await page.locator('.dk-output button').nth(0).click();
  check('image handoff preserves edited prompt',(await page.locator('#i_prompt').inputValue())===exported.outputs[0].prompt);
  check('image handoff sets portrait',await page.locator('#i_ors .chip.sel').getAttribute('data-v')==='portrait');
  check('handoff keeps engine',await page.locator('#i_engine .chip.sel').getAttribute('data-v')===beforeEngine);
  check('handoff starts no jobs',writes.length===0);
  await page.locator('.dk-output button').nth(3).click();
  check('video handoff switches actual tab',await page.locator('#tab-video').evaluate(el=>el.classList.contains('on')));
  check('video handoff uses portrait',await page.locator('#ors .chip.sel').getAttribute('data-v')==='portrait');
  check('video handoff uses motion draft',(await page.locator('#prompt').inputValue())===exported.outputs[3].prompt);
  await page.locator('.nv[data-tab="tab-images"]').click();
  await page.locator('#dkPrompt3').fill('x'.repeat(2001));
  await page.locator('.dk-output button').nth(3).click();
  check('long video prompt blocked without truncation',(await page.locator('#dkStatus').textContent()).includes('2000'));
  check('video draft did not overwrite maker',(await page.locator('#prompt').inputValue())===exported.outputs[3].prompt);
  check('export import and handoffs did not send requests',writes.length===0);
  await page.locator('#i_go').click();
  await page.waitForFunction(()=>document.querySelector('#i_err').textContent.includes('Fixture engine offline'));
  check('existing Make button uses canonical image queue',writes.length===1&&writes[0].path==='/api/image');
  const request=JSON.parse(writes[0].body);
  check('maker submits chosen prompt and shape',request.prompt===exported.outputs[0].prompt&&request.orientation==='portrait');
  check('existing maker recovers from engine error',await page.locator('#i_go').isEnabled());
  check('no JavaScript errors in real frontend fixture',errors.length===0);
  await context.close();
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{
  if(browser)await browser.close();
  fs.writeFileSync(out+'/browser.json',JSON.stringify({pass:!process.exitCode,results,errors,writes,fixture:true,cleanup:'Owned context and browser closed; no server or live API used.'},null,2));
});
