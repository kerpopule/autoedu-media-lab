/* Draft workspace only: no network, storage or generation side effects. */
(function () {
  'use strict';
  const box = document.getElementById('designKit');
  if (!box || !window.MediaLabDesignKit) return;
  const $ = id => document.getElementById(id);
  let plan = null;
  function status(message, error) {
    $('dkStatus').textContent = message;
    $('dkStatus').classList.toggle('dk-error', !!error);
  }
  function readEdits() {
    if (!plan) throw new Error('Build a kit first.');
    if (['brief','brand','look','copy'].some(k => $('dk'+k[0].toUpperCase()+k.slice(1)).value.trim() !== plan[k])) throw new Error('The brief or brand settings changed. Build the kit again before exporting or using it; rebuilding replaces the edited drafts.');
    plan.outputs.forEach((o,i) => { o.prompt = $('dkPrompt'+i).value; });
    return window.MediaLabDesignKit.parsePlan(JSON.stringify(plan));
  }
  function render(next) {
    plan = next;
    ['brief','brand','look','copy'].forEach(k => { $('dk'+k[0].toUpperCase()+k.slice(1)).value = plan[k]; });
    const list = $('dkOutputs');
    list.replaceChildren();
    plan.outputs.forEach((o,i) => {
      const card = document.createElement('article'); card.className = 'dk-output';
      const title = document.createElement('h3'); title.textContent = o.title;
      const badge = document.createElement('span'); badge.className = 'dk-badge';
      badge.textContent = o.orientation+' · '+(o.kind==='image'?'Image draft':'Video draft');
      const label = document.createElement('label'); label.htmlFor = 'dkPrompt'+i; label.textContent = 'Edit prompt · '+(o.kind === 'video' ? 'Video maker limit: 2,000 characters' : '8,192 characters maximum');
      const prompt = document.createElement('textarea'); prompt.id = label.htmlFor; prompt.maxLength = 8192; prompt.value = o.prompt;
      const button = document.createElement('button'); button.type = 'button'; button.className = 'dk-button';
      button.textContent = o.kind==='image'?'Use in Images':'Use in Video';
      button.onclick = () => {
        try {
          const output = readEdits().outputs[i];
          const target = $(output.kind==='image'?'i_prompt':'prompt');
          if (!target) throw new Error('Maker is unavailable. Export your kit instead.');
          if (output.prompt.length > target.maxLength) throw new Error('Shorten this draft to '+target.maxLength+' characters before using it in '+(o.kind==='image'?'Images':'Video')+'. Nothing was changed.');
          if (target.value.trim() && !window.confirm('Replace the current maker prompt with this draft? Engine, style and cast settings will stay unchanged.')) return;
          target.value = output.prompt;
          target.dispatchEvent(new Event('input', {bubbles:true}));
          const shapes = $(output.kind==='image'?'i_ors':'ors');
          if (shapes) shapes.querySelectorAll('.chip').forEach(c => c.classList.toggle('sel', c.dataset.v===output.orientation));
          if (typeof window.showTab === 'function') window.showTab(output.kind==='image'?'tab-images':'tab-video');
          target.focus(); target.scrollIntoView({block:'center',behavior:'smooth'});
          status('Draft loaded. Review the maker’s engine, style and cast, then press its normal Make button. No job was started.');
        } catch (e) { status(e.message, true); }
      };
      card.append(title,badge,label,prompt,button); list.append(card);
    });
    $('dkExport').disabled = false;
  }
  $('dkBuild').onclick = () => {
    try {
      if (plan && !window.confirm('Rebuild the kit? This replaces the four edited drafts. Export them first if you want to keep them.')) return;
      render(window.MediaLabDesignKit.buildPlan({brief:$('dkBrief').value,brand:$('dkBrand').value,look:$('dkLook').value,copy:$('dkCopy').value}));
      status('Four editable drafts. This is a planning kit, not generated media.');
    } catch(e) { status(e.message, true); }
  };
  $('dkExport').onclick = () => {
    try {
      const edited = readEdits();
      const url = URL.createObjectURL(new Blob([JSON.stringify(edited,null,2)], {type:'application/json'}));
      const a = document.createElement('a'); a.href = url; a.download = 'media-lab-design-kit.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status('Kit exported, including your brief and edits. Keep it private if it contains private material.');
    } catch(e) { status(e.message, true); }
  };
  $('dkImport').onchange = async event => {
    const file = event.target.files[0];
    try {
      if (!file) return;
      if (file.size > 200000) throw new Error('Kit file is too large.');
      const imported = window.MediaLabDesignKit.parsePlan(await file.text());
      if (plan && !window.confirm('Replace this kit with the imported drafts?')) return;
      render(imported); status('Kit restored. Nothing was submitted or generated.');
    } catch(e) { status(e.message, true); }
    finally { event.target.value = ''; }
  };
})();
