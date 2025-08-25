// gate.js — Reusable license validation + gated downloads
// Configure once per page: GATE.init({ validateUrl: 'https://stealthwork.cole-2d1.workers.dev/validate?license=' });
const GATE = (() => {
  let VALIDATE = '';
  const state = { ok: false, license: null };

  function setValidateUrl(u){ VALIDATE = u; }

  async function validate(license){
    if(!VALIDATE) throw new Error('Validate URL not set.');
    const r = await fetch(VALIDATE + encodeURIComponent(license));
    const j = await r.json();
    return !!j.ok;
  }

  function renderLinks(links){
    const frag = document.createDocumentFragment();
    const list = document.createElement('div');
    list.className = 'success';
    const h = document.createElement('div');
    h.innerHTML = '<strong>Unlocked.</strong> Your downloads:';
    list.appendChild(h);
    links.forEach(u => {
      const a = document.createElement('a');
      a.href = u;
      a.download = '';
      a.textContent = (u.split('/').pop() || u);
      list.appendChild(document.createElement('br'));
      list.appendChild(a);
    });
    frag.appendChild(list);
    return frag;
  }

  async function unlock({ input, targets = [], links = [] }){
    const el = typeof input === 'string' ? document.querySelector(input) : input;
    if(!el) return alert('License input not found');
    const lic = (el.value || '').trim();
    if(!lic) return alert('Enter license key');
    try{
      const ok = await validate(lic);
      if(!ok) return alert('Invalid license');
      state.ok = true; state.license = lic;
      targets.forEach(sel => {
        const t = document.querySelector(sel);
        if(t){
          if(links && links.length){
            t.innerHTML = '';
            t.appendChild(renderLinks(links));
          } else {
            t.classList.add('success');
            t.textContent = 'Unlocked.';
          }
        }
      });
    }catch(e){
      console.error(e);
      alert('Validation failed.');
    }
  }

  function gateExport(buttonSelector, getTextFn){
    const btn = document.querySelector(buttonSelector);
    if(!btn) return;
    btn.addEventListener('click', async () => {
      if(!state.ok){
        const lic = prompt('Enter license key:');
        if(!lic) return;
        const ok = await validate(lic);
        if(!ok) return alert('Invalid license');
        state.ok = true; state.license = lic;
      }
      const content = getTextFn();
      if(!content) return alert('Nothing to export');
      const a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
      a.download = 'export.txt';
      a.click();
    });
  }

  return {
    init: ({ validateUrl }) => setValidateUrl(validateUrl),
    unlock,
    gateExport
  };
})();
