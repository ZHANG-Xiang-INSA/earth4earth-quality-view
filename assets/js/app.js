/* app.js — renders the portal sections from window.SITE_DATA + window.UI and wires all interactivity.
   Order: overview · how · roles(+RACI) · sysmap · about · library · crosswalk. No login gate. */
(function () {
  var D = window.SITE_DATA, U = window.UI;
  var lang = localStorage.getItem('e4e_lang') || 'zh';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function t(k) { var o = U[k] || {}; return o[lang] || o.zh || k; }
  function bi(o) { return o ? (o[lang] || o.zh || o.en || '') : ''; }

  var NAVS = ['overview', 'how', 'roles', 'sysmap', 'about', 'library', 'crosswalk'];

  /* ---- NAV ---- */
  function renderNav() {
    $('#nav').innerHTML =
      '<a class="logo" href="#overview"><span class="mark">e</span><span>' + (lang === 'zh' ? U.brand.zh : U.brand.en)
      + '<small>' + t('brand_sub') + '</small></span></a>'
      + '<button class="pillbtn menu-btn" id="menuBtn">☰</button>'
      + '<nav class="links" id="navlinks">' + NAVS.map(function (id) { return '<a href="#' + id + '" data-nav="' + id + '">' + t('nav_' + id) + '</a>'; }).join('') + '</nav>'
      + '<div class="tools"><button class="pillbtn" id="langBtn">' + (lang === 'zh' ? 'EN' : '中文') + '</button></div>';
    $('#langBtn').onclick = function () { lang = lang === 'zh' ? 'en' : 'zh'; localStorage.setItem('e4e_lang', lang); document.documentElement.setAttribute('data-lang', lang); document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'; renderAll(); };
    $('#menuBtn').onclick = function () { $('#navlinks').classList.toggle('show'); };
    $$('#navlinks a').forEach(function (a) { a.onclick = function () { $('#navlinks').classList.remove('show'); }; });
  }
  function head(kicker, h, sub) { return '<div class="sec-kicker">' + esc(kicker) + '</div><h2 class="sec-h">' + h + '</h2>' + (sub ? '<p class="sec-sub">' + esc(sub) + '</p>' : ''); }
  function tags(refs) { return (refs || []).map(function (r) { return '<span class="taglink" data-code="' + esc(r) + '">' + esc(r) + '</span>'; }).join(''); }
  function bindTags(scope) { $$(scope + ' .taglink').forEach(function (tg) { tg.onclick = function () { gotoLibrary(tg.getAttribute('data-code')); }; }); }

  /* ---- OVERVIEW ---- */
  function renderOverview() {
    var s = D.stats;
    var stats = [['files', s.files], ['levels', s.levels], ['qp', s.qp], ['fr', s.fr], ['op', s.op]];
    $('#overview').innerHTML = '<div class="hero"><div class="wrap">'
      + '<span class="kicker"><span class="d"></span>' + esc(t('hero_kicker')) + '</span>'
      + '<h1>' + t('hero_h') + '</h1>'
      + '<p class="lead">' + esc(t('hero_p')) + '</p>'
      + '<div class="cta-row"><a class="btn primary" href="#how">' + esc(t('hero_cta')) + ' →</a>'
      + '<a class="btn ghost" href="#library">' + esc(t('nav_library')) + '</a></div>'
      + '<div class="stats reveal">' + stats.map(function (x) { return '<div class="stat"><div class="n">' + x[1] + '</div><div class="l">' + esc(t('stat_' + x[0])) + '</div></div>'; }).join('') + '</div>'
      + '</div></div>';
  }

  /* ---- HOW IT WORKS ---- */
  var PYR = [{ lv: 'QM', n: '1' }, { lv: 'QP', n: '2' }, { lv: 'WI', n: '3' }, { lv: 'FR', n: '4' }, { lv: 'REC', n: '5', extra: ['OP', 'SYS', 'EXT', 'CAL'] }];
  var flowSel = 0;
  function renderHow() {
    var lab = D.level_label;
    function levelHtml(p) {
      var levels = p.extra || [p.lv];
      var files = D.files.filter(function (f) { return levels.indexOf(f.level) >= 0; });
      var title = p.lv === 'REC' ? (lang === 'zh' ? '运营层 + 记录与证据' : 'Operations + records & evidence') : lab[p.lv][lang];
      return '<div class="level"><div class="head"><span class="badge">' + p.n + '</span><span class="t">' + esc(title) + '</span>'
        + '<span class="meta">' + files.length + ' ' + t('lib_count') + '</span><span class="chev">›</span></div>'
        + '<div class="body"><div class="inner">' + files.map(function (f) { return '<span class="taglink" data-code="' + f.code + '">' + esc(f.code) + '</span>'; }).join('') + '</div></div></div>';
    }
    var steps = D.flow.map(function (st, i) {
      return '<button class="fstep' + (i === flowSel ? ' on' : '') + '" data-i="' + i + '"><span class="nn">' + st.n + '</span>' + esc(lang === 'zh' ? st.zh : st.en) + '</button>';
    }).join('');
    $('#how').innerHTML = '<div class="wrap">' + head(t('nav_how'), t('how_t'), '')
      + '<div class="subh">' + esc(t('pyr_t')) + '</div><div class="subhint">' + esc(t('pyr_hint')) + '</div>'
      + '<div class="pyr">' + PYR.map(levelHtml).join('') + '</div>'
      + '<div class="subh">' + esc(t('flow_t')) + '</div><div class="subhint">' + esc(t('flow_hint')) + '</div>'
      + '<div class="flow">' + steps + '</div><div class="flow-detail" id="flowDetail"></div>'
      + '<div class="flow-note"><span class="d"></span>' + esc(t('flow_thread')) + '</div>'
      + '</div>';
    $$('#how .level .head').forEach(function (h) { h.onclick = function () { var lv = h.parentNode, b = $('.body', lv); var o = lv.classList.toggle('open'); b.style.maxHeight = o ? b.scrollHeight + 'px' : '0'; }; });
    $$('#how .fstep').forEach(function (b) { b.onclick = function () { flowSel = +b.getAttribute('data-i'); $$('#how .fstep').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); paintFlow(); }; });
    bindTags('#how'); paintFlow();
  }
  function paintFlow() {
    var st = D.flow[flowSel]; if (!st) return;
    $('#flowDetail').innerHTML = '<div class="ft">' + st.n + ' · ' + esc(lang === 'zh' ? st.zh : st.en) + '</div>'
      + '<span class="role">◷ ' + esc(lang === 'zh' ? st.role_zh : st.role_en) + '</span>'
      + '<div class="recs">' + tags(st.refs) + '</div>';
    bindTags('#flowDetail');
  }

  /* ---- ROLES + RACI + escalation + who-to ---- */
  function renderRoles() {
    var roles = D.roles.map(function (r) {
      return '<div class="role reveal"><h3>' + esc(lang === 'zh' ? r.zh : r.en) + '</h3><div class="du">' + esc(lang === 'zh' ? r.duties_zh : r.duties_en) + '</div><div class="refs">' + tags(r.refs) + '</div></div>';
    }).join('');
    var who = D.whoto.map(function (w) {
      return '<div class="who reveal"><div class="q">' + esc(lang === 'zh' ? w.zh : w.en) + '</div><div class="to">→ ' + esc(lang === 'zh' ? w.to_zh : w.to_en) + '</div><div class="refs">' + tags(w.refs) + '</div></div>';
    }).join('');
    var escc = D.escalation.map(function (e) {
      return '<div class="esc-card reveal"><div class="q">' + esc(lang === 'zh' ? e.zh : e.en) + '</div><div class="a">' + esc(lang === 'zh' ? e.path_zh : e.path_en) + '</div><div class="refs">' + tags(e.refs) + '</div></div>';
    }).join('');
    $('#roles').innerHTML = '<div class="wrap">' + head(t('nav_roles'), t('roles_t'), t('roles_sub'))
      + '<div class="role-grid" style="margin-top:18px">' + roles + '</div>'
      + '<div class="subh">' + esc(t('whoto_t')) + '</div><div class="who-grid">' + who + '</div>'
      + '<div class="subh">' + esc(t('esc_t')) + '</div><div class="esc-grid">' + escc + '</div>'
      + '<div class="subh">' + esc(t('raci_t')) + '</div><div class="subhint">' + esc(t('raci_sub')) + '</div>'
      + raciHtml() + '</div>';
    bindTags('#roles');
  }
  function raciHtml() {
    var legend = [['rc-ar', 'A', t('raci_A')], ['rc-r', 'R', t('raci_R')], ['rc-c', 'C', t('raci_C')], ['rc-i', 'I', t('raci_I')]]
      .map(function (x) { return '<span class="rl"><span class="sw ' + x[0] + '">' + x[1] + '</span>' + esc(x[2]) + '</span>'; }).join('');
    var th = '<th class="l">' + esc(t('raci_stage')) + '</th><th class="l">' + esc(t('raci_rec')) + '</th>'
      + D.raci.roles.map(function (r) { return '<th>' + esc(lang === 'zh' ? r.zh : r.en) + '</th>'; }).join('');
    var cls = { 'A·R': 'ar', 'A': 'a', 'R': 'r', 'C': 'c', 'I': 'i' };
    var rows = D.raci.rows.map(function (row, i) {
      var cells = row.raci.map(function (c) { return '<td>' + (c ? '<span class="rc rc-' + cls[c] + '">' + esc(c.replace('·', '')) + '</span>' : '') + '</td>'; }).join('');
      return '<tr><td class="l"><span class="num">' + (i + 1) + '</span> <span class="stage">' + esc(lang === 'zh' ? row.zh : row.en) + '</span></td><td class="l"><span class="rec">' + esc(row.rec) + '</span></td>' + cells + '</tr>';
    }).join('');
    return '<div class="raci-legend">' + legend + '</div><div class="raci-wrap"><table class="raci"><thead><tr>' + th + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  /* ---- SYSTEM MAP: tabs (explorer + 2 embedded interactive mind-maps) ---- */
  var sxSel = 0, smTab = 'x';
  function renderSysmap() {
    var tabs = [['x', t('sysmap_tab_x')], ['s', t('sysmap_tab_s')], ['p', t('sysmap_tab_p')]]
      .map(function (a) { return '<button class="smtab' + (smTab === a[0] ? ' on' : '') + '" data-m="' + a[0] + '">' + esc(a[1]) + '</button>'; }).join('');
    var body;
    if (smTab === 'x') {
      var list = D.system_map.map(function (th, i) {
        return '<div class="sx-item' + (i === sxSel ? ' on' : '') + '" data-i="' + i + '"><span class="dot" style="background:' + th.color + '"></span><span class="t">' + esc(lang === 'zh' ? th.zh : th.en) + '</span><span class="nx">→</span></div>';
      }).join('');
      body = '<div class="sx"><div class="sx-list">' + list + '</div><div class="sx-panel" id="sxPanel"></div></div>';
    } else {
      body = '<div class="map-frame"><iframe id="mapFrame" title="mind-map" loading="lazy"></iframe></div><div class="map-hint">' + esc(t('map_hint')) + '</div>';
    }
    $('#sysmap').innerHTML = '<div class="wrap">' + head(t('nav_sysmap'), t('sysmap_t'), t('sysmap_sub'))
      + '<div class="smtabs">' + tabs + '</div>' + body + '</div>';
    $$('#sysmap .smtab').forEach(function (b) { b.onclick = function () { smTab = b.getAttribute('data-m'); renderSysmap(); }; });
    if (smTab === 'x') {
      $$('#sysmap .sx-item').forEach(function (it) { it.onclick = function () { sxSel = +it.getAttribute('data-i'); renderSysmap(); }; });
      paintSx();
    } else {
      $('#mapFrame').srcdoc = smTab === 's' ? D.maps.system_html : D.maps.process_html;
    }
  }
  function paintSx() {
    var th = D.system_map[sxSel]; if (!th) return;
    var items = th.items.map(function (it) {
      return '<div class="sx-row"><span class="bar" style="background:' + th.color + '"></span><div><div class="it">' + esc(lang === 'zh' ? it.zh : it.en) + '</div>'
        + (it.refs && it.refs.length ? '<div class="rf">' + tags(it.refs) + '</div>' : '') + '</div></div>';
    }).join('');
    $('#sxPanel').innerHTML = '<h3>' + esc(lang === 'zh' ? th.zh : th.en) + '</h3><div class="pd">' + esc(lang === 'zh' ? th.desc_zh : th.desc_en) + '</div>'
      + '<div class="items">' + items + '</div>'
      + '<div class="tolib" id="sxGo">' + esc(t('sysmap_lib')) + '</div>';
    bindTags('#sxPanel');
    $('#sxGo').onclick = function () { location.hash = '#library'; };
  }

  /* ---- ABOUT (trimmed: no approval authority) ---- */
  function renderAbout() {
    var m = D.meta;
    var items = [
      [t('about_entity'), (lang === 'zh' ? m.entity_zh : m.entity_en) + ' · ' + m.office],
      [t('about_plans'), m.qp_factory + ' (' + (lang === 'zh' ? '工厂' : 'factory') + ') · ' + m.qp_office + ' (' + (lang === 'zh' ? '办公室' : 'office') + ')'],
      [t('about_rev'), m.revision + ' · ' + m.effective],
      [t('about_scope'), t('about_scope_v')]
    ];
    $('#about').innerHTML = '<div class="wrap">' + head(t('nav_about'), t('about_t'), '')
      + '<div class="about-grid" style="margin-top:16px">' + items.map(function (x) { return '<div class="about-item"><div class="k">' + esc(x[0]) + '</div><div class="v">' + esc(x[1]) + '</div></div>'; }).join('') + '</div>'
      + '<div class="conf"><div class="ct">🔒 ' + esc(t('about_conf_t')) + '</div><div class="muted" style="margin-top:6px;font-size:13.5px">' + esc(t('about_conf_p')) + '</div>'
      + '<ul>' + D.excluded.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>'
      + '<div class="note">' + esc(t('about_conf_note')) + '</div></div></div>';
  }

  /* ---- LIBRARY (4 multi-select filter dimensions; [] = all) ---- */
  var libState = { level: [], site: [], type: [], area: [], q: '' };
  function uniq(a) { var s = []; a.forEach(function (x) { if (s.indexOf(x) < 0) s.push(x); }); return s; }
  function onSel(arr, v) { return v === 'all' ? arr.length === 0 : arr.indexOf(v) >= 0; }
  function inSel(arr, v) { return arr.length === 0 || arr.indexOf(v) >= 0; }
  function renderLibrary() {
    var levels = ['all', 'QM', 'QP', 'WI', 'FR', 'OP', 'SYS', 'CAL'];
    var lvName = { all: t('lib_all'), QM: 'QM', QP: 'QP', WI: 'WI', FR: 'FR', OP: 'OP', SYS: 'SYS·ZD', CAL: 'CAL' };
    var sites = [['all', t('lib_all')], ['factory', t('lib_site_factory')], ['office', t('lib_site_office')], ['both', t('lib_site_both')]];
    var types = ['all'].concat(uniq(D.files.map(function (f) { return f.ext; })));
    var areas = ['all'].concat(uniq(D.files.map(function (f) { return f.area; }).filter(Boolean)));
    function chips(group, opts, arr, nameFn) {
      return '<div class="fgroup"><span class="flabel">' + esc(group) + '</span>' + opts.map(function (o) {
        var v = Array.isArray(o) ? o[0] : o, label = Array.isArray(o) ? o[1] : nameFn(o);
        return '<span class="chip' + (onSel(arr, v) ? ' on' : '') + '" data-g="' + esc(group) + '" data-v="' + esc(v) + '">' + esc(label) + '</span>';
      }).join('') + '</div>';
    }
    $('#library').innerHTML = '<div class="wrap">' + head(t('nav_library'), t('lib_t'), t('lib_sub'))
      + '<div class="filters"><div class="row"><div class="search"><span class="ic">⌕</span><input id="libSearch" placeholder="' + esc(t('lib_search')) + '" value="' + esc(libState.q) + '"></div></div>'
      + '<div class="row">' + chips(t('lib_f_level'), levels.map(function (l) { return [l, lvName[l]]; }), libState.level) + '</div>'
      + '<div class="row">' + chips(t('lib_f_site'), sites, libState.site)
      + chips(t('lib_f_type'), types, libState.type, function (x) { return x === 'all' ? t('lib_all') : x.toUpperCase(); }) + '</div>'
      + (areas.length > 1 ? '<div class="row">' + chips(t('lib_f_area'), areas, libState.area, function (x) { return x === 'all' ? t('lib_all') : (D.areas[x] ? D.areas[x].split('_')[1].split(' ')[0] : x); }) + '</div>' : '')
      + '</div>'
      + '<div class="lib-meta"><span class="lib-count" id="libCount"></span><span class="lib-clear" id="libClear">' + esc(t('lib_clear')) + '</span></div>'
      + '<div class="card-grid" id="cards"></div></div>';
    $('#libSearch').oninput = function () { libState.q = this.value; paintCards(); };
    $$('#library .chip').forEach(function (c) {
      c.onclick = function () {
        var k = keyOf(c.getAttribute('data-g')), v = c.getAttribute('data-v');
        if (v === 'all') { libState[k] = []; }
        else { var a = libState[k], i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); }
        renderLibrary();
      };
    });
    $('#libClear').onclick = function () { libState = { level: [], site: [], type: [], area: [], q: '' }; renderLibrary(); };
    paintCards();
  }
  function keyOf(group) { var m = {}; m[t('lib_f_level')] = 'level'; m[t('lib_f_site')] = 'site'; m[t('lib_f_type')] = 'type'; m[t('lib_f_area')] = 'area'; return m[group]; }
  function paintCards() {
    var q = libState.q.trim().toLowerCase();
    var list = D.files.filter(function (f) {
      if (!inSel(libState.level, f.level)) return false;
      if (!inSel(libState.site, f.site)) return false;
      if (!inSel(libState.type, f.ext)) return false;
      if (!inSel(libState.area, f.area)) return false;
      if (q && (f.code + ' ' + f.zh + ' ' + f.en).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    $('#libCount').textContent = list.length + ' ' + t('lib_count');
    var grid = $('#cards');
    if (!list.length) { grid.innerHTML = '<div class="empty">' + esc(t('lib_none')) + '</div>'; return; }
    grid.innerHTML = list.map(function (f) {
      var fields = f.fields || [];
      var fhtml = fields.length ? '<div class="fields"><div class="fl">' + esc(t('lib_fields')) + '</div><div class="fwrap">'
        + fields.slice(0, 6).map(function (x) { var parts = x.split(' / '); return '<span class="fld">' + esc(lang === 'zh' ? parts[0] : (parts[1] || parts[0])) + '</span>'; }).join('')
        + (fields.length > 6 ? '<span class="more">+' + (fields.length - 6) + '</span>' : '') + '</div></div>' : '';
      var dl = (D.meta.downloads && f.dl) ? '<a class="dl" href="' + f.dl + '" download>↓ ' + esc(t('lib_download')) + ' · ' + f.ext.toUpperCase() + '</a>'
        : (D.meta.downloads ? '<span class="dl none">—</span>' : '<span class="ext-only">' + f.ext.toUpperCase() + '</span>');
      return '<div class="card reveal" id="c-' + f.code + '"><div class="top"><span class="code">' + esc(f.code) + '</span><span class="lvl">' + esc(D.level_label[f.level] ? D.level_label[f.level][lang] : f.level) + '</span></div>'
        + '<h3>' + esc(lang === 'zh' ? f.zh : (f.en || f.zh)) + '</h3><div class="ten">' + esc(lang === 'zh' ? (f.en || '') : f.zh) + '</div>'
        + '<div class="pp">' + esc(bi(f.purpose)) + '</div>' + fhtml + dl + '</div>';
    }).join('');
    revealObserve();
  }
  function gotoLibrary(code) {
    libState = { level: [], site: [], type: [], area: [], q: code };
    renderLibrary(); location.hash = '#library';
    setTimeout(function () { var c = $('#c-' + code); if (c) { c.scrollIntoView({ block: 'center' }); c.style.outline = '2px solid var(--ink)'; setTimeout(function () { c.style.outline = ''; }, 1500); } }, 130);
  }

  /* ---- CROSSWALK (more columns + search) ---- */
  var cwQ = '';
  function renderCrosswalk() {
    $('#crosswalk').innerHTML = '<div class="wrap">' + head(t('nav_crosswalk'), t('cw_t'), t('cw_sub'))
      + '<div class="cw-bar"><div class="search" style="max-width:380px"><span class="ic">⌕</span><input id="cwSearch" placeholder="' + esc(t('cw_search')) + '" value="' + esc(cwQ) + '"></div></div>'
      + '<div class="cw"><table><thead><tr>'
      + ['cw_clause', 'cw_title', 'cw_qp', 'cw_wi', 'cw_fr', 'cw_level'].map(function (k) { return '<th>' + esc(t(k)) + '</th>'; }).join('')
      + '</tr></thead><tbody id="cwBody"></tbody></table></div></div>';
    $('#cwSearch').oninput = function () { cwQ = this.value; paintCw(); };
    paintCw();
  }
  function paintCw() {
    var q = cwQ.trim().toLowerCase();
    var rows = D.crosswalk.filter(function (r) { return !q || (r.clause + ' ' + r.zh + ' ' + r.en).toLowerCase().indexOf(q) >= 0; });
    $('#cwBody').innerHTML = rows.map(function (r) {
      return '<tr><td class="cl">' + esc(r.clause) + '</td><td>' + esc(lang === 'zh' ? r.zh : (r.en || r.zh)) + '</td>'
        + '<td class="mono">' + esc(r.qp) + '</td><td class="mono">' + esc(r.wi) + '</td><td class="mono">' + esc(r.fr) + '</td><td class="lv">' + esc(r.level) + '</td></tr>';
    }).join('');
  }

  /* ---- shared ---- */
  var io;
  function revealObserve() {
    if (!('IntersectionObserver' in window)) { $$('.reveal').forEach(function (e) { e.classList.add('in'); }); return; }
    if (!io) io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: .12 });
    $$('.reveal:not(.in)').forEach(function (e) { io.observe(e); });
  }
  function spyNav() {
    var cur = '';
    NAVS.forEach(function (id) { var s = document.getElementById(id); if (s && s.getBoundingClientRect().top < 130) cur = id; });
    $$('#navlinks a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === cur); });
  }
  function renderAll() {
    renderNav(); renderOverview(); renderHow(); renderRoles(); renderSysmap(); renderAbout(); renderLibrary(); renderCrosswalk();
    var cr = D.meta.credit || {};
    $('#foot').innerHTML = esc(t('foot_by')) + ' · <strong>' + esc(cr.name || '') + '</strong> · '
      + esc(lang === 'zh' ? (cr.title_zh || '') : (cr.title_en || '')) + ' · '
      + '<a href="mailto:' + esc(cr.email || '') + '">' + esc(cr.email || '') + '</a>';
    revealObserve(); spyNav();
  }

  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.addEventListener('DOMContentLoaded', renderAll);
  window.addEventListener('scroll', function () { revealObserve(); spyNav(); }, { passive: true });
})();
