/* Original Media Lab implementation. Local planning, never automatic execution. */
(function (root) {
  'use strict';
  var FORMATS = [
    {id:'poster', title:'Poster', kind:'image', orientation:'portrait', direction:'Tall poster background; strong focal subject and generous clear space for a headline.'},
    {id:'social', title:'Social square', kind:'image', orientation:'square', direction:'Square social graphic; one bold focal subject, simple silhouette, mobile-readable composition.'},
    {id:'thumbnail', title:'Wide thumbnail', kind:'image', orientation:'landscape', direction:'Wide thumbnail; strong visual hierarchy and a clear area for a short title.'},
    {id:'motion', title:'Motion concept', kind:'video', orientation:'portrait', direction:'Tall short motion concept: establish the subject, reveal the main idea, hold a clean end frame. No vocals. Use the same visual language as the stills.'}
  ];
  function text(value, name, max, required) {
    if (value === undefined || value === null) value = '';
    if (typeof value !== 'string' || value.length > max) throw new Error(name+' must be text, at most '+max+' characters.');
    if (required && !value.trim()) throw new Error('Add a '+name+'.');
    return value.trim();
  }
  function buildPlan(input) {
    if (!input || typeof input !== 'object') throw new Error('Add a brief.');
    var brief = text(input.brief, 'brief', 4000, true);
    var brand = text(input.brand, 'brand', 120);
    var look = text(input.look, 'visual direction', 1000);
    var copy = text(input.copy, 'copy', 500);
    return {version:1, status:'draft', brief:brief, brand:brand, look:look, copy:copy,
      outputs:FORMATS.map(function (f) {
        return {id:f.id, title:f.title, kind:f.kind, orientation:f.orientation,
          prompt:['Campaign brief: '+brief, 'Brand: '+brand, 'Shared visual direction: '+look,
            f.direction, 'Intended copy (add/verify in an editor): '+copy,
            'Keep palette, subject and lighting consistent across the campaign. Do not invent logos, claims or contact details.'].join('\n')};
      })};
  }
  function parsePlan(raw) {
    if (typeof raw !== 'string' || raw.length > 50000) throw new Error('Kit JSON must be at most 50,000 characters.');
    var p;
    try { p = JSON.parse(raw); } catch (_) { throw new Error('Kit JSON could not be read.'); }
    if (!p || p.version !== 1 || p.status !== 'draft') throw new Error('Unsupported kit version or status.');
    var keys = ['version','status','brief','brand','look','copy','outputs'];
    if (Object.keys(p).some(function(k){return keys.indexOf(k)<0;})) throw new Error('Unexpected kit fields.');
    var clean = buildPlan(p);
    if (!Array.isArray(p.outputs) || p.outputs.length !== FORMATS.length) throw new Error('Kit requires four outputs.');
    p.outputs.forEach(function(o,i){
      var expected = clean.outputs[i];
      if (!o || Object.keys(o).some(function(k){return ['id','title','kind','orientation','prompt'].indexOf(k)<0;})) throw new Error('Unexpected output fields.');
      if (o.id!==expected.id || o.title!==expected.title || o.kind!==expected.kind || o.orientation!==expected.orientation) throw new Error('Output format does not match the kit.');
      expected.prompt = text(o.prompt, 'output prompt', 8192, true);
    });
    return clean;
  }
  var api = {buildPlan:buildPlan, parsePlan:parsePlan};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MediaLabDesignKit = api;
})(typeof window === 'undefined' ? globalThis : window);
