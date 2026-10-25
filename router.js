/* Prumo — Navegação, desenho das telas, busca global e ajustes */

function go(v, x) {
    if (ui.dirty)
        autoS();
    if (v == 'pac' && x)
        logA('Abriu prontuário de ' + (pat(x) || {}).nome);
    if (ROLE() == 'recep' && ['sess', 'evo', 'cfg', 'at', 'lib', 'rel'].includes(v)) {
        toast('Acesso negado para o perfil Recepção (simulação)');
        return;
    }
    ui.v = v;
    if (v == 'pac') {
        ui.pid = x || null;
        ui.tab = 'resumo';
    }
    if (v == 'sess')
        ui.sess = x || null;
    if (v == 'rec')
        ui.rid = x;
    render();
}

function render() {
    $('#nav').innerHTML = '<h1 class="brand">' + LOGO + '<span>Prumo<small>Fisioterapia</small></span></h1>' + navL().map((n, i, a) => (i == 0 || NG[n[0]] != NG[a[i - 1][0]] ? `<span class="ng">${NG[n[0]]}</span>` : '') + `<button class="${ui.v == n[0] ? 'on' : ''}" onclick="go('${n[0]}')" ${ui.v == n[0] ? 'aria-current="page"' : ''}>${ic(n[0])}${n[2]}</button>`).join('');
    const sg = ui.v + '|' + ui.pid + '|' + ui.tab + '|' + (ui.sess && ui.sess.id || '');
    ui.anim = sg != ui.sg;
    ui.sg = sg;
    $('#main').classList.toggle('anim', ui.anim);
    const sy = scrollY;
    $('#main').innerHTML = TOP() + '<div class="demo">Prumo — protótipo DEMO · dados sintéticos salvos só neste navegador · sem persistência multiusuário</div>' + V[ui.v]();
    if (ui.v == 'pac' && !ui.pid)
        listP();
    if (ui.anim) {
        scrollTo(0, 0);
        cnt();
        $('#main').focus({ preventScroll: true });
    }
    else
        scrollTo(0, sy);
}

const V = {};

const navL = () => NAV.filter(n => !(ROLE() == 'recep' && ['sess', 'evo', 'cfg', 'at', 'lib', 'rel'].includes(n[0]))).concat(ROLE() == 'admin' ? [['usr', '⚙', 'Usuários']] : []);

const TOP = () => `<div class="top"><div class="sbox" role="search"><input id="gq" type="search" placeholder="Buscar paciente, sessão ou data  ( / )" aria-label="Busca global" autocomplete="off" oninput="doS2(this.value)" onkeydown="if(event.key==='Escape'){this.value='';$('#gr').hidden=true}else if(event.key==='Enter'){const b=$('#gr .gi');b&&b.click()}"><div id="gr" class="gr" aria-live="polite" hidden></div></div><button class="btn2" onclick="adj()" aria-haspopup="dialog">${ic('set')}Ajustes</button></div>`;

function srch() {
    const e = $('#gq');
    if (e) {
        e.focus();
        e.select();
    }
}

function doS2(q) {
    const g = $('#gr');
    q = q.toLowerCase().trim();
    if (!q) {
        g.hidden = true;
        return;
    }
    const P = S.patients.filter(p => (p.nome + p.tel + p.queixa).toLowerCase().includes(q)).slice(0, 5), X = S.sessions.filter(s => (br(s.data) + s.data + s.relato + s.conduta + (pat(s.pid)?.nome || '')).toLowerCase().includes(q)).slice(0, 5);
    g.hidden = false;
    g.innerHTML = (P.length ? '<b class="gl">Pacientes</b>' + P.map(p => `<button class="gi" onclick="go('pac','${p.id}')"><span>${ic('pac')} ${esc(p.nome)}</span><small>${esc(p.queixa)}</small></button>`).join('') : '') + (X.length ? '<b class="gl">Sessões</b>' + X.map(s => `<button class="gi" onclick="go('sess','${s.id}')"><span>${ic('sess')} ${br(s.data)} · ${pn(s.pid)}</span><small>${esc(s.status)}</small></button>`).join('') : '') || '<p class="mut sm" style="padding:8px">Nada encontrado.</p>';
}

function adjH() {
    const seg = (l, o, c, f) => `<div class="sg"><span class="sm mut">${l}</span><div class="row" role="group" aria-label="${l}">${o.map(x => `<button class="btn${c == x[0] ? '' : '2'} s" aria-pressed="${c == x[0]}" onclick="${f}('${x[0]}')">${x[1]}</button>`).join('')}</div></div>`;
    return `<h3>Ajustes</h3>${seg('Tema', [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']], PREF.t, 'setT')}${seg('Contraste', [['0', 'Normal'], ['1', 'Alto']], PREF.c ? '1' : '0', 'setC')}${seg('Tamanho da letra (' + (PREF.fs || 16) + ' px)', [['-1', 'A−'], ['1', 'A+']], '', 'setF')}${seg('Densidade', [['0', 'Confortável'], ['1', 'Compacta']], PREF.dn ? '1' : '0', 'setD')}${seg('Perfil (simulação)', Object.keys(ROLES).map(k => [k, ROLES[k]]), ROLE(), 'setR')}<div class="sg"><span class="sm mut">Dados</span><div class="row"><button class="btn2 s" onclick="expAll()">Exportar backup</button><button class="btn2 s" onclick="impJ()">Importar backup</button></div></div><p class="sm mut">Atalhos: <kbd>/</kbd> buscar · <kbd>i</kbd> início · <kbd>p</kbd> pacientes · <kbd>a</kbd> agenda · <kbd>n</kbd> nova sessão · <kbd>e</kbd> evolução</p><div class="row"><button class="btn" onclick="dlg().close()">Fechar</button></div>`;
}

function adj() {
    modal(adjH());
}

const adjR = () => {
    dlg().innerHTML = adjH();
};

function setT(v) {
    PREF.t = v;
    applyPref();
    adjR();
}

function setC(v) {
    PREF.c = v == '1';
    applyPref();
    adjR();
}

function setF(v) {
    tgFs(+v);
    adjR();
}

function setR(v) {
    PREF.role = v;
    ui.tab = 'resumo';
    if ((['sess', 'evo', 'cfg', 'at', 'lib', 'rel'].includes(ui.v) && v == 'recep') || (ui.v == 'usr' && v != 'admin'))
        ui.v = 'dash';
    applyPref();
    render();
    adjR();
}

function setD(v) {
    PREF.dn = v == '1';
    applyPref();
    adjR();
}
