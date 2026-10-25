/* Prumo — Registro de sessão, modo Iniciar atendimento e rascunho automático */

V.sess = function () {
    let s = ui.sess;
    if (typeof s == 'string')
        s = S.sessions.find(x => x.id == s);
    if (!s)
        s = {
            id: 's' + Date.now(), pid: '', data: iso(new Date()), dor: 0, adm: null, relato: '', conduta: '', exe: '', plano: '', status: 'novo', add: []
        };
    ui.sess = s;
    const ro = s.status == 'finalizada', d = ro ? 'disabled' : '';
    return `<div class="row sp"><h2>Registro de sessão</h2>${s.status != 'novo' ? bdg(s.status) : ''}</div><div class="card"><div class="f2"><div><label for="s_pid">Paciente</label><select id="s_pid" ${d}><option value="">Selecione…</option>${popts(s.pid)}</select></div><div><label for="s_data">Data</label><input type="date" id="s_data" value="${s.data}" ${d}></div>
<div><label for="s_dor">Dor (EVA 0–10): <b id="dv">${s.dor}</b></label><input type="range" min="0" max="10" id="s_dor" value="${s.dor}" oninput="$('#dv').textContent=this.value" ${d}></div><div><label for="s_adm">ADM flexão do joelho (°) — opcional</label><input type="number" id="s_adm" min="0" max="180" value="${s.adm ?? ''}" ${d}></div></div>
<h3 style='margin-top:14px'>Mapa de dor</h3><p class='sm mut'>Toque (ou Tab + Enter) nas regiões com dor.</p><div id='bmapw'>${mapHTML(s, ro)}</div><div class="f2"><div><label for="s_for">Força muscular (0–5, Oxford) — opcional</label><input type="number" id="s_for" min="0" max="5" value="${s.forca ?? ''}" ${d}></div><div><label for="s_res">Resposta ao tratamento</label><select id="s_res" ${d}>${['', 'Boa', 'Parcial', 'Sem resposta', 'Piora'].map(o => `<option ${s.resp == o ? 'selected' : ''}>${o}</option>`).join('')}</select></div></div><label for="s_rel">Relato do paciente</label><textarea id="s_rel" ${d}>${esc(s.relato)}</textarea><label for="s_con">Condutas e técnicas</label><div class="row" id="chips" style="margin:4px 0 6px">${chipsH(ro)}</div><textarea id="s_con" ${d}>${esc(s.conduta)}</textarea><label for="s_exe">Exercícios (séries, repetições, carga)</label><textarea id="s_exe" ${d}>${esc(s.exe)}</textarea><label for="s_int">Intercorrências e medidas adotadas</label><textarea id="s_int" ${d}>${esc(s.inter)}</textarea><label for="s_ori">Orientações e exercícios domiciliares</label><textarea id="s_ori" ${d}>${esc(s.orient)}</textarea><label for="s_pla">Plano para a próxima sessão</label><textarea id="s_pla" ${d}>${esc(s.plano)}</textarea>
<div id="serr"></div><p id="astat" class="sm mut" role="status">Salvamento automático de rascunho ativo.</p><div class="row" style="margin-top:14px">${ro ? `<button class="btn" onclick="addendum()">+ Adendo auditável</button>` : `<button class="btn2" onclick="saveS(false)">Salvar rascunho</button><button class="btn" onclick="saveS(true)">Finalizar e assinar</button>`}</div></div>
${s.add.length ? `<div class="card"><h3>Histórico de adendos</h3>${s.add.map(a => `<div class="item"><span>${esc(a.txt)}</span><span class="sm mut">${esc(a.t)} · ${esc(a.por)}</span></div>`).join('')}</div>` : ''}`;
};

function newFor(pid) {
    ui.sess = {
        id: 's' + Date.now(), pid, data: iso(new Date()), dor: 0, adm: null, relato: '', conduta: '', exe: '', plano: '', status: 'novo', add: []
    };
    render();
}

function saveS(fin) {
    const s = ui.sess, g = i => $('#' + i).value;
    s.pid = g('s_pid');
    s.data = g('s_data');
    s.dor = +g('s_dor');
    s.adm = g('s_adm') === '' ? null : +g('s_adm');
    s.relato = g('s_rel');
    s.conduta = g('s_con');
    s.exe = g('s_exe');
    s.plano = g('s_pla');
    s.forca = g('s_for') === '' ? null : +g('s_for');
    s.resp = g('s_res');
    s.inter = g('s_int');
    s.orient = g('s_ori');
    if (!s.pid || !s.data) {
        $('#serr').innerHTML = '<div class="err">Selecione paciente e data.</div>';
        return;
    }
    if (fin && (!s.relato.trim() || !s.conduta.trim())) {
        $('#serr').innerHTML = '<div class="err">Para finalizar, preencha relato e condutas.</div>';
        return;
    }
    const done = () => {
        ui.dirty = false;
        s.por = S.prof.n || 'Profissional Demo';
        if (fin)
            logA('Finalizou sessão de ' + (pat(s.pid) || {}).nome);
        s.status = fin ? 'finalizada' : 'rascunho';
        if (fin)
            s.assin = new Date().toISOString();
        const i = S.sessions.findIndex(x => x.id == s.id);
        i < 0 ? S.sessions.push(s) : S.sessions[i] = s;
        if (s.apt) {
            const a = S.appts.find(x => x.id == s.apt);
            if (a && fin)
                a.status = 'presente';
        }
        save();
        toast(fin ? 'Sessão finalizada' : 'Rascunho salvo');
        ui.pid = s.pid;
        ui.tab = 'sessoes';
        go('pac', s.pid);
        ui.tab = 'sessoes';
        render();
    };
    fin ? ask('Finalizar e assinar? Depois disso o conteúdo original fica preservado e só poderá receber adendos.', done) : done();
}

function addendum() {
    modal(`<h3>Adendo (correção auditável)</h3><textarea id="ad_t" placeholder="Descreva a correção ou informação adicional"></textarea><div class="row" style="margin-top:12px"><button class="btn2" onclick="dlg().close()">Cancelar</button><button class="btn" id="adb">Registrar</button></div>`);
    $('#adb').onclick = () => {
        const t = $('#ad_t').value.trim();
        if (!t)
            return;
        ui.sess.add.push({
            txt: t, t: new Date().toLocaleString('pt-BR'), por: 'Profissional Demo'
        });
        save();
        dlg().close();
        toast('Adendo registrado');
        render();
    };
}

const chipsH = ro => S.tpl.map((t, i) => `<button type='button' class='btn2 s' onclick='addT(${i})' ${ro ? 'disabled' : ''}>+ ${esc(t)}</button>`).join('') + (ro ? '' : `<button type='button' class='btn s' onclick='newT()'>+ Novo modelo</button>`);

function addT(i) {
    const t = $('#s_con');
    t.value += (t.value ? '\n' : '') + S.tpl[i];
    t.focus();
}

function newT() {
    modal(`<h3>Novo modelo de conduta</h3><input id='t_n' aria-label='Texto do modelo'><div class='row' style='margin-top:12px'><button class='btn2' onclick='dlg().close()'>Cancelar</button><button class='btn' id='t_ok'>Salvar</button></div>`);
    $('#t_ok').onclick = () => {
        const v = $('#t_n').value.trim();
        if (!v)
            return;
        S.tpl.push(v);
        save();
        dlg().close();
        $('#chips').innerHTML = chipsH(false);
    };
}

function autoS() {
    clearTimeout(ui.at);
    const s = ui.sess, g = i => {
        const e = $('#' + i);
        return e ? e.value : '';
    };
    if (!s || s.status == 'finalizada' || !$('#s_pid') || !g('s_pid'))
        return;
    s.pid = g('s_pid');
    s.data = g('s_data');
    s.dor = +g('s_dor');
    s.adm = g('s_adm') === '' ? null : +g('s_adm');
    s.relato = g('s_rel');
    s.conduta = g('s_con');
    s.exe = g('s_exe');
    s.plano = g('s_pla');
    s.forca = g('s_for') === '' ? null : +g('s_for');
    s.resp = g('s_res');
    s.inter = g('s_int');
    s.orient = g('s_ori');
    if (s.status == 'novo')
        s.status = 'rascunho';
    const i = S.sessions.findIndex(x => x.id == s.id);
    if (i < 0)
        S.sessions.push(s);
    else
        S.sessions[i] = s;
    save();
    ui.dirty = false;
    const a = $('#astat');
    if (a)
        a.textContent = 'Rascunho salvo às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function goAt(id) {
    if (ui.dirty)
        autoS();
    ui.v = 'at';
    ui.pid = id;
    const d = S.sessions.filter(s => s.pid == id && s.status == 'rascunho').pop();
    if (d) {
        ui.sess = d;
        render();
    }
    else
        newFor(id);
}

function ctx(p) {
    const A = p.aval || {}, l = last(p.id), M = (p.metas || []).filter(m => m.s == 'em'), X = p.exer || [];
    return `${capa(p)}<div class="card"><h3>Plano</h3>${A.dx ? `<p><b>Diagnóstico:</b> ${esc(A.dx)}</p>` : ''}${A.trat ? `<p><b>Tratamento:</b> ${esc(A.trat)}</p>` : ''}${A.freq ? `<p><b>Frequência:</b> ${esc(A.freq)}</p>` : ''}${!A.dx && !A.trat ? '<p class="mut sm">Plano ainda não preenchido.</p>' : ''}</div><div class="card"><h3>Última sessão</h3>${l ? `<p class="sm mut">${br(l.data)} · dor ${l.dor}/10${l.adm != null ? ' · ADM ' + l.adm + '°' : ''}</p><p><b>Condutas:</b> ${esc(l.conduta)}</p><p><b>Plano para hoje:</b> ${esc(l.plano || '—')}</p>` : '<p class="mut sm">Primeiro atendimento.</p>'}</div><div class="card"><h3>Metas em andamento</h3>${M.map(m => `<div class="item"><span>${esc(m.x)}</span><span class="sm mut">${m.d ? br(m.d) : ''}</span></div>`).join('') || '<p class="mut sm">Sem metas em andamento.</p>'}</div><div class="card"><h3>Exercícios domiciliares</h3>${X.map(x => `<div class="item"><span>${esc(x.n)}</span><span class="sm mut">${x.s || '—'}×${x.r || '—'}</span></div>`).join('') || '<p class="mut sm">Nenhum.</p>'}</div>`;
}

V.at = () => {
    const p = pat(ui.pid);
    if (!p || !ui.sess)
        return emptyH('Escolha um paciente para iniciar o atendimento.', "<button class='btn' onclick=\"go('pac')\">Abrir pacientes</button>");
    return `<button class='btn2 s' onclick="go('pac','${p.id}')">‹ Prontuário</button><div class='at' style='margin-top:12px'><aside aria-label='Contexto do paciente'>${ctx(p)}</aside><section>${V.sess()}</section></div>`;
};
