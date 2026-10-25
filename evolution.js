/* Prumo — Evolução clínica: gráficos e metas no gráfico */

V.evo = function () {
    const e = ui.evo;
    return `<h2>Evolução clínica</h2><div class="card"><div class="f2"><div><label for="e_p">Paciente</label><select id="e_p" onchange="ui.evo.pid=this.value;render()">${popts(e.pid)}</select></div><div><label for="e_i">Indicador</label><select id="e_i" onchange="ui.evo.ind=this.value;render()"><option value="dor" ${e.ind == 'dor' ? 'selected' : ''}>Dor — EVA (0–10)</option><option value="adm" ${e.ind == 'adm' ? 'selected' : ''}>ADM flexão do joelho (°)</option><option value="forca" ${e.ind == 'forca' ? 'selected' : ''}>Força muscular — Oxford (0–5)</option></select></div><div><label for="e_d">De</label><input type="date" id="e_d" value="${e.de}" onchange="ui.evo.de=this.value;render()"></div><div><label for="e_a">Até</label><input type="date" id="e_a" value="${e.ate}" onchange="ui.evo.ate=this.value;render()"></div></div></div><div class="card">${chart(e.pid, e.ind, e.de, e.ate)}</div>`;
};

function chart(pid, ind, de, ate) {
    const k = ind, M = {
        dor: ['Dor — EVA (0–10)', 10], adm: ['ADM flexão do joelho (°)', 140], forca: ['Força muscular — Oxford (0–5)', 5]
    }, tt = M[k][0], mx = M[k][1];
    const pts = S.sessions.filter(s => s.pid == pid && s.status == 'finalizada' && s[k] != null && s.data >= de && s.data <= ate).sort((a, b) => a.data.localeCompare(b.data));
    if (!pts.length)
        return `<h3>${tt}</h3><p class="mut">Sem medidas finalizadas neste intervalo.</p>`;
    const W = 600, H = 250, l = 36, r = 16, t = 14, b = 32, t0 = new Date(pts[0].data), sp = new Date(pts.at(-1).data) - t0 || 1;
    const X = d => pts.length == 1 ? l + (W - l - r) / 2 : l + (new Date(d) - t0) / sp * (W - l - r), Y = v => t + (1 - v / mx) * (H - t - b);
    const g = [0, mx / 2, mx].map(v => `<line x1="${l}" x2="${W - r}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--bd)"/><text x="${l - 6}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`).join('');
    return `<h3>${tt}</h3><div class="tw"><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Gráfico de ${tt}">${g}${metaLines(pid, k, Y, l, W - r)}<polyline pathLength="1" fill="none" stroke="var(--line)" stroke-width="2" points="${pts.map(s => X(s.data) + ',' + Y(s[k])).join(' ')}"/>${pts.map(s => `<circle cx="${X(s.data)}" cy="${Y(s[k])}" r="5" fill="var(--line)" tabindex="0" onclick="toast('${br(s.data)}: ${s[k]}')"><title>${br(s.data)} · ${tt}: ${s[k]}</title></circle><text x="${X(s.data)}" y="${Y(s[k]) - 9}" text-anchor="middle">${s[k]}</text><text x="${X(s.data)}" y="${H - 10}" text-anchor="middle">${br(s.data).slice(0, 5)}</text>`).join('')}</svg></div><p class="sm mut">Inicial: ${pts[0][k]} → Atual: ${pts.at(-1)[k]} (${pts.length} medidas)</p>`;
}

function metaLines(pid, k, Y, x1, x2) {
    return (pat(pid).metas || []).filter(m => m.i == k && m.v != null && m.s != 'rv').map(m => `<line x1='${x1}' x2='${x2}' y1='${Y(m.v)}' y2='${Y(m.v)}' stroke='var(--line)' stroke-width='1.5' stroke-dasharray='6 4'/><text x='${x2}' y='${Y(m.v) - 4}' text-anchor='end'>Meta ${m.v}${m.s == 'at' ? ' ✓' : ''}</text>`).join('');
}
