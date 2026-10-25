/* Prumo — Avatar de dor (mapa corporal) e comparação inicial × atual */

const rlab = (r, s) => r[1] + (s ? ' ' + (s == 'd' ? (FEM.includes(r[0]) ? 'direita' : 'direito') : (FEM.includes(r[0]) ? 'esquerda' : 'esquerdo')) : '');

const regLabel = id => {
    const [a, s] = id.split('-');
    return rlab(BM.find(x => x[0] == a), s);
};

function bodySvg(v, sel, ro, di) {
    di = di || {};
    let sl = '', o = '';
    BM.filter(r => r[8].includes(v)).forEach(r => {
        (r[7] ? [0, 1] : [0]).forEach(mir => {
            const side = r[7] ? ((v == 'f') == (mir == 0) ? 'd' : 'e') : '', id = r[0] + (side ? '-' + side : ''), on = sel.includes(id), lab = rlab(r, side);
            const a = mir ? (r[2] == 'r' ? 200 - r[3] - r[5] : 200 - r[3]) : r[3];
            const sh = r[2] == 'c' ? `<circle cx='${a}' cy='${r[4]}' r='${r[5]}'/>` : r[2] == 'e' ? `<ellipse cx='${a}' cy='${r[4]}' rx='${r[5]}' ry='${r[6]}'/>` : `<rect x='${a}' y='${r[4]}' width='${r[5]}' height='${r[6]}' rx='12'/>`;
            sl += sh;
            o += `<g class='reg${on ? ' on' : ''}${ro ? ' ro' : ''}' ${ro ? '' : `tabindex='0' role='button' aria-pressed='${on}' onclick="togR(this,'${id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();togR(this,'${id}')}"`} aria-label='${lab}'${on && di[id] != null ? ` style='fill-opacity:${(0.25 + di[id] * 0.075).toFixed(2)}'` : ''}><title>${lab}</title>${sh}</g>`;
        });
    });
    return '<g class="sb">' + sl + '</g><g class="sf">' + sl + '</g>' + o;
}

function listHTML(s, ro) {
    const sel = s.dores || [];
    return `<b>Regiões com dor:</b> ${sel.length ? sel.map(id => ro ? regLabel(id) + ((s.dint || {})[id] != null ? ' (' + s.dint[id] + '/10)' : '') : `<span style='display:inline-block;margin:2px 8px 2px 0'>${regLabel(id)} <input type='number' min='0' max='10' aria-label='Intensidade ${regLabel(id)} de 0 a 10' style='width:62px;padding:3px 6px' value='${(s.dint || {})[id] ?? ''}' onchange="setInt('${id}',this.value)"></span>`).join(ro ? ', ' : '') : 'nenhuma marcada'}${!ro && sel.length ? ` <button class='btn2 s' onclick='clrR()'>Limpar</button>` : ''}`;
}

function mapHTML(s, ro) {
    ui.mapS = s;
    const v = ui.mv || 'f';
    return `<div class='row' style='margin:6px 0'><button class='btn${v == 'f' ? '' : '2'} s' onclick="setMv('f')" aria-pressed='${v == 'f'}'>Frente</button><button class='btn${v == 'b' ? '' : '2'} s' onclick="setMv('b')" aria-pressed='${v == 'b'}'>Costas</button></div><svg viewBox='0 0 200 385' width='100%' style='max-width:230px;display:block' role='group' aria-label='Mapa corporal de dor, vista ${v == 'f' ? 'frontal' : 'posterior'}'>${bodySvg(v, s.dores || [], ro, s.dint)}</svg><p class='sm' id='blist' aria-live='polite'>${listHTML(s, ro)}</p>`;
}

const roM = () => ui.mapS.status == 'finalizada';

function setMv(v) {
    ui.mv = v;
    $('#bmapw').innerHTML = mapHTML(ui.mapS, roM());
    const s = $('#bmapw svg');
    if (s)
        s.classList.add('fl');
}

function togR(g, id) {
    const s = ui.mapS;
    s.dores = s.dores || [];
    const i = s.dores.indexOf(id);
    if (i < 0)
        s.dores.push(id);
    else
        s.dores.splice(i, 1);
    g.classList.toggle('on', i < 0);
    g.setAttribute('aria-pressed', i < 0);
    $('#blist').innerHTML = listHTML(s, false);
}

function clrR() {
    ui.mapS.dores = [];
    $('#bmapw').innerHTML = mapHTML(ui.mapS, false);
}

function setInt(id, v) {
    const s = ui.mapS;
    s.dint = s.dint || {};
    s.dint[id] = v === '' ? null : +v;
}

function painCmp(a, b) {
    const v = ui.mv || 'f';
    return `<div class='card'><h3>Mapa de dor: inicial × atual</h3><div class='row' style='margin-bottom:8px'><button class='btn${v == 'f' ? '' : '2'} s' onclick="ui.mv='f';render()">Frente</button><button class='btn${v == 'b' ? '' : '2'} s' onclick="ui.mv='b';render()">Costas</button></div><div class='f2'>${[a, b].map((s, i) => `<div><b>${i ? 'Atual' : 'Inicial'} · ${br(s.data)}</b><svg viewBox='0 0 200 385' width='100%' style='max-width:200px;display:block' role='img' aria-label='Mapa de dor ${i ? 'atual' : 'inicial'}, vista ${v == 'f' ? 'frontal' : 'posterior'}'>${bodySvg(v, s.dores || [], true, s.dint)}</svg><p class='sm'>${listHTML(s, true)}</p></div>`).join('')}</div></div>`;
}
