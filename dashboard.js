/* Prumo — Tela Início: indicadores, gráficos e lembretes */

V.dash = function () {
    const t = iso(new Date()), ap = S.appts.filter(a => a.data == t).sort((a, b) => a.hora.localeCompare(b.hora));
    const pend = S.sessions.filter(s => s.status == 'rascunho'), reav = S.patients.filter(p => {
        const l = last(p.id);
        return !l || diff(l.data, t) >= 14;
    });
    const al = S.patients.filter(p => p.alertas);
    return `<div class="card hero">${LOGO}<div><h2>Olá, Profissional Demo</h2><p class="mut">Movimento registrado com cuidado.</p></div></div>
<div class="row" style="margin-bottom:14px"><button class="btn" onclick="pform()">+ Paciente</button><button class="btn2" onclick="go('sess')">Registrar evolução</button></div>
<div class="grid"><div class="card kpi">Pacientes ativos<b>${S.patients.length}</b></div><div class="card kpi">Atendimentos hoje<b>${ap.length}</b></div><div class="card kpi">Registros pendentes<b>${pend.length}</b></div><div class="card kpi">Reavaliações próximas<b>${reav.length}</b><span class="sm mut">sem sessão há 14+ dias</span></div></div>
${dashCharts()}<div class="card"><h3>Agenda de hoje</h3>${ap.map(a => `<div class="item"><div><b>${a.hora}</b> · ${pn(a.pid)}</div><div class="row">${bdg(a.status)}<button class="btn s" onclick="startAp('${a.id}')">Iniciar</button></div></div>`).join('') || emptyH('Nenhum atendimento hoje.', "<button class='btn2' onclick=\"go('ag')\">Abrir agenda</button>")}</div>
<div class="card"><h3>Alertas e pendências</h3>${revAl()}${pend.map(s => `<div class="item"><span>Rascunho de ${pn(s.pid)} (${br(s.data)})</span><button class="btn2 s" onclick="go('sess','${s.id}')">Abrir</button></div>`).join('')}${al.map(p => `<div class="item"><span>Alerta clínico — ${esc(p.nome)}: ${esc(p.alertas)}</span></div>`).join('') || ''}</div>`;
};

function revDue(p) {
    if (!p.rev)
        return 0;
    const n = S.sessions.filter(s => s.pid == p.id && s.status == 'finalizada' && (!p.lastRev || s.data > p.lastRev)).length;
    return n >= p.rev ? n : 0;
}

function revAl() {
    return S.patients.filter(revDue).map(p => `<div class="item"><span>Reavaliação: ${esc(p.nome)} (${revDue(p)} sessões desde a última)</span><button class="btn2 s" onclick="markRev('${p.id}')">Marcar feita</button></div>`).join('');
}

function markRev(id) {
    pat(id).lastRev = iso(new Date());
    save();
    render();
}

function dashCharts() {
    const t = new Date(), W = [...Array(6)].map((_, i) => {
        const e = new Date(t);
        e.setDate(e.getDate() - i * 7);
        const s = new Date(e);
        s.setDate(s.getDate() - 6);
        return [iso(s), iso(e)];
    }).reverse(), C = W.map(w => S.sessions.filter(s => s.status == 'finalizada' && s.data >= w[0] && s.data <= w[1]).length), mx = Math.max(1, ...C), pr = S.appts.filter(a => a.status == 'presente').length, fa = S.appts.filter(a => a.status == 'falta').length, E = {};
    S.patients.forEach(p => {
        const k = ESP[p.esp || 'orto'][0];
        E[k] = (E[k] || 0) + 1;
    });
    return `<div class="card"><h3>Sessões finalizadas por semana</h3><svg viewBox="0 0 300 110" width="100%" role="img" aria-label="Sessões finalizadas nas últimas 6 semanas: ${C.join(', ')}">${C.map((c, i) => `<rect x="${i * 50 + 10}" y="${90 - c / mx * 70}" width="30" height="${c / mx * 70}" rx="4" fill="var(--acc)"/><text x="${i * 50 + 25}" y="${84 - c / mx * 70}" text-anchor="middle">${c}</text><text x="${i * 50 + 25}" y="104" text-anchor="middle">${br(W[i][1]).slice(0, 5)}</text>`).join('')}</svg><p class="sm">Taxa de faltas da clínica: <b>${pr + fa ? Math.round(fa / (pr + fa) * 100) + '%' : '—'}</b> · ${Object.keys(E).map(k => k + ': ' + E[k]).join(' · ')}</p></div>`;
}
