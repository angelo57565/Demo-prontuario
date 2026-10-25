/* Prumo — Biblioteca, relatórios gerais, financeiro, usuários, configurações e backup */

V.usr = () => {
    const M = [['Agenda e cadastro', '✓', '✓', '✓'], ['Prontuário clínico', '✓', '✓', '✕'], ['Sessões e evolução', '✓', '✓', '✕'], ['Relatórios e documentos', '✓', '✓', '✕'], ['Biblioteca e relatórios gerais', '✓', '✓', '✕'], ['Financeiro', '✓', '✓', '✓'], ['Usuários e permissões', '✓', '✕', '✕']];
    return `<h2>Usuários e permissões</h2><div class='card'><p class='sm mut'>Ilustração visual: o controle de acesso real exige servidor (login, RLS e logs).</p><div class='tw'><table style='width:100%;border-collapse:collapse;min-width:420px'><tr><th>Recurso</th><th>Administrador</th><th>Fisioterapeuta</th><th>Recepção</th></tr>${M.map(r => `<tr>${r.map(c => `<td>${c == '✓' ? '✓ Permitido' : c == '✕' ? '✕ Bloqueado' : c}</td>`).join('')}</tr>`).join('')}</table></div></div><div class='card'><h3>Registro de acessos (local, ilustrativo)</h3>${(S.log || []).slice(-30).reverse().map(l => `<div class='item'><span>${esc(l.a)}</span><span class='sm mut'>${esc(l.u)} · ${new Date(l.t).toLocaleString('pt-BR')}</span></div>`).join('') || emptyH('Sem registros.')}</div>`;
};

function showJ(t, o) {
    modal(`<h3>${t}</h3><textarea id='jx' readonly style='min-height:200px;font:12px monospace'>${esc(JSON.stringify(o, null, 1))}</textarea><div class='row' style='margin-top:12px'><button class='btn' onclick='cpJ()'>Copiar</button><button class='btn2' onclick='dlg().close()'>Fechar</button></div>`);
}

function cpJ() {
    const t = $('#jx');
    t.select();
    try {
        navigator.clipboard.writeText(t.value).then(() => toast('Copiado'), () => {
            document.execCommand('copy');
            toast('Copiado');
        });
    }
    catch (e) {
        document.execCommand('copy');
        toast('Selecionado: use Ctrl+C');
    }
}

function expAll() {
    logA('Exportou backup completo');
    save();
    showJ('Backup completo (copie e guarde)', S);
}

function expP(id) {
    const p = pat(id);
    logA('Exportou dados de ' + p.nome);
    save();
    showJ('Dados do paciente', {
        paciente: p, sessoes: S.sessions.filter(s => s.pid == id), agenda: S.appts.filter(a => a.pid == id)
    });
}

function impJ() {
    modal(`<h3>Importar backup</h3><p class='sm mut'>Escolha o arquivo .json ou cole o conteúdo. Isso substitui os dados atuais.</p><input id='im_f' type='file' accept='.json,application/json'><textarea id='im_t' placeholder='Ou cole o JSON aqui' style='margin-top:10px'></textarea><div id='im_e'></div><div class='row' style='margin-top:12px'><button class='btn2' onclick='dlg().close()'>Cancelar</button><button class='btn' onclick='doImp()'>Importar</button></div>`);
}

async function doImp() {
    let tx = $('#im_t').value.trim();
    const f = $('#im_f').files[0];
    if (f)
        tx = await f.text();
    try {
        const o = JSON.parse(tx);
        if (!o.patients || !o.sessions || !o.appts)
            throw 0;
        S = o;
        S.espera = S.espera || [];
        S.log = S.log || [];
        S.lib = S.lib || [];
        S.tpl = S.tpl || [];
        S.prof = S.prof || {
            n: '', c: '', cl: ''
        };
        S.cfg = S.cfg || {
            ini: '07:00', fim: '19:00', dur: 30
        };
        logA('Importou backup');
        save();
        dlg().close();
        toast('Backup importado');
        go('dash');
    }
    catch (e) {
        $('#im_e').innerHTML = "<div class='err'>JSON inválido: não parece um backup do Prumo.</div>";
    }
}

function cfgS(k, v) {
    S.prof[k] = v;
    save();
    toast('Salvo');
}

function cfgC(k, v) {
    S.cfg[k] = v;
    save();
    toast('Salvo');
}

function cfgLogo(f) {
    if (f)
        imgRead(f, d => {
            S.prof.logo = d;
            save();
            render();
        }, 240);
}

function cfgT() {
    const v = $('#c_t').value.trim();
    if (!v)
        return;
    S.tpl.push(v);
    save();
    render();
}

V.cfg = () => {
    const P = S.prof, C = S.cfg;
    return `<h2>Configurações</h2><div class='card'><h3>Clínica e profissional</h3><div class='f2'><div><label for='c_cl'>Nome da clínica ou consultório</label><input id='c_cl' value='${esc(P.cl)}' onchange="cfgS('cl',this.value)"></div><div><label for='c_n'>Fisioterapeuta responsável</label><input id='c_n' value='${esc(P.n)}' onchange="cfgS('n',this.value)"></div><div><label for='c_c'>CREFITO</label><input id='c_c' value='${esc(P.c)}' onchange="cfgS('c',this.value)"></div><div><label for='c_lg'>Logo (imagem)</label><input id='c_lg' type='file' accept='image/*' onchange="cfgLogo(this.files[0])"></div></div>${P.logo ? `<div class='row' style='margin-top:10px'><img src='${P.logo}' alt='Logo da clínica' style='height:56px;border-radius:8px'><button class='btn2 s' onclick="cfgS('logo','');render()">Remover logo</button></div>` : ''}<p class='sm mut'>Estes dados aparecem no cabeçalho dos relatórios.</p></div><div class='card'><h3>Agenda</h3><div class='f2'><div><label for='c_i'>Início do expediente</label><input id='c_i' type='time' value='${C.ini}' onchange="cfgC('ini',this.value)"></div><div><label for='c_f'>Fim do expediente</label><input id='c_f' type='time' value='${C.fim}' onchange="cfgC('fim',this.value)"></div><div><label for='c_d'>Intervalo da visão diária (min)</label><select id='c_d' onchange="cfgC('dur',+this.value)">${[15, 30, 45, 50, 60].map(m => `<option ${C.dur == m ? 'selected' : ''}>${m}</option>`).join('')}</select></div></div></div><div class='card'><h3>Modelos de conduta</h3><div class='row'><input id='c_t' placeholder='Novo modelo' aria-label='Novo modelo' style='flex:1'><button class='btn' onclick='cfgT()'>Adicionar</button></div>${S.tpl.map((t, i) => `<div class='item'><span>${esc(t)}</span><button class='btn2 s' onclick="undo(S.tpl,${i},'Modelo')">Remover</button></div>`).join('')}</div><div class='card'><h3>Dados</h3><div class='row'><button class='btn2' onclick='expAll()'>Exportar backup</button><button class='btn2' onclick='impJ()'>Importar backup</button></div></div>`;
};

V.lib = () => `<h2>Biblioteca de exercícios</h2><div class='card'><h3>Novo exercício</h3><label for='l_n'>Nome *</label><input id='l_n'><label for='l_d'>Descrição</label><textarea id='l_d'></textarea><label for='l_f'>Foto (opcional)</label><input id='l_f' type='file' accept='image/*'><div class='row' style='margin-top:12px'><button class='btn' onclick='addL()'>Salvar na biblioteca</button></div></div><div class='card'><h3>Exercícios (${S.lib.length})</h3>${S.lib.map((x, i) => `<div class='item'><div>${x.img ? `<img src='${x.img}' alt='' class='th'>` : ''}<b>${esc(x.n)}</b><br><span class='sm mut'>${esc(x.d)}</span></div><div class='row'><button class='btn2 s' onclick="prescM('${x.id}')">Prescrever</button><button class='btn2 s' onclick="undo(S.lib,${i},'Exercício')">Remover</button></div></div>`).join('') || emptyH('Biblioteca vazia.')}</div>`;

function prescM(id) {
    const x = S.lib.find(l => l.id == id);
    modal(`<h3>Prescrever: ${esc(x.n)}</h3><label for='pm_p'>Paciente</label><select id='pm_p'>${popts()}</select><div class='f2'><div><label for='pm_s'>Séries</label><input id='pm_s' type='number' min='1'></div><div><label for='pm_r'>Repetições</label><input id='pm_r' type='number' min='1'></div></div><div class='row' style='margin-top:14px'><button class='btn2' onclick='dlg().close()'>Cancelar</button><button class='btn' id='pm_ok'>Prescrever</button></div>`);
    $('#pm_ok').onclick = () => {
        const p = pat($('#pm_p').value);
        (p.exer = p.exer || []).push({
            n: x.n, d: x.d, img: x.img, s: $('#pm_s').value, r: $('#pm_r').value, c: ''
        });
        save();
        dlg().close();
        toast('Prescrito para ' + p.nome);
    };
}

V.rel = () => {
    const r = ui.rr || (ui.rr = { de: addD(-30), ate: addD(0) }), inR = d => d >= r.de && d <= r.ate, ss = S.sessions.filter(s => s.status == 'finalizada' && inR(s.data)), ap = S.appts.filter(a => inR(a.data)), n = k => ap.filter(a => a.status == k).length, pr = n('presente'), fa = n('falta'), tx = pr + fa ? Math.round(fa / (pr + fa) * 100) + '%' : '—', by = {};
    ss.forEach(s => {
        const k = s.por || 'Profissional Demo';
        by[k] = (by[k] || 0) + 1;
    });
    const pf = S.patients.map(p => {
        const A = ap.filter(a => a.pid == p.id), f = A.filter(a => a.status == 'falta').length;
        return [p.nome, A.filter(a => a.status == 'presente').length + f, f];
    }).filter(x => x[1]), inat = S.patients.filter(p => {
        const l = last(p.id);
        return !l || diff(l.data, iso(new Date())) >= 14;
    });
    return `<h2>Relatórios gerais</h2><div class='card'><div class='f2'><div><label for='r_de'>De</label><input id='r_de' type='date' value='${r.de}' onchange="ui.rr.de=this.value;render()"></div><div><label for='r_at'>Até</label><input id='r_at' type='date' value='${r.ate}' onchange="ui.rr.ate=this.value;render()"></div></div></div><div class='grid'><div class='card kpi'>Sessões finalizadas<b>${ss.length}</b></div><div class='card kpi'>Presenças<b>${pr}</b></div><div class='card kpi'>Faltas<b>${fa}</b></div><div class='card kpi'>Taxa de faltas<b>${tx}</b></div></div><div class='card'><h3>Sessões por fisioterapeuta</h3>${Object.keys(by).map(k => `<div class='item'><span>${esc(k)}</span><b>${by[k]}</b></div>`).join('') || emptyH('Sem sessões no período.')}</div><div class='card'><h3>Comparecimento por paciente</h3>${pf.map(x => `<div class='item'><span>${esc(x[0])}</span><span>${x[1] - x[2]} presenças · ${x[2]} faltas</span></div>`).join('') || emptyH('Sem atendimentos na agenda neste período.')}</div><div class='card'><h3>Sem sessão há 14 dias ou mais</h3>${inat.map(p => {
        const l = last(p.id);
        return `<div class='item'><span>${esc(p.nome)}</span><span class='sm mut'>${l ? 'última: ' + br(l.data) : 'sem sessões'}</span></div>`;
    }).join('') || emptyH('Nenhum paciente.')}</div>`;
};

V.fin = () => {
    const F = S.fin, m = iso(new Date()).slice(0, 7), rec = F.pg.filter(x => x.data.slice(0, 7) == m).reduce((a, x) => a + x.valor, 0), ses = S.sessions.filter(s => s.status == 'finalizada' && s.data.slice(0, 7) == m).length, prev = ses * F.valor;
    return `<h2>Financeiro</h2><p class='mut'>Controle simples de recebimentos. Os valores da demonstração são fictícios.</p><div class='grid'><div class='card kpi'>Previsto no mês<b>${brl(prev)}</b><span class='sm mut'>${ses} sessões × ${brl(F.valor)}</span></div><div class='card kpi'>Recebido no mês<b>${brl(rec)}</b></div><div class='card kpi'>A receber<b>${brl(Math.max(prev - rec, 0))}</b></div></div><div class='card'><h3>Novo recebimento</h3><div class='f2'><div><label for='f_p'>Paciente</label><select id='f_p'>${popts()}</select></div><div><label for='f_v'>Valor (R$)</label><input id='f_v' type='number' step='0.01' min='0' value='${F.valor}'></div><div><label for='f_d'>Data</label><input id='f_d' type='date' value='${iso(new Date())}'></div><div><label for='f_f'>Forma</label><select id='f_f'>${['Pix', 'Dinheiro', 'Cartão', 'Convênio'].map(o => `<option>${o}</option>`).join('')}</select></div></div><label for='f_o'>Referência (ex.: 4 sessões de outubro)</label><input id='f_o'><div class='row' style='margin-top:12px'><button class='btn' onclick='addPg()'>Lançar</button></div><label for='f_s' style='margin-top:14px'>Valor padrão da sessão (R$)</label><input id='f_s' type='number' step='0.01' min='0' value='${F.valor}' onchange="S.fin.valor=+this.value||0;save();render()"></div><div class='card'><h3>Recebimentos</h3>${F.pg.slice().reverse().map(x => `<div class='item'><div><b>${brl(x.valor)}</b> · ${pn(x.pid)}<br><span class='sm mut'>${br(x.data)} · ${esc(x.forma)}${x.ref ? ' · ' + esc(x.ref) : ''}</span></div><div class='row'><button class='btn2 s' onclick="go('rec','${x.id}')">Recibo</button><button class='btn2 s' onclick="undo(S.fin.pg,${F.pg.indexOf(x)},'Recebimento')">Remover</button></div></div>`).join('') || emptyH('Nenhum recebimento lançado.')}</div>`;
};

function addPg() {
    const g = i => $('#' + i).value, v = +g('f_v');
    if (!g('f_p') || !(v > 0)) {
        toast('Informe paciente e valor');
        return;
    }
    S.fin.pg.push({
        id: 'f' + Date.now(), pid: g('f_p'), valor: v, data: g('f_d'), forma: g('f_f'), ref: g('f_o')
    });
    logA('Lançou recebimento');
    save();
    render();
}

V.rec = () => {
    const x = S.fin.pg.find(y => y.id == ui.rid), p = x && pat(x.pid), P = S.prof;
    if (!x || !p)
        return emptyH('Recibo não encontrado.');
    return `<div class='noprint row' style='margin-bottom:12px'><button class='btn2 s' onclick="go('fin')">‹ Financeiro</button><button class='btn s' onclick='prt()'>Imprimir / salvar PDF</button></div><div class='card doc'>${letterhead(P)}<h2>Recibo</h2><p>Recebi de <b>${esc(p.nome)}</b> a quantia de <b>${brl(x.valor)}</b>${x.ref ? ', referente a ' + esc(x.ref) : ', referente a atendimentos de fisioterapia'}, paga em ${br(x.data)} via ${esc(x.forma)}.</p><div style='margin-top:48px'>_______________________________<br>${esc(P.n || 'Fisioterapeuta')} · CREFITO: ${esc(P.c || '__________')}</div><div class='lf sm mut'>Emitido em ${br(iso(new Date()))} · Documento sujeito à revisão do profissional</div></div>`;
};
