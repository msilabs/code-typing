(() => {
  const LANGS = [
    ['php', 'PHP', 'php'], ['js', 'JavaScript', 'js'], ['ts', 'TypeScript', 'ts'], ['py', 'Python', 'py'],
    ['java', 'Java', 'java'], ['c', 'C', 'c'], ['cpp', 'C++', 'cpp'], ['cs', 'C#', 'cs'], ['go', 'Go', 'go'],
    ['rust', 'Rust', 'rs'], ['kotlin', 'Kotlin', 'kt'], ['swift', 'Swift', 'swift'], ['dart', 'Dart', 'dart'], ['sql', 'SQL', 'sql']
  ];
  const LABEL = Object.fromEntries(LANGS.map(l => [l[0], l[1]]));
  const EXT = Object.fromEntries(LANGS.map(l => [l[0], l[2]]));

  // ---- তৈরি করা কোড পড়া ----
  const BUILTIN = {};
  document.querySelectorAll('pre.lib-src').forEach(el => {
    (BUILTIN[el.dataset.lang] ||= []).push({ file: el.dataset.file, text: el.textContent, mine: false });
  });

  // লম্বা টোকেন আগে মিলবে, যাতে "=>" কে "=" আর ">" হিসেবে না ধরে
  const TOKENS = ['<?php', '#include', '#define', '$this', '&mut', '??=', '?->', '===', '!==', '...', '..=', '..<', '=>', '->', '<-', '::', '??', '?.', '?:', '!!',
    '&&', '||', '==', '!=', '<=', '>=', '<>', '<<', '>>', ':=', '**', '++', '--', '+=', '-=', '*=', '/=', '|=', '||=', '//', '#[', '..', '${', '\\(',
    '{', '}', '(', ')', '[', ']', ';', ':', '$', '"', "'", '`', '<', '>', '=', '.', ',', '!', '?', '&', '|', '*', '/', '+', '-', '%', '@', '#', '_', '\\', '^', '~']
    .sort((a, b) => b.length - a.length);

  const SHIFT = { '{': '[', '}': ']', '(': '9', ')': '0', ':': ';', '$': '4', '"': "'", '<': ',', '>': '.', '!': '1', '?': '/', '&': '7', '|': '\\', '*': '8', '+': '=', '%': '5', '@': '2', '#': '3', '_': '-', '^': '6', '~': '`' };
  const NAMES = {
    '<?php': 'PHP ওপেনিং ট্যাগ', '#include': 'হেডার ফাইল যোগ', '#define': 'ম্যাক্রো', '$this': 'বর্তমান অবজেক্ট', '&mut': 'পরিবর্তনযোগ্য রেফারেন্স',
    '??=': 'নাল হলে অ্যাসাইন', '?->': 'নালসেফ অ্যারো', '===': 'কঠোর সমান', '!==': 'কঠোর অসমান', '...': 'স্প্রেড / রেস্ট / রেঞ্জ',
    '..=': 'রেঞ্জ (শেষটা সহ)', '..<': 'রেঞ্জ (শেষটা বাদে)', '=>': 'ফ্যাট অ্যারো', '->': 'অ্যারো', '<-': 'চ্যানেলে পাঠানো', '::': 'ডাবল কোলন',
    '??': 'নাল কোয়েলেসিং', '?.': 'অপশনাল চেইনিং', '?:': 'এলভিস অপারেটর', '!!': 'নট-নাল জোর করে', '&&': 'এবং (AND)', '||': 'অথবা (OR)',
    '==': 'সমান কিনা', '!=': 'অসমান', '<=': 'ছোট বা সমান', '>=': 'বড় বা সমান', '<>': 'অসমান (SQL)', '<<': 'বাঁয়ে শিফট / স্ট্রিমে পাঠানো',
    '>>': 'ডানে শিফট', ':=': 'ঘোষণা ও অ্যাসাইন', '**': 'ঘাত / kwargs', '++': 'এক বাড়ানো', '--': 'এক কমানো', '+=': 'যোগ করে অ্যাসাইন',
    '-=': 'বিয়োগ করে অ্যাসাইন', '*=': 'গুণ করে অ্যাসাইন', '/=': 'ভাগ করে অ্যাসাইন', '|=': 'OR করে অ্যাসাইন', '||=': 'ফাঁকা হলে অ্যাসাইন',
    '//': 'পূর্ণসংখ্যা ভাগ / কমেন্ট', '#[': 'অ্যাট্রিবিউট (Rust)', '..': 'ক্যাসকেড / রেঞ্জ', '${': 'স্ট্রিং ইন্টারপোলেশন', '\\(': 'স্ট্রিং ইন্টারপোলেশন (Swift)',
    '{': 'কার্লি ব্রেস খোলা', '}': 'কার্লি ব্রেস বন্ধ', '(': 'প্রথম বন্ধনী খোলা', ')': 'প্রথম বন্ধনী বন্ধ', '[': 'স্কয়ার ব্র্যাকেট খোলা',
    ']': 'স্কয়ার ব্র্যাকেট বন্ধ', ';': 'সেমিকোলন', ':': 'কোলন', '$': 'ডলার', '"': 'ডাবল কোট', "'": 'সিঙ্গেল কোট', '`': 'ব্যাকটিক',
    '<': 'ছোট চিহ্ন / অ্যাঙ্গেল খোলা', '>': 'বড় চিহ্ন / অ্যাঙ্গেল বন্ধ', '=': 'সমান (অ্যাসাইন)', '.': 'ডট', ',': 'কমা', '!': 'না (NOT)',
    '?': 'প্রশ্নবোধক', '&': 'অ্যাম্পারস্যান্ড', '|': 'পাইপ', '*': 'তারকা / পয়েন্টার', '/': 'স্ল্যাশ', '+': 'যোগ', '-': 'বিয়োগ / হাইফেন', '%': 'শতাংশ / ভাগশেষ',
    '@': 'অ্যাট (অ্যানোটেশন)', '#': 'হ্যাশ', '_': 'আন্ডারস্কোর', '\\': 'ব্যাকস্ল্যাশ', '^': 'ক্যারেট', '~': 'টিল্ডা'
  };

  const BN = '০১২৩৪৫৬৭৮৯';
  const bn = v => String(v).replace(/\d/g, d => BN[d]);
  const fmtTime = ms => { const s = Math.floor(ms / 1000); return bn(Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---- হিসাব (এই ব্রাউজারে) ----
  const KEY = 'chihno-typing-v1', MINE_KEY = 'chihno-typing-mine-v1';
  let store = { stats: {}, hist: [] };
  try { const raw = localStorage.getItem(KEY); if (raw) store = Object.assign(store, JSON.parse(raw)); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };

  // ---- আমার কোড: অ্যাকাউন্টে (db) অথবা এই ব্রাউজারে ----
  let MINE = [];          // {id, lang, name, text, at}
  const loadLocalMine = () => { try { return JSON.parse(localStorage.getItem(MINE_KEY) || '[]'); } catch (e) { return []; } };
  const saveLocalMine = () => { try { localStorage.setItem(MINE_KEY, JSON.stringify(MINE)); return true; } catch (e) { return false; } };
  MINE = loadLocalMine();

  // ---- অবস্থা ----
  const S = { lang: 'php', idx: 0, drill: false };
  let R;

  const $ = id => document.getElementById(id);
  const codeEl = $('code'), typer = $('typer'), hint = $('focusHint'), resultEl = $('result');

  const listFor = lang => (BUILTIN[lang] || []).concat(
    MINE.filter(m => m.lang === lang).sort((a, b) => a.at - b.at).map(m => ({ file: m.name, text: m.text, mine: true, id: m.id })));

  function tokenize(text) {
    const tokAt = new Array(text.length).fill(-1);
    const toks = [];
    let i = 0;
    while (i < text.length) {
      const t = TOKENS.find(t => text.startsWith(t, i));
      if (t) {
        const id = toks.length;
        toks.push({ t, start: i, len: t.length, missed: false });
        for (let k = 0; k < t.length; k++) tokAt[i + k] = id;
        i += t.length;
      } else i++;
    }
    return { tokAt, toks };
  }

  function buildRound(text, file, tag) {
    const { tokAt, toks } = tokenize(text);
    const indent = new Array(text.length).fill(false);
    let lineStart = true;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '\n') { lineStart = true; continue; }
      if (lineStart && ch === ' ') indent[i] = true; else lineStart = false;
    }
    clearInterval(tick);
    document.body.classList.remove('focus-mode');
    R = { text, file, tag, tokAt, toks, indent, pos: 0, keys: 0, good: 0, miss: 0, confuse: [], t0: 0, t1: 0, done: false, spans: [], lines: [] };
    activeLine = -1;
    render();
    skipIndent();
    paintCursor(-1);
    updateLive();
    resultEl.hidden = true;
    $('snipTag').textContent = tag;
  }

  function render() {
    codeEl.textContent = '';
    const frag = document.createDocumentFragment();
    let lineEl, lineNo = 0;
    const newLine = () => {
      lineNo++;
      lineEl = document.createElement('div'); lineEl.className = 'line';
      const ln = document.createElement('span'); ln.className = 'ln'; ln.textContent = lineNo;
      lineEl.appendChild(ln); frag.appendChild(lineEl); R.lines.push(lineEl);
    };
    newLine();
    for (let i = 0; i < R.text.length; i++) {
      const ch = R.text[i];
      const sp = document.createElement('span');
      sp.className = 'c' + (R.tokAt[i] >= 0 ? ' sym' : '');
      sp.dataset.line = lineNo - 1;
      if (ch === '\n') { sp.classList.add('nl'); sp.textContent = '↵'; lineEl.appendChild(sp); R.spans.push(sp); newLine(); continue; }
      sp.textContent = ch;
      lineEl.appendChild(sp); R.spans.push(sp);
    }
    codeEl.appendChild(frag);
  }

  function skipIndent() {
    while (R.pos < R.text.length && R.indent[R.pos]) { R.spans[R.pos].classList.add('done'); R.pos++; }
  }

  let activeLine = -1;
  function paintCursor(prev) {
    if (prev >= 0 && R.spans[prev]) R.spans[prev].classList.remove('cur', 'wrong');
    const sp = R.spans[R.pos];
    if (sp) {
      sp.classList.add('cur');
      const l = +sp.dataset.line;
      if (l !== activeLine) { R.lines[activeLine]?.classList.remove('active'); R.lines[l]?.classList.add('active'); activeLine = l; }
      const box = $('codebox');
      const r = sp.getBoundingClientRect(), b = box.getBoundingClientRect();
      if (r.right > b.right - 30) box.scrollLeft += r.right - b.right + 60;
      else if (r.left < b.left + 60) box.scrollLeft = Math.max(0, box.scrollLeft - (b.left + 60 - r.left));
    }
    $('prog').style.width = (R.pos / R.text.length * 100) + '%';
    showNext();
  }

  function keyHtml(ch) {
    if (SHIFT[ch]) return '<span class="kbd">Shift</span>+<span class="kbd">' + esc(SHIFT[ch]) + '</span>';
    return '<span class="kbd">' + esc(ch) + '</span>';
  }

  function showNext() {
    const g = $('nGlyph'), n = $('nName'), k = $('nKeys');
    if (R.done) { g.textContent = '✓'; g.className = 'glyph'; n.textContent = 'শেষ!'; k.innerHTML = ''; return; }
    const i = R.pos, ch = R.text[i], tid = R.tokAt[i];
    if (tid >= 0) {
      const tk = R.toks[tid];
      g.className = 'glyph'; g.textContent = tk.t;
      n.textContent = NAMES[tk.t] || tk.t;
      const off = i - tk.start;
      k.innerHTML = [...tk.t].map((c, j) => j < off ? '<s style="opacity:.4">' + keyHtml(c) + '</s>' : keyHtml(c)).join(' ');
    } else {
      g.className = 'glyph plain';
      if (ch === '\n') { g.textContent = '↵'; n.textContent = 'নতুন লাইন'; k.innerHTML = '<span class="kbd">Enter</span>'; }
      else if (ch === ' ') { g.textContent = '␣'; n.textContent = 'স্পেস'; k.innerHTML = '<span class="kbd">Space</span>'; }
      else {
        g.textContent = ch;
        n.textContent = /[A-Z]/.test(ch) ? 'বড় হাতের অক্ষর' : /\d/.test(ch) ? 'সংখ্যা' : 'অক্ষর';
        k.innerHTML = /[A-Z]/.test(ch) ? '<span class="kbd">Shift</span>+<span class="kbd">' + ch + '</span>' : '';
      }
    }
  }

  function press(ch) {
    if (R.done) return;
    if (ch === '\r') ch = '\n';
    if (ch === '\t') return;
    if (!R.t0) { R.t0 = performance.now(); startTick(); }
    document.body.classList.add('focus-mode');
    const expect = R.text[R.pos];
    R.keys++;
    const tid = R.tokAt[R.pos];
    if (ch === expect) {
      R.good++;
      const prev = R.pos;
      R.spans[prev].classList.add('done');
      R.pos++;
      if (expect === '\n') skipIndent();
      paintCursor(prev);
      if (R.pos >= R.text.length) { finish(); return; }
    } else {
      R.miss++;
      const sp = R.spans[R.pos];
      sp.classList.add('miss');
      sp.classList.remove('wrong'); void sp.offsetWidth; sp.classList.add('wrong');
      setTimeout(() => sp.classList.remove('wrong'), 220);
      if (tid >= 0) { R.toks[tid].missed = true; R.confuse.push([R.toks[tid].t, ch]); }
    }
    updateLive();
  }

  let tick = 0;
  function startTick() { clearInterval(tick); tick = setInterval(updateLive, 250); }

  const wpmOf = (good, ms) => ms > 800 ? Math.round((good / 5) / (ms / 60000)) : 0;
  function updateLive() {
    const ms = R.t0 ? (R.done ? R.t1 : performance.now()) - R.t0 : 0;
    $('sWpm').textContent = bn(wpmOf(R.good, ms));
    const acc = R.keys ? Math.round(R.good / R.keys * 100) : 100;
    $('sAcc').textContent = bn(acc) + '%';
    $('accBox').classList.toggle('low', acc < 90);
    $('sTime').textContent = fmtTime(ms);
  }

  function finish() {
    R.done = true; R.t1 = performance.now(); clearInterval(tick);
    document.body.classList.remove('focus-mode');
    R.spans.forEach(s => s.classList.remove('cur'));
    const ms = R.t1 - R.t0;
    const wpm = wpmOf(R.good, ms), acc = Math.round(R.good / R.keys * 100);

    const st = (store.stats[S.lang] ||= {});
    const roundMiss = {};
    R.toks.forEach(tk => {
      const e = (st[tk.t] ||= { seen: 0, missed: 0, conf: {} });
      e.seen++;
      if (tk.missed) { e.missed++; roundMiss[tk.t] = (roundMiss[tk.t] || 0) + 1; }
    });
    R.confuse.forEach(([t, got]) => {
      const label = got === '\n' ? '↵' : got === ' ' ? '␣' : got;
      st[t].conf[label] = (st[t].conf[label] || 0) + 1;
    });
    const prevBest = Math.max(0, ...store.hist.filter(h => h.lang === S.lang).map(h => h.wpm));
    store.hist.push({ lang: S.lang, wpm, acc, at: Date.now() });
    store.hist = store.hist.slice(-200);
    save();
    renderWeak(); renderHist(); updateLive(); showNext();

    const top = Object.entries(roundMiss).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const newBest = wpm > prevBest && prevBest > 0;
    resultEl.innerHTML = `
      <h2>${acc >= 97 ? 'চমৎকার, প্রায় নিখুঁত!' : acc >= 90 ? 'ভালো হয়েছে।' : 'শেষ হলো। এবার একটু ধীরে, নির্ভুলভাবে।'}</h2>
      <div class="big">
        <div><b>${bn(wpm)}</b><small>শব্দ/মিনিট${newBest ? ' · নতুন সেরা' : ''}</small></div>
        <div><b>${bn(acc)}%</b><small>নির্ভুলতা</small></div>
        <div><b>${bn(R.miss)}</b><small>ভুল চাপ</small></div>
        <div><b>${fmtTime(ms)}</b><small>সময়</small></div>
      </div>
      <div class="weak-now">${top.length ? 'এই রাউন্ডে আটকেছেন: ' + top.map(([t, n]) => `<span class="chip">${esc(t)}${n > 1 ? ' ×' + bn(n) : ''}</span>`).join('') : '<span class="chip ok">কোনো চিহ্নে ভুল হয়নি</span>'}</div>
      <div class="actions">
        <button class="btn primary" id="rNext">পরের কোড →</button>
        <button class="btn" id="rAgain">এটাই আবার</button>
        <button class="btn" id="rDrill">দুর্বল চিহ্ন অনুশীলন</button>
      </div>`;
    resultEl.hidden = false;
    $('rNext').onclick = nextSnippet;
    $('rAgain').onclick = restart;
    $('rDrill').onclick = startDrill;
    $('rNext').focus();
  }

  // ---- দুর্বল চিহ্ন ----
  function weakRows(lang) {
    const st = store.stats[lang] || {};
    return Object.entries(st).filter(([, e]) => e.missed > 0)
      .map(([t, e]) => ({ t, seen: e.seen, missed: e.missed, rate: e.missed / e.seen, conf: e.conf }))
      .sort((a, b) => (b.rate * Math.min(b.seen, 6)) - (a.rate * Math.min(a.seen, 6)) || b.missed - a.missed);
  }
  function sampleRows(lang) {
    // এই ভাষার কোডে সবচেয়ে বেশি আসা কয়েকটা বহু-অক্ষরের চিহ্ন দিয়ে নমুনা
    const freq = {};
    (BUILTIN[lang] || []).forEach(s => tokenize(s.text).toks.forEach(t => { freq[t.t] = (freq[t.t] || 0) + 1; }));
    const picks = Object.entries(freq).sort((a, b) => (b[0].length > 1) - (a[0].length > 1) || b[1] - a[1]).slice(0, 5);
    const rates = [0.42, 0.35, 0.28, 0.2, 0.12];
    return picks.map(([t, n], i) => ({ t, seen: n, missed: Math.max(1, Math.round(n * rates[i])), rate: rates[i], conf: {} }));
  }

  function renderWeak() {
    $('weakLang').textContent = LABEL[S.lang];
    const hasData = Object.keys(store.stats[S.lang] || {}).length > 0;
    let rows = hasData ? weakRows(S.lang) : sampleRows(S.lang);
    $('sampleNote').hidden = hasData;
    $('btnReset').hidden = !hasData;
    $('btnDrill').disabled = !hasData || rows.length === 0;
    const ul = $('weakList');
    if (!rows.length) { ul.innerHTML = '<li><p class="empty" style="grid-column:1/-1">এখন পর্যন্ত কোনো চিহ্নে ভুল নেই। দারুণ!</p></li>'; return; }
    ul.innerHTML = rows.slice(0, 7).map(r => {
      const conf = Object.entries(r.conf || {}).sort((a, b) => b[1] - a[1])[0];
      const confTxt = conf ? ` · প্রায়ই চাপেন <b style="font-family:var(--f-code)">${esc(conf[0])}</b>` : '';
      return `<li>
        <span class="tok" title="${esc(NAMES[r.t] || r.t)}">${esc(r.t)}</span>
        <span class="bar"><i style="width:${Math.max(4, Math.round(r.rate * 100))}%"></i></span>
        <span class="pct">${bn(Math.round(r.rate * 100))}%</span>
        <span class="meta">${esc(NAMES[r.t] || '')} · ${bn(r.seen)} বারে ${bn(r.missed)} বার ভুল${confTxt}</span>
      </li>`;
    }).join('');
  }

  function renderHist() {
    const h = store.hist.filter(x => x.lang === S.lang).slice(-14);
    const box = $('histBox');
    if (!h.length) { box.innerHTML = `<p class="empty">${LABEL[S.lang]}-এ এখনো কোনো রাউন্ড শেষ হয়নি। প্রতিটা রাউন্ডের গতি এখানে কলাম হয়ে জমবে।</p>`; return; }
    const max = Math.max(...h.map(x => x.wpm), 10);
    const avg = Math.round(h.reduce((s, x) => s + x.wpm, 0) / h.length);
    box.innerHTML = `<div class="hist">${h.map(x => `<i style="height:${Math.round(x.wpm / max * 100)}%" title="${bn(x.wpm)} শব্দ/মিনিট, ${bn(x.acc)}%"></i>`).join('')}</div>
      <div class="hist-cap"><span>শেষ ${bn(h.length)} রাউন্ড</span><span>গড় ${bn(avg)} · সেরা ${bn(Math.max(...h.map(x => x.wpm)))}</span></div>`;
  }

  // ---- কোড বাছাই ----
  function renderPicker() {
    const list = listFor(S.lang);
    const nb = (BUILTIN[S.lang] || []).length;
    const sel = $('snipSel');
    const opt = (s, i) => `<option value="${i}">${bn(i < nb ? i + 1 : i - nb + 1)}. ${esc(s.file)}</option>`;
    let html = `<optgroup label="তৈরি করা কোড (${bn(nb)})">${list.slice(0, nb).map(opt).join('')}</optgroup>`;
    if (list.length > nb) html += `<optgroup label="আমার কোড (${bn(list.length - nb)})">${list.slice(nb).map((s, j) => opt(s, nb + j)).join('')}</optgroup>`;
    if (S.drill) html = `<option value="drill">দুর্বল চিহ্ন অনুশীলন</option>` + html;
    sel.innerHTML = html;
    sel.value = S.drill ? 'drill' : String(S.idx);
  }

  function loadSnippet() {
    const list = listFor(S.lang);
    if (S.idx >= list.length) S.idx = 0;
    const sn = list[S.idx];
    S.drill = false;
    renderPicker();
    buildRound(sn.text, sn.file, (sn.mine ? 'আমার কোড · ' : '') + bn(S.idx + 1) + ' / ' + bn(list.length));
    renderMine();
  }
  function nextSnippet() { S.idx = (S.idx + 1) % listFor(S.lang).length; loadSnippet(); focusTyper(); }
  function randSnippet() {
    const n = listFor(S.lang).length;
    if (n > 1) { let j; do { j = Math.floor(Math.random() * n); } while (j === S.idx); S.idx = j; }
    loadSnippet(); focusTyper();
  }
  function restart() {
    if (S.drill) buildRound(R.text, R.file, R.tag); else loadSnippet();
    focusTyper();
  }
  function startDrill() {
    const weak = weakRows(S.lang).slice(0, 4).map(r => r.t);
    if (!weak.length) return;
    const lines = [];
    listFor(S.lang).forEach(sn => sn.text.split('\n').forEach(l => {
      const t = l.trim();
      if (t.length > 2 && weak.some(w => t.includes(w)) && !lines.includes(t)) lines.push(t);
    }));
    for (let i = lines.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lines[i], lines[j]] = [lines[j], lines[i]]; }
    const pick = lines.slice(0, 6);
    if (!pick.length) return;
    S.drill = true;
    renderPicker();
    buildRound(pick.join('\n'), 'drill.' + EXT[S.lang], 'চিহ্ন: ' + weak.join('  '));
    focusTyper();
  }
  function setLang(lang, idx = 0) {
    S.lang = lang; S.idx = idx;
    document.querySelectorAll('#langbar button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    $('addLang').value = lang;
    loadSnippet(); renderWeak(); renderHist();
  }

  function renderLangbar() {
    $('langbar').innerHTML = LANGS.map(([k, name]) => {
      const n = MINE.filter(m => m.lang === k).length;
      return `<button type="button" data-lang="${k}" aria-pressed="${k === S.lang}">${esc(name)}${n ? ` <small>+${bn(n)}</small>` : ''}</button>`;
    }).join('');
    document.querySelectorAll('#langbar button').forEach(b => b.addEventListener('click', () => { setLang(b.dataset.lang); focusTyper(); }));
  }

  // ---- আমার কোড: তালিকা, যোগ, মোছা ----
  function renderMine() {
    const nb = (BUILTIN[S.lang] || []).length;
    const mine = listFor(S.lang).slice(nb);
    $('mineTitle').textContent = LABEL[S.lang] + '-এ আমার কোড';
    $('mineCount').textContent = `সব ভাষায় মোট ${bn(MINE.length)}টা`;
    const ul = $('mineList');
    if (!mine.length) {
      ul.innerHTML = `<li><p class="empty" style="grid-column:1/-1">${esc(LABEL[S.lang])}-এ এখনো নিজের কোড নেই। বাঁয়ের ঘরে পেস্ট করে "যোগ করুন" চাপলে এখানে আসবে।</p></li>`;
      return;
    }
    ul.innerHTML = mine.map((s, j) => {
      const i = nb + j;
      const first = s.text.split('\n').find(l => l.trim()) || '';
      const nLines = s.text.split('\n').length;
      return `<li class="${!S.drill && i === S.idx ? 'on' : ''}">
        <span class="nm" title="${esc(s.file)}">${esc(s.file)}</span>
        <span class="acts">
          <button class="btn small" data-play="${i}">টাইপ করুন</button>
          <button class="btn small" data-del="${esc(s.id)}">মুছুন</button>
        </span>
        <span class="pv">${bn(nLines)} লাইন · ${esc(first.trim())}</span>
      </li>`;
    }).join('');
    ul.querySelectorAll('[data-play]').forEach(b => b.addEventListener('click', () => {
      S.idx = +b.dataset.play; loadSnippet();
      $('codebox').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      focusTyper();
    }));
    ul.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
      if (!b.dataset.armed) {
        b.dataset.armed = '1'; b.textContent = 'নিশ্চিত?';
        setTimeout(() => { if (b.isConnected) { delete b.dataset.armed; b.textContent = 'মুছুন'; } }, 3000);
        return;
      }
      deleteMine(b.dataset.del);
    }));
  }

  function normalize(src) {
    return src.replace(/\r\n?/g, '\n').replace(/\t/g, '    ')
      .replace(/[   ]/g, ' ')
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .split('\n').map(l => l.replace(/\s+$/, '')).join('\n')
      .replace(/^\n+|\n+$/g, '');
  }

  function guessName(text, lang, n) {
    const m = text.match(/(?:class|interface|struct|enum|object|record|trait|function|func|fun|fn|def)\s+([A-Za-z_][A-Za-z0-9_]*)/);
    if (m) return m[1] + '.' + EXT[lang];
    const t = text.match(/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|WITH)\b/i);
    if (t) return t[1].toLowerCase() + '-' + n + '.sql';
    return 'snippet-' + n + '.' + EXT[lang];
  }

  async function addMine(e) {
    e.preventDefault();
    const msg = $('addMsg');
    const lang = $('addLang').value;
    const raw = $('addText').value;
    const baseName = $('addName').value.trim();
    const pieces = raw.split(/^\s*---\s*$/m).map(normalize).filter(p => p.trim().length > 0);
    msg.className = 'msg';
    if (!pieces.length) { msg.className = 'msg bad'; msg.textContent = 'কোডের ঘর ফাঁকা। আগে কিছু কোড পেস্ট করুন।'; $('addText').focus(); return; }
    const tooLong = pieces.findIndex(p => p.split('\n').length > 40);
    if (tooLong >= 0) { msg.className = 'msg bad'; msg.textContent = `${bn(tooLong + 1)} নম্বর কোডটা ৪০ লাইনের বেশি। ছোট ছোট অংশে ভাগ করে মাঝে --- দিন।`; return; }

    const already = MINE.filter(m => m.lang === lang).length;
    const now = Date.now();
    const items = pieces.map((text, i) => ({
      lang, text: text.slice(0, 6000), at: now + i,
      name: baseName ? (pieces.length > 1 ? `${baseName} (${i + 1})` : baseName) : guessName(text, lang, already + i + 1)
    }));
    items.forEach((it, i) => MINE.push({ id: 'local-' + now + '-' + i, ...it }));
    const memOnly = !saveLocalMine();
    afterMineChange();
    msg.className = 'msg ok';
    msg.textContent = `${bn(items.length)}টা কোড ${LABEL[lang]}-এ যোগ হয়েছে।` + (memOnly ? ' এই ব্রাউজারে সংরক্ষণ বন্ধ বা জায়গা শেষ, তাই পেজ বন্ধ করলে এগুলো থাকবে না।' : '');
    $('addText').value = ''; $('addName').value = '';
    if (lang !== S.lang) setLang(lang, (BUILTIN[lang] || []).length + already);
    else { S.idx = (BUILTIN[lang] || []).length + already; loadSnippet(); }
  }

  function deleteMine(id) {
    const cur = listFor(S.lang)[S.idx];
    MINE = MINE.filter(m => m.id !== id);
    saveLocalMine();
    afterMineChange();
    if (cur && cur.id === id) { S.idx = 0; loadSnippet(); }
  }

  function afterMineChange() {
    renderLangbar();
    // চলমান রাউন্ড না ভেঙে শুধু তালিকা নতুন করে আঁকা
    if (R && !S.drill) {
      const j = listFor(S.lang).findIndex(s => s.text === R.text);
      if (j >= 0) S.idx = j;
    }
    renderPicker();
    renderMine();
  }


  // ---- ফোকাস আর কীবোর্ড ----
  function focusTyper() {
    if (!resultEl.hidden) return;
    typer.focus({ preventScroll: true });
    hint.hidden = document.activeElement === typer;
  }

  typer.addEventListener('focus', () => { hint.hidden = true; });
  typer.addEventListener('blur', () => { document.body.classList.remove('focus-mode'); setTimeout(() => { if (document.activeElement !== typer && resultEl.hidden) hint.hidden = false; }, 0); });
  $('codebox').addEventListener('mousedown', e => { e.preventDefault(); focusTyper(); });
  $('codebox').addEventListener('touchend', () => focusTyper());

  typer.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); restart(); return; }
    if (e.key === 'Tab') { e.preventDefault(); return; }
    if (e.key === 'Enter') { e.preventDefault(); press('\n'); return; }
  });
  typer.addEventListener('input', () => {
    const v = typer.value; typer.value = '';
    for (const ch of v) press(ch);
  });

  $('snipSel').addEventListener('change', e => {
    if (e.target.value === 'drill') return;
    S.idx = +e.target.value; loadSnippet(); focusTyper();
  });
  $('btnNext').addEventListener('click', nextSnippet);
  $('btnRand').addEventListener('click', randSnippet);
  $('btnDrill').addEventListener('click', startDrill);
  $('btnAdd').addEventListener('click', () => {
    $('addLang').value = S.lang;
    $('lib').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => $('addText').focus({ preventScroll: true }), 350);
  });
  $('addForm').addEventListener('submit', addMine);
  $('addText').addEventListener('keydown', e => {
    // কোডের ঘরে Tab চাপলে ৪টা স্পেস বসবে, ফোকাস সরবে না
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const t = e.target, s = t.selectionStart;
      t.setRangeText('    ', s, t.selectionEnd, 'end');
    }
  });
  $('btnReset').addEventListener('click', function () {
    if (this.dataset.armed) { delete store.stats[S.lang]; save(); renderWeak(); this.textContent = 'মুছুন'; delete this.dataset.armed; return; }
    this.dataset.armed = '1'; this.textContent = 'নিশ্চিত? আবার চাপুন';
    setTimeout(() => { delete this.dataset.armed; this.textContent = 'মুছুন'; }, 3000);
  });
  document.addEventListener('mousemove', e => {
    if (Math.abs(e.movementX) + Math.abs(e.movementY) > 6) document.body.classList.remove('focus-mode');
  });
  document.addEventListener('keydown', e => {
    if (resultEl.hidden) return;
    if (e.key === 'Enter' && document.activeElement?.tagName !== 'BUTTON') nextSnippet();
    if (e.key === 'Escape') restart();
  });

  $('addLang').innerHTML = LANGS.map(([k, name]) => `<option value="${k}">${esc(name)}</option>`).join('');
  renderLangbar();
  setLang('php');
  hint.hidden = document.activeElement === typer;
})();
