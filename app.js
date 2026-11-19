(() => {
  'use strict';
  const styles = window.HAIRCUTS;
  const ids = styles.map(s => s.id);
  const byId = new Map(styles.map(s => [s.id, s]));
  const $ = (q, root = document) => root.querySelector(q);
  const grid = $('#grid'), dialog = $('#detail');
  const storageKey = 'haircut-lookbook-v1';
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch (_) {}
  let order = [...new Set([...(Array.isArray(stored.order) ? stored.order : []), ...ids])].filter(id => byId.has(id));
  let saved = new Set((Array.isArray(stored.saved) ? stored.saved : []).filter(id => byId.has(id)));
  let filter = 'all', current = null, lastFocus = null, toastTimer;
  const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function toast(text) { $('#toast').textContent = text; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2800); }
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify({order, saved: [...saved]})); }
    catch (_) { toast('Browser storage is unavailable. Changes last for this visit.'); }
  }
  function visibleIds() { return order.filter(id => filter === 'all' || (filter === 'saved' ? saved.has(id) : byId.get(id).phase === filter)); }
  const dots = n => `<span class="dots" aria-hidden="true">${'●'.repeat(n)}<span class="off">${'●'.repeat(5-n)}</span></span>`;
  function stats(s) {
    return `<div class="stats"><div><span class="stat-label">Daily effort · ${s.effort}/5</span>${dots(s.effort)}</div><div><span class="stat-label">Active styling</span><span class="stat-value">${s.minutes} min</span></div><div><span class="stat-label">Change today · ${s.change}/5</span>${dots(s.change)}</div><div><span class="stat-label">Trim every</span><span class="stat-value">${s.trim} weeks</span></div></div>`;
  }
  function render(focusSelector) {
    const shown = visibleIds();
    grid.innerHTML = shown.map((id, i) => {
      const s = byId.get(id), isSaved = saved.has(id);
      return `<article class="card" data-id="${id}" aria-label="${esc(s.name)}"><div class="card-head"><button class="grip" data-drag="${id}" aria-label="Drag to reorder ${esc(s.name)}. Or use arrow keys." title="Drag to reorder; arrow keys also work">⠿</button><span class="card-rank">${String(order.indexOf(id)+1).padStart(2,'0')} / YOUR ORDER</span><button class="move" data-move="-1" data-id="${id}" aria-label="Move ${esc(s.name)} earlier" ${i===0?'disabled':''}>↑</button><button class="move" data-move="1" data-id="${id}" aria-label="Move ${esc(s.name)} later" ${i===shown.length-1?'disabled':''}>↓</button><button class="save" data-save="${id}" aria-pressed="${isSaved}" aria-label="${isSaved?'Unsave':'Save'} ${esc(s.name)}">${isSaved?'♥':'♡'}</button></div><button class="image-button" data-open="${id}" aria-label="See ${esc(s.name)} and barber plan"><img src="assets/${id}.webp" alt="AI hairstyle preview: ${esc(s.name)} on you" width="1086" height="1448" loading="lazy" decoding="async">${s.badge?`<span class="badge">${esc(s.badge)}</span>`:''}<span class="image-id">${id}</span></button><div class="card-body"><p class="card-phase">${s.phase==='today'?'CUT TODAY · '+esc(s.label):'GROW INTO · '+esc(s.label)}</p><h3 class="card-title"><button data-open="${id}">${esc(s.name)}</button></h3><p class="tagline">${esc(s.tagline)}</p>${stats(s)}<div class="card-bottom"><button class="plan-link" data-open="${id}">See the plan ↗</button><span>${s.phase==='today'?'Ready for the chair':'Keep length today'}</span></div></div></article>`;
    }).join('');
    $('#empty').hidden = shown.length > 0;
    $('#saved-count').textContent = saved.size;
    $('#result-count').textContent = `${shown.length} ${shown.length === 1 ? 'style' : 'styles'}${filter==='saved'?' saved':''}`;
    if (focusSelector) $(focusSelector)?.focus({preventScroll:true});
  }
  function toggleSave(id) {
    saved.has(id) ? saved.delete(id) : saved.add(id); persist(); render();
    const button = $('[data-detail-save]');
    if(button) { button.textContent = saved.has(current) ? '♥ Saved' : '♡ Save this look'; button.setAttribute('aria-pressed', saved.has(current)); }
    toast(saved.has(id) ? 'Added to your saved looks' : 'Removed from saved looks');
  }
  function move(id, direction, focusSelector) {
    const visible = visibleIds(), from = visible.indexOf(id), other = visible[from+direction];
    if (!other) return;
    const i = order.indexOf(id), j = order.indexOf(other);
    order.splice(i,1); order.splice(j,0,id); persist(); render(focusSelector);
    const text = `${byId.get(id).name} moved to position ${order.indexOf(id)+1}`;
    $('#drag-status').textContent = text; toast(text);
  }
  function show(id, updateURL=true) {
    if (!byId.has(id)) return;
    if (!dialog.open) lastFocus = document.activeElement;
    current = id;
    const s = byId.get(id);
    $('#detail-kicker').textContent = `${s.phase==='today'?'Cut today':'Grow into · '+s.label} / Style ${id}`;
    $('#detail-content').innerHTML = `<div class="detail-layout"><div class="detail-visual"><a href="assets/${id}.webp" target="_blank" rel="noopener" aria-label="Open full image of ${esc(s.name)}"><img class="detail-image" src="assets/${id}.webp" alt="AI preview of you with ${esc(s.name)}" width="1086" height="1448"></a><p class="detail-disclaimer">AI preview, not an exact prediction. Tap image to enlarge.</p>${stats(s)}<p class="detail-length">Target: ${esc(s.length)}<br>Lengths and ratings are estimates; confirm dry with your barber.</p></div><div class="detail-copy"><p class="card-phase">${esc(s.label)}</p><h2 id="detail-title" class="detail-name">${esc(s.name)}</h2><p class="detail-tagline">${esc(s.tagline)}</p><div class="detail-actions"><button class="primary" data-copy="${id}">Copy barber notes ↗</button><button class="secondary" data-detail-save="${id}" aria-pressed="${saved.has(id)}">${saved.has(id)?'♥ Saved':'♡ Save this look'}</button><button class="secondary" data-print>Print plan</button></div><h3>Tell your barber today</h3><p class="barber-note">${esc(s.barber)}</p>${s.phase==='future'?'<p><strong>Grow-out estimate:</strong> '+esc(s.label)+' from your photographed length, if you preserve it today. Trims and wave shrinkage can extend this.</p>':''}<h3>Style it at home</h3><ol>${s.steps.map(step=>'<li>'+esc(step)+'</li>').join('')}</ol><h3>The small kit</h3><p>${esc(s.kit)}</p><h3>Why it is on your list</h3><p>${esc(s.why)}</p><h3>The trade-off</h3><p>${esc(s.tradeoff)}</p><nav class="detail-nav" aria-label="Browse styles"><button data-prev>← Previous look</button><button data-next>Next look →</button></nav></div></div>`;
    document.body.classList.add('modal-open');
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    $('#close-detail').focus({preventScroll:true});
    if (updateURL) history.replaceState(null,'',`#style-${id}`);
  }
  function close() { dialog.close(); }
  dialog.addEventListener('close', () => {
    current = null; document.body.classList.remove('modal-open');
    if(location.hash.startsWith('#style-')) history.replaceState(null,'','#looks');
    if(lastFocus?.isConnected) lastFocus.focus({preventScroll:true});
  });
  $('#close-detail').addEventListener('click',close);
  dialog.addEventListener('click',e=>{ if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();} });
  document.addEventListener('click', async e => {
    const open = e.target.closest('[data-open]'); if(open) {show(open.dataset.open);return;}
    const save = e.target.closest('[data-save],[data-detail-save]'); if(save){toggleSave(save.dataset.save||save.dataset.detailSave);return;}
    const tab = e.target.closest('[data-filter]'); if(tab) {
      filter = tab.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(t => {t.classList.toggle('active',t===tab);t.setAttribute('aria-pressed',t===tab);});
      render();return;
    }
    const mover=e.target.closest('[data-move]');if(mover){move(mover.dataset.id,Number(mover.dataset.move),`[data-drag="${mover.dataset.id}"]`);return;}
    const copy=e.target.closest('[data-copy]');if(copy){
      const s=byId.get(copy.dataset.copy),text=s.name+' — barber notes for today\n\n'+s.barber+'\n\nTarget lengths: '+s.length+' (confirm dry in person).';
      try { await navigator.clipboard.writeText(text);toast('Barber notes copied'); }
      catch (_){const range=document.createRange();range.selectNodeContents($('.barber-note'));const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);toast('Notes selected. Touch and hold or use Copy.');}return;
    }
    if(e.target.closest('[data-print]')){window.print();return;}
    if(e.target.closest('[data-prev],[data-next]')){const list=order,i=list.indexOf(current),step=e.target.closest('[data-prev]')?-1:1;show(list[(i+step+list.length)%list.length]);}
  });
  $('#reset-order').addEventListener('click',()=>{order=[...ids];persist();render();toast('Original order restored');});
  grid.addEventListener('keydown',e=>{
    const handle=e.target.closest('[data-drag]');if(!handle)return;
    if(['ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(e.key)) {e.preventDefault();move(handle.dataset.drag,['ArrowUp','ArrowLeft'].includes(e.key)?-1:1,`[data-drag="${handle.dataset.drag}"]`);}
  });
  let drag=null,frame=null;
  function pickTarget() {
    if(!drag?.active)return;
    const target=document.elementFromPoint(drag.x,drag.y)?.closest('.card');
    document.querySelectorAll('.drop-target').forEach(c=>c.classList.remove('drop-target'));
    if(target&&target.dataset.id!==drag.id){drag.target=target.dataset.id;target.classList.add('drop-target');}
    else drag.target=null;
  }
  function tick() {
    if(!drag?.active)return;
    const edge=Math.min(100,innerHeight/5);
    const delta=drag.y<edge?-Math.ceil((edge-drag.y)/7):drag.y>innerHeight-edge?Math.ceil((drag.y-innerHeight+edge)/7):0;
    if(delta){window.scrollBy(0,delta);pickTarget();}
    frame=requestAnimationFrame(tick);
  }
  grid.addEventListener('pointerdown',e=>{
    const handle=e.target.closest('[data-drag]');if(!handle||e.button!==0)return;
    handle.setPointerCapture(e.pointerId);
    drag={id:handle.dataset.drag,pointer:e.pointerId,handle,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,active:false,target:null};
  });
  grid.addEventListener('pointermove',e=>{
    if(!drag||drag.pointer!==e.pointerId)return;
    drag.x=e.clientX;drag.y=e.clientY;
    if(!drag.active&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6){
      drag.active=true;drag.card=drag.handle.closest('.card');drag.card.classList.add('dragging');
      drag.ghost=document.createElement('div');drag.ghost.className='drag-ghost';drag.ghost.textContent='⠿ '+byId.get(drag.id).name;document.body.append(drag.ghost);document.body.classList.add('is-dragging');frame=requestAnimationFrame(tick);
    }
    if(drag.active){e.preventDefault();drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';pickTarget();}
  });
  function finishDrag(e,cancel=false){
    if(!drag||e.pointerId!==drag.pointer)return;
    const d=drag;drag=null;cancelAnimationFrame(frame);document.body.classList.remove('is-dragging');d.ghost?.remove();d.card?.classList.remove('dragging');document.querySelectorAll('.drop-target').forEach(c=>c.classList.remove('drop-target'));
    if(d.handle.hasPointerCapture(e.pointerId))d.handle.releasePointerCapture(e.pointerId);
    if(d.active&&!cancel&&d.target){
      const i=order.indexOf(d.id),j=order.indexOf(d.target);order.splice(i,1);order.splice(j,0,d.id);persist();render(`[data-drag="${d.id}"]`);toast('New order saved');$('#drag-status').textContent=`${byId.get(d.id).name} moved to position ${order.indexOf(d.id)+1}`;
    }
  }
  grid.addEventListener('pointerup',e=>finishDrag(e));
  grid.addEventListener('pointercancel',e=>finishDrag(e,true));
  grid.addEventListener('lostpointercapture',e=>{if(drag)finishDrag(e,true);});
  window.addEventListener('hashchange',()=>{const id=location.hash.match(/^#style-(\d{2})$/)?.[1];if(id)show(id,false);else if(dialog.open)close();});
  render();
  const linked=location.hash.match(/^#style-(\d{2})$/)?.[1];if(linked)show(linked,false);
})();
