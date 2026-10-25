/* Prumo — Abas clínicas: avaliação, plano, metas, escalas, exercícios, anexos e relatórios */

const fld = (L, A) => L.map(f => `<label for="a_${f[0]}">${f[1]}</label><textarea id="a_${f[0]}">${esc(A[f[0]])}</textarea>`).join('');

function saveA(id, w) {
    const p = pat(id), L = w == 'aval' ? [...AF, ...ALLP] : PF;
    p.aval = p.aval || {};
    L.forEach(f => {
        const e = $('#a_' + f[0]);
        if (e)
            p.aval[f[0]] = e.value;
    });
    save();
    toast('Salvo no prontuário');
}

const espSel = p => `<label for='esp'>Modelo por especialidade</label><select id='esp' onchange="setEsp('${p.id}',this.value)">${Object.keys(ESP).map(k => `<option value='${k}' ${(p.esp || 'orto') == k ? 'selected' : ''}>${ESP[k][0]}</option>`).join('')}</select>`;

function setEsp(id, v) {
    saveA(id, 'aval');
    pat(id).esp = v;
    save();
    render();
}

function metasTab(p) {
    const M = p.metas || [];
    return `<div class='card'><h3>Nova meta</h3><div class='f2'><div><label for='m_t'>Prazo</label><select id='m_t'><option value='curto'>Curto prazo</option><option value='longo'>Longo prazo</option></select></div><div><label for='m_d'>Data alvo</label><input type='date' id='m_d'></div></div><label for='m_x'>Descrição *</label><input id='m_x'><div class='f2'><div><label for='m_i'>Indicador (para o gráfico)</label><select id='m_i'><option value=''>—</option>${Object.keys(IND).map(k => `<option value='${k}'>${IND[k]}</option>`).join('')}</select></div><div><label for='m_v'>Valor alvo</label><input type='number' step='any' id='m_v'></div></div><div class='row' style='margin-top:12px'><button class='btn' onclick="addM('${p.id}')">Adicionar meta</button></div></div><div class='card'><h3>Metas</h3>${M.map((m, i) => `<div class='item'><div><b>${m.t == 'curto' ? 'Curto' : 'Longo'} prazo</b> · ${esc(m.x)}<br><span class='sm mut'>até ${m.d ? br(m.d) : 'sem data'}${m.i ? ' · ' + IND[m.i] + ' alvo ' + m.v : ''}</span></div><select aria-label='Status da meta' style='width:auto' onchange="stM('${p.id}',${i},this.value)">${Object.keys(ST).map(k => `<option value='${k}' ${m.s == k ? 'selected' : ''}>${ST[k]}</option>`).join('')}</select></div>`).join('') || "<p class='mut'>Sem metas.</p>"}</div>`;
}

function addM(id) {
    const g = i => $('#' + i).value, x = g('m_x').trim();
    if (!x) {
        toast('Descreva a meta');
        return;
    }
    const p = pat(id);
    (p.metas = p.metas || []).push({
        t: g('m_t'), d: g('m_d'), x, i: g('m_i'), v: g('m_v') === '' ? null : +g('m_v'), s: 'em'
    });
    save();
    render();
}

function stM(id, i, v) {
    pat(id).metas[i].s = v;
    save();
    toast('Status atualizado');
}

function compTab(p) {
    const f = S.sessions.filter(s => s.pid == p.id && s.status == 'finalizada').sort((a, b) => a.data.localeCompare(b.data));
    if (f.length < 2)
        return "<div class='card'><p class='mut'>São necessárias ao menos 2 sessões finalizadas.</p></div>";
    const a = f[0], b = f.at(-1);
    const row = (n, x, y, low, u) => {
        if (x == null || y == null)
            return '';
        const d = Math.round((y - x) * 10) / 10, ar = d > 0 ? '▲' : d < 0 ? '▼' : '■', vd = d == 0 ? 'sem mudança' : ((d < 0) == low ? 'melhora' : 'piora');
        return `<tr><td>${n}</td><td>${Math.round(x * 10) / 10}${u}</td><td>${Math.round(y * 10) / 10}${u}</td><td style='border:2px solid var(--txt);font-weight:700'>${ar} ${d > 0 ? '+' : ''}${d}${u} · ${vd}</td></tr>`;
    };
    const T = (p.esc || []).reduce((m, e) => ((m[e.k] = m[e.k] || []).push(e), m), {});
    const rows = row('Dor (EVA)', a.dor, b.dor, true, '') + row('ADM flexão do joelho', a.adm, b.adm, false, '°') + row('Força (Oxford)', a.forca, b.forca, false, '') + Object.keys(T).filter(k => T[k].length > 1).map(k => row(SCL[k][0], T[k][0].v, T[k].at(-1).v, k != 'berg', '')).join('');
    return `<div class='card'><h3>Inicial (${br(a.data)}) × Atual (${br(b.data)})</h3><div class='tw'><table style='width:100%;border-collapse:collapse;min-width:480px'><tr><th>Indicador</th><th>Inicial</th><th>Atual</th><th>Diferença</th></tr>${rows}</table></div></div>${painCmp(a, b)}`;
}

function escTab(p) {
    const k = ui.esc || 'osw', c = SCL[k];
    return `<div class='card'><h3>Escalas padronizadas</h3><label for='e_s'>Escala</label><select id='e_s' onchange="ui.esc=this.value;render()">${Object.keys(SCL).map(x => `<option value='${x}' ${x == k ? 'selected' : ''}>${SCL[x][0]}</option>`).join('')}</select><p class='sm mut'>Pontos de corte são referências gerais. Use a versão validada para o português e confirme a interpretação clínica.</p><p class='sm mut'>${c[1] > 1 ? c[1] + ' itens, cada um de ' + c[2] + ' a ' + c[3] : 'Tempo em segundos'}.</p><div class='row'>${[...Array(c[1])].map((_, i) => `<input class='it' type='number' step='any' min='${c[2]}' max='${c[3]}' aria-label='Item ${i + 1}' placeholder='${i + 1}' style='width:66px'>`).join('')}</div><div class='row' style='margin-top:12px'><button class='btn' onclick="calcE('${p.id}')">Calcular e salvar</button></div></div><div class='card'><h3>Resultados</h3>${(p.esc || []).slice().reverse().map(e => `<div class='item'><span>${br(e.d)} · ${SCL[e.k][0]}: <b>${Math.round(e.v * 10) / 10}</b> ${SCL[e.k][5]} ${esc(e.t)}</span></div>`).join('') || "<p class='mut'>Nenhuma escala registrada.</p>"}</div>`;
}

function calcE(id) {
    const p = pat(id), k = ui.esc || 'osw', c = SCL[k], x = [...document.querySelectorAll('.it')].map(i => i.value);
    if (x.some(v => v === '' || +v < c[2] || +v > c[3])) {
        toast('Preencha todos os itens dentro do intervalo');
        return;
    }
    const v = c[4](x.reduce((a, b) => a + +b, 0));
    (p.esc = p.esc || []).push({
        k, d: iso(new Date()), v, t: c[6](v)
    });
    save();
    render();
}

function exerTab(p) {
    const E = p.exer || [];
    return `${libCard(p)}<div class='card'><h3>Novo exercício</h3><label for='x_n'>Nome *</label><input id='x_n'><div class='f2'><div><label for='x_s'>Séries</label><input id='x_s' type='number' min='1'></div><div><label for='x_r'>Repetições</label><input id='x_r' type='number' min='1'></div></div><label for='x_c'>Carga</label><input id='x_c' placeholder='ex.: 2 kg, elástico leve'><label for='x_d'>Descrição / como executar</label><textarea id='x_d'></textarea><div class='row' style='margin-top:12px'><button class='btn' onclick="addX('${p.id}')">Adicionar</button></div></div><div class='card'><h3>Exercícios domiciliares</h3>${E.map((x, i) => `<div class='item'><div>${x.img ? `<img src='${x.img}' alt='' class='th'>` : ''}<b>${esc(x.n)}</b> · ${x.s || '—'}×${x.r || '—'}${x.c ? ' · ' + esc(x.c) : ''}<br><span class='sm mut'>${esc(x.d)}</span></div><button class='btn2 s' onclick="ask('Remover este exercício?',()=>rmX('${p.id}',${i}))">Remover</button></div>`).join('') || "<p class='mut'>Nenhum exercício.</p>"}</div>`;
}

function addX(id) {
    const g = i => $('#' + i).value, n = g('x_n').trim();
    if (!n) {
        toast('Informe o nome');
        return;
    }
    const p = pat(id);
    (p.exer = p.exer || []).push({
        n, s: g('x_s'), r: g('x_r'), c: g('x_c'), d: g('x_d')
    });
    save();
    render();
}

function rmX(id, i) {
    undo(pat(id).exer, i, 'Exercício');
}

function docsTab(p) {
    const k = ui.dk || 'aval', P = S.prof;
    return `<div class='noprint card'><h3>Relatórios</h3><div class='f2'><div><label for='d_k'>Tipo</label><select id='d_k' onchange="ui.dk=this.value;render()">${[['aval', 'Avaliação'], ['evo', 'Evolução'], ['enc', 'Encaminhamento'], ['alta', 'Alta'], ['exer', 'Ficha de exercícios']].map(o => `<option value='${o[0]}' ${k == o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></div><div><label for='d_c'>Clínica ou consultório</label><input id='d_c' value='${esc(P.cl)}' onchange="S.prof.cl=this.value;save();render()"></div><div><label for='d_n'>Fisioterapeuta</label><input id='d_n' value='${esc(P.n)}' onchange="S.prof.n=this.value;save();render()"></div><div><label for='d_r'>CREFITO</label><input id='d_r' value='${esc(P.c)}' onchange="S.prof.c=this.value;save();render()"></div></div><p class='sm mut'>O documento reúne só o que está no prontuário. Revise antes de emitir.</p><button class='btn' onclick='prt()'>Imprimir / salvar PDF</button></div><div class='card doc'>${docHTML(p, k)}</div>`;
}

function prt() {
    try {
        window.print();
    }
    catch (e) {
        toast('Impressão bloqueada neste ambiente');
    }
}

function docHTML(p, k) {
    const A = p.aval || {}, f = S.sessions.filter(s => s.pid == p.id && s.status == 'finalizada').sort((a, b) => a.data.localeCompare(b.data)), T = {
        aval: 'Relatório de avaliação fisioterapêutica', evo: 'Relatório de evolução', enc: 'Encaminhamento', alta: 'Relatório de alta', exer: 'Ficha de exercícios domiciliares'
    }[k], P = S.prof;
    const blk = L => L.filter(x => A[x[0]]).map(x => `<p><b>${x[1]}:</b> ${esc(A[x[0]])}</p>`).join('') || "<p class='mut'>(sem dados registrados)</p>";
    let c = '';
    if (k == 'aval')
        c = '<h3>Anamnese</h3>' + blk(AF) + '<h3>Avaliação física</h3>' + blk(ALLP) + '<h3>Conclusão clínica</h3>' + blk(PF);
    if (k == 'evo')
        c = `<table style='width:100%;border-collapse:collapse'><tr><th>Data</th><th>Dor</th><th>ADM</th><th>Força</th><th>Condutas</th></tr>${f.map(s => `<tr><td>${br(s.data)}</td><td>${s.dor}/10</td><td>${s.adm ?? '—'}</td><td>${s.forca ?? '—'}</td><td>${esc(s.conduta)}</td></tr>`).join('')}</table>`;
    if (k == 'enc')
        c = `<p><b>Queixa principal:</b> ${esc(p.queixa)}</p>` + blk([PF[0], PF[1], PF[4]]);
    if (k == 'alta') {
        const a = f[0], b = f.at(-1);
        c = (a && b ? `<p><b>Dor (EVA):</b> ${a.dor} → ${b.dor} · <b>ADM:</b> ${a.adm ?? '—'} → ${b.adm ?? '—'} · <b>Força:</b> ${a.forca ?? '—'} → ${b.forca ?? '—'}</p>` : '') + '<h3>Metas</h3>' + ((p.metas || []).map(m => `<p>${esc(m.x)} — <b>${ST[m.s]}</b></p>`).join('') || '<p>—</p>') + '<h3>Orientações</h3><p>' + esc(b?.orient || '—') + '</p>';
    }
    if (k == 'exer')
        c = (p.exer || []).map(x => `<p>${x.img ? `<img src='${x.img}' alt='' style='height:90px;float:right'>` : ''}<b>${esc(x.n)}</b> — ${x.s || '—'} séries × ${x.r || '—'} repetições${x.c ? ', carga: ' + esc(x.c) : ''}<br>${esc(x.d)}</p>`).join('') || '<p>—</p>';
    return `<div class="lh">${P.logo ? `<img src="${P.logo}" alt="" style="height:64px;border-radius:8px">` : '<div class="lgbox" aria-hidden="true">Logo</div>'}<div><b class="brand" style="font-size:20px">${esc(P.cl || 'Nome da clínica')}</b><br><span class="sm">Fisioterapia · ${esc(P.n || 'Fisioterapeuta')} · CREFITO ${esc(P.c || '______')}</span></div></div><h2>${T}</h2><p><b>Paciente:</b> ${esc(p.nome)} · ${idade(p.nasc)} anos · Emissão: ${br(iso(new Date()))}</p>${c}<div style='margin-top:48px'>_______________________________<br>${esc(P.n || 'Fisioterapeuta')} · CREFITO: ${esc(P.c || '__________')}</div><div class="lf sm mut">Emitido em ${br(iso(new Date()))} · ${esc(p.nome)} · Documento sujeito à revisão e validação do profissional</div>`;
}

const libCard = p => `<div class='card'><h3>Biblioteca de exercícios</h3><div class='row'><select id='l_s' aria-label='Exercício da biblioteca' style='flex:1'>${S.lib.map(x => `<option value='${x.id}'>${esc(x.n)}</option>`).join('')}</select><input id='l_se' type='number' placeholder='Séries' aria-label='Séries' style='width:84px'><input id='l_re' type='number' placeholder='Reps' aria-label='Repetições' style='width:84px'><button class='btn' onclick="presc('${p.id}')">Prescrever</button></div><details style='margin-top:12px'><summary>Cadastrar na biblioteca</summary><label for='l_n'>Nome *</label><input id='l_n'><label for='l_d'>Descrição</label><textarea id='l_d'></textarea><label for='l_f'>Foto (opcional)</label><input id='l_f' type='file' accept='image/*'><div class='row' style='margin-top:10px'><button class='btn2' onclick='addL()'>Salvar na biblioteca</button></div></details></div>`;

function presc(id) {
    const x = S.lib.find(l => l.id == $('#l_s').value);
    if (!x) {
        toast('Biblioteca vazia');
        return;
    }
    const p = pat(id);
    (p.exer = p.exer || []).push({
        n: x.n, d: x.d, img: x.img, s: $('#l_se').value, r: $('#l_re').value, c: ''
    });
    save();
    render();
}

function addL() {
    const n = $('#l_n').value.trim();
    if (!n) {
        toast('Informe o nome');
        return;
    }
    const f = $('#l_f').files[0], d = $('#l_d').value, put = img => {
        S.lib.push({
            id: 'l' + Date.now(), n, d, img
        });
        save();
        render();
    };
    f ? imgRead(f, put, 360) : put('');
}

function anexTab(p) {
    const X = p.anex || [], F = X.filter(x => x.img && x.t == 'Foto postural').sort((a, b) => a.d.localeCompare(b.d));
    return `<div class='card'><h3>Novo anexo</h3><div class='f2'><div><label for='x_t'>Tipo</label><select id='x_t'><option>Foto postural</option><option>Exame</option><option>Laudo</option></select></div><div><label for='x_dt'>Data</label><input type='date' id='x_dt' value='${iso(new Date())}'></div></div><label for='x_f'>Arquivo (imagem; PDF guarda só o nome)</label><input id='x_f' type='file' accept='image/*,application/pdf'><div class='row' style='margin-top:12px'><button class='btn' onclick="addAx('${p.id}')">Anexar</button></div></div>${F.length > 1 ? `<div class='card'><h3>Comparação postural</h3><div class='f2'>${[F[0], F.at(-1)].map((x, i) => `<figure style='margin:0'><img src='${x.img}' alt='Foto postural ${i ? 'atual' : 'inicial'}' style='width:100%;border-radius:10px'><figcaption class='sm'>${i ? 'Atual' : 'Inicial'} · ${br(x.d)}</figcaption></figure>`).join('')}</div></div>` : ''}<div class='card'><h3>Anexos</h3>${X.map((x, i) => `<div class='item'><div>${x.img ? `<img src='${x.img}' alt='' class='th'>` : ''}<b>${x.t}</b> · ${br(x.d)} · ${esc(x.n)}</div><button class='btn2 s' onclick="ask('Remover anexo?',()=>undo(pat('${p.id}').anex,${i},'Anexo'))">Remover</button></div>`).join('') || "<p class='mut'>Nenhum anexo.</p>"}</div>`;
}

function addAx(id) {
    const f = $('#x_f').files[0], t = $('#x_t').value, d = $('#x_dt').value;
    if (!f) {
        toast('Escolha um arquivo');
        return;
    }
    const p = pat(id), put = img => {
        (p.anex = p.anex || []).push({
            t, d, n: f.name, img
        });
        save();
        render();
    };
    f.type.startsWith('image/') ? imgRead(f, put, 640) : put('');
}

const cifChips = () => `<p class='sm mut' style='margin-top:10px'>Códigos de referência da CIF (confirme a codificação e os qualificadores):</p><div class='row'>${[['b280', 'Dor'], ['b710', 'Mobilidade articular'], ['b730', 'Força muscular'], ['b455', 'Tolerância ao exercício'], ['d410', 'Mudar posição'], ['d450', 'Andar'], ['s750', 'Extremidade inferior']].map(c => `<button type='button' class='btn2 s' onclick="addCif('${c[0]}')">${c[0]} · ${c[1]}</button>`).join('')}</div>`;

function addCif(c) {
    const e = $('#a_cif');
    e.value += (e.value ? ', ' : '') + c;
    e.focus();
}

const letterhead = P => `<div class="lh">${P.logo ? `<img src="${P.logo}" alt="" style="height:64px;border-radius:8px">` : '<div class="lgbox" aria-hidden="true">Logo</div>'}<div><b class="brand" style="font-size:20px">${esc(P.cl || 'Nome da clínica')}</b><br><span class="sm">Fisioterapia · ${esc(P.n || 'Fisioterapeuta')} · CREFITO ${esc(P.c || '______')}</span></div></div>`;
