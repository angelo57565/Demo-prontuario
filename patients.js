/* Prumo — Pacientes e prontuário individual (capa, abas, linha do tempo, consentimento) */

V.pac = function () {
    if (ui.pid)
        return prontuario(pat(ui.pid));
    return `<div class="row sp"><h2>Pacientes</h2><button class="btn" onclick="pform()">+ Novo paciente</button></div><label for="q">Buscar por nome ou CPF</label><input id="q" value="${esc(ui.q)}" oninput="ui.q=this.value;listP()" placeholder="Digite para buscar"><div class="card" id="pl" style="margin-top:14px"></div>`;
};

function listP() {
    const q = ui.q.toLowerCase(), r = S.patients.filter(p => p.nome.toLowerCase().includes(q) || (p.cpf && p.cpf.replace(/\D/g, '').includes(q.replace(/\D/g, '') || '§')));
    $('#pl').innerHTML = r.map(p => `<div class="item"><div><b>${esc(p.nome)}</b> · ${idade(p.nasc)} anos<br><span class="sm mut">${esc(p.queixa)}</span></div><button class="btn2 s" onclick="go('pac','${p.id}')">Prontuário</button></div>`).join('') || emptyH('Nenhum paciente encontrado.', "<button class='btn' onclick='pform()'>+ Cadastrar paciente</button>");
}

function prontuario(p) {
    const ss = S.sessions.filter(s => s.pid == p.id).sort((a, b) => b.data.localeCompare(a.data)), T = [['resumo', 'Resumo'], ['aval', 'Avaliação'], ['plano', 'Plano'], ['metas', 'Metas'], ['sessoes', 'Sessões'], ['graf', 'Evolução'], ['comp', 'Reavaliação'], ['esc', 'Escalas'], ['exer', 'Exercícios'], ['anex', 'Anexos'], ['pct', 'Pacote'], ['docs', 'Relatórios'], ['hist', 'Histórico'], ['tl', 'Linha do tempo']].filter(t => ROLE() != 'recep' || ['resumo', 'pct'].includes(t[0]));
    let b = '';
    if (ui.tab == 'resumo')
        b = `<div class="card"><p><b>Nascimento:</b> ${br(p.nasc)} (${idade(p.nasc)} anos)<br><b>Telefone:</b> ${esc(p.tel || '—')}<br><b>CPF:</b> ${esc(p.cpf || '—')}</p><p><b>Queixa principal:</b> ${esc(p.queixa)}</p>${consH(p)}${p.alertas ? `<p class="badge warn">Alerta clínico: ${esc(p.alertas)}</p>` : ''}${(() => {
            const l = last(p.id);
            return ROLE() != 'recep' && l && l.dores && l.dores.length ? `<h3>Mapa de dor — última sessão (${br(l.data)})</h3><div id='bmapw'>${mapHTML(l, true)}</div>` : '';
        })()}<div class="row" style="margin-top:12px"><button class="btn" onclick="goAt('${p.id}')">Iniciar atendimento</button><button class="btn2" onclick="go('sess');ui.sess=null;newFor('${p.id}')">Só registrar sessão</button></div></div>`;
    if (ui.tab == 'sessoes')
        b = `<div class="card">${ss.map(s => `<div class="item"><div>${br(s.data)} · dor ${s.dor}/10${s.adm != null ? ' · ADM ' + s.adm + '°' : ''}${s.forca != null ? ' · Força ' + s.forca + '/5' : ''} ${bdg(s.status)}</div><button class="btn2 s" onclick="go('sess','${s.id}')">${s.status == 'finalizada' ? 'Ver' : 'Editar'}</button></div>`).join('') || emptyH('Nenhuma sessão ainda.', `<button class='btn' onclick="go('sess');ui.sess=null;newFor('${p.id}')">Nova sessão</button>`)}</div>`;
    const A = p.aval || {};
    if (ui.tab == 'metas')
        b = metasTab(p);
    if (ui.tab == 'comp')
        b = compTab(p);
    if (ui.tab == 'esc')
        b = escTab(p);
    if (ui.tab == 'exer')
        b = exerTab(p);
    if (ui.tab == 'pct')
        b = pacTab(p);
    if (ui.tab == 'docs')
        b = docsTab(p);
    if (ui.tab == 'anex')
        b = anexTab(p);
    if (ui.tab == 'tl')
        b = tlTab(p);
    if (ui.tab == 'aval')
        b = `<div class='card'><h3>Anamnese</h3>${fld(AF, A)}<h3 style='margin-top:18px'>Avaliação física</h3>${espSel(p)}${fld(ALLP.filter(f => ESP[p.esp || 'orto'][1].includes(f[0])), A)}<div class='row' style='margin-top:14px'><button class='btn' onclick="saveA('${p.id}','aval')">Salvar avaliação</button></div></div>`;
    if (ui.tab == 'plano')
        b = `<div class='card'><h3>Conclusão clínica e plano terapêutico</h3>${fld(PF, A)}${cifChips()}<div class='row' style='margin-top:14px'><button class='btn' onclick="saveA('${p.id}','plano')">Salvar plano</button></div></div>`;
    if (ui.tab == 'hist')
        b = `<div class='card'><h3>Histórico auditável</h3>${ss.flatMap(s => [s.status == 'finalizada' ? [s.assin || 'DEMO', 'Sessão de ' + br(s.data) + ' finalizada e assinada'] : null, ...s.add.map(a => [a.t, 'Adendo na sessão de ' + br(s.data) + ': ' + a.txt])]).filter(Boolean).map(x => `<div class='item'><span>${esc(x[1])}</span><span class='sm mut'>${esc(String(x[0]).replace('T', ' ').slice(0, 19))}</span></div>`).join('') || '<p class="mut">Sem eventos registrados.</p>'}</div>`;
    if (ui.tab == 'graf')
        b = `<div class="card">${chart(p.id, 'dor', addD(-365), addD(0))}</div><div class="card">${chart(p.id, 'adm', addD(-365), addD(0))}</div><div class="card">${chart(p.id, 'forca', addD(-365), addD(0))}</div>`;
    return `<button class="btn2 s" onclick="go('pac')">‹ Pacientes</button>${capa(p)}${tabsH(T)}${b}`;
}

function pform() {
    modal(`<h3>Novo paciente</h3><label for="n_n">Nome completo *</label><input id="n_n"><div class="f2"><div><label for="n_b">Nascimento *</label><input type="date" id="n_b" onchange="$('#n_i').textContent=idade(this.value)+' anos'"><span class="sm mut" id="n_i"></span></div><div><label for="n_c">CPF (opcional)</label><input id="n_c" inputmode="numeric"></div></div><label for="n_t">Telefone</label><input id="n_t"><label for="n_q">Queixa principal</label><input id="n_q"><label for="n_a">Alertas clínicos (alergias, comorbidades)</label><input id="n_a"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="n_k" style="width:auto"> Consentimento LGPD registrado *</label><div id="n_e"></div><div class="row" style="margin-top:14px"><button class="btn2" onclick="dlg().close()">Cancelar</button><button class="btn" onclick="addP()">Salvar</button></div>`);
}

function addP() {
    const g = i => $('#' + i).value.trim(), e = [], nome = g('n_n'), nasc = g('n_b'), cpf = g('n_c');
    if (nome.length < 3)
        e.push('Informe o nome completo.');
    if (!nasc || new Date(nasc) > new Date())
        e.push('Data de nascimento inválida.');
    if (cpf && !cpfOk(cpf))
        e.push('CPF inválido.');
    if (!$('#n_k').checked)
        e.push('Registre o consentimento do paciente.');
    if (S.patients.some(p => (cpf && p.cpf.replace(/\D/g, '') == cpf.replace(/\D/g, '')) || (p.nome.toLowerCase() == nome.toLowerCase() && p.nasc == nasc)))
        e.push('Paciente já cadastrado (CPF ou nome + nascimento).');
    if (e.length) {
        $('#n_e').innerHTML = '<div class="err">' + e.join('<br>') + '</div>';
        return;
    }
    S.patients.push({
        id: 'p' + Date.now(), nome, nasc, cpf, tel: g('n_t'), queixa: g('n_q'), alertas: g('n_a'), cons: {
            d: iso(new Date()), f: 'Prestação de assistência fisioterapêutica', rv: false
        }
    });
    logA('Cadastrou paciente ' + nome);
    save();
    dlg().close();
    toast('Paciente cadastrado');
    go('pac');
}

function pacTab(p) {
    const t = p.pac || 0, us = S.sessions.filter(s => s.pid == p.id && s.status == 'finalizada').length, A = S.appts.filter(a => a.pid == p.id), n = k => A.filter(a => a.status == k).length, pr = n('presente'), fa = n('falta');
    return `<div class='card'><h3>Pacote de sessões</h3><label for='k_t'>Total de sessões do pacote</label><input id='k_t' type='number' min='0' value='${t}' onchange="setPac('${p.id}',this.value)"><label for='k_r'>Lembrar reavaliação a cada (sessões)</label><input id='k_r' type='number' min='0' value='${p.rev || ''}' onchange="setRev('${p.id}',this.value)"><p>Usadas (finalizadas): <b>${us}</b> · Restantes: <b>${t ? Math.max(t - us, 0) : '—'}</b></p><div class='bar' role='progressbar' aria-label='Sessões usadas do pacote' aria-valuenow='${us}' aria-valuemin='0' aria-valuemax='${t}'><i style='width:${t ? Math.min(us / t * 100, 100) : 0}%'></i></div></div><div class='card'><h3>Comparecimento (agenda)</h3><p>Presenças: <b>${pr}</b> · Faltas: <b>${fa}</b> · Cancelamentos: <b>${n('cancelado')}</b> · Taxa de faltas: <b>${pr + fa ? Math.round(fa / (pr + fa) * 100) + '%' : '—'}</b></p></div>`;
}

function setPac(id, v) {
    pat(id).pac = +v;
    save();
    render();
}

function setRev(id, v) {
    pat(id).rev = +v || 0;
    save();
    toast('Lembrete salvo');
}

function tabsH(T) {
    const G = [['Geral', ['resumo', 'tl', 'hist']], ['Avaliação', ['aval', 'plano', 'metas', 'esc']], ['Atendimento', ['sessoes', 'exer', 'pct']], ['Acompanhamento', ['graf', 'comp']], ['Documentos', ['anex', 'docs']]];
    return `<div class="tg" role="tablist">${G.map(g => {
        const t = T.filter(x => g[1].includes(x[0]));
        return t.length ? `<div><span class="gl">${g[0]}</span><div class="tabs">${t.map(x => `<button role="tab" aria-selected="${ui.tab == x[0]}" class="${ui.tab == x[0] ? 'on' : ''}" onclick="ui.tab='${x[0]}';render()">${x[1]}</button>`).join('')}</div></div>` : '';
    }).join('')}</div>`;
}

function tlTab(p) {
    const E = [];
    S.sessions.filter(s => s.pid == p.id).forEach(s => E.push([s.data, '✎', 'Sessão ' + BD[s.status][1].toLowerCase() + ' · dor ' + s.dor + '/10']));
    (p.esc || []).forEach(e => E.push([e.d, '☰', SCL[e.k][0] + ': ' + Math.round(e.v * 10) / 10]));
    (p.anex || []).forEach(x => E.push([x.d, '⎙', x.t + ' · ' + x.n]));
    (p.metas || []).forEach(m => E.push([m.d || '', '◎', 'Meta ' + (m.t == 'curto' ? 'de curto' : 'de longo') + ' prazo (' + ST[m.s] + '): ' + m.x]));
    S.appts.filter(a => a.pid == p.id && a.status == 'falta').forEach(a => E.push([a.data, '✕', 'Falta']));
    if (p.lastRev)
        E.push([p.lastRev, '↻', 'Reavaliação marcada como feita']);
    E.sort((a, b) => b[0].localeCompare(a[0]));
    return `<div class='card tlr'><h3>Linha do tempo</h3>${E.map(e => `<div class='item'><span>${ic({
        '✎': 'sess', '☰': 'list', '⎙': 'clip', '◎': 'meta', '✕': 'x', '↻': 'rev'
    }[e[1]])} ${esc(e[2])}</span><span class='sm mut'>${e[0] ? br(e[0]) : 'sem data'}</span></div>`).join('') || emptyH('Nada registrado ainda.')}</div>`;
}

function consH(p) {
    const c = p.cons, ok = c && !c.rv;
    return `<p><b>Consentimento LGPD:</b> ${c ? (c.rv ? '✕ Revogado em ' + br(c.rv) : '✓ Registrado em ' + br(c.d) + ' · ' + esc(c.f)) : 'Não registrado'} <button class='btn2 s' onclick="${ok ? `revC('${p.id}')` : `regC('${p.id}')`}">${ok ? 'Revogar' : 'Registrar'}</button> <button class='btn2 s' onclick="expP('${p.id}')">Exportar dados</button></p>`;
}

function regC(id) {
    pat(id).cons = {
        d: iso(new Date()), f: 'Prestação de assistência fisioterapêutica', rv: false
    };
    logA('Registrou consentimento');
    save();
    render();
}

function revC(id) {
    ask('Revogar o consentimento deste paciente? A revogação fica registrada no prontuário.', () => {
        pat(id).cons.rv = iso(new Date());
        logA('Revogou consentimento');
        save();
        render();
    });
}

function capa(p) {
    const l = last(p.id), rc = ROLE() == 'recep', nx = S.appts.filter(a => a.pid == p.id && a.status == 'agendado' && a.data >= iso(new Date())).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))[0], ini = p.nome.replace(/\(.*?\)/g, '').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return `<div class="card capa"><div class="av" aria-hidden="true">${ini}</div><div class="ci"><h2>${esc(p.nome)}</h2><p class="mut sm">${idade(p.nasc)} anos · ${esc(p.queixa)}</p>${p.alertas ? `<p class="badge warn">Alerta clínico: ${esc(p.alertas)}</p>` : ''}</div><div class="kp"><div><span class="sm mut">Dor atual</span><b>${l && !rc ? l.dor + '/10' : '—'}</b></div><div><span class="sm mut">Última sessão</span><b>${l ? br(l.data).slice(0, 5) : '—'}</b></div><div><span class="sm mut">Próxima</span><b>${nx ? br(nx.data).slice(0, 5) + ' ' + nx.hora : '—'}</b></div></div></div>`;
}
