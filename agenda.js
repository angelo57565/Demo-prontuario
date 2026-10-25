/* Prumo — Agenda: semana, dia, mês, lista de espera e remarcação */

V.ag = function () {
    const m = new Date();
    m.setDate(m.getDate() - ((m.getDay() + 6) % 7) + ui.wk * 7);
    const days = [...Array(7)].map((_, i) => {
        const d = new Date(m);
        d.setDate(d.getDate() + i);
        return iso(d);
    });
    const nm = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    return `<div class="row sp"><h2>Agenda semanal</h2><button class="btn" onclick="aform()">+ Agendar</button></div><div class="row sp" style="margin:10px 0"><div class="row"><button class="btn2 s" onclick="ui.wk--;render()">‹ Anterior</button><button class="btn2 s" onclick="ui.wk=0;render()">Hoje</button><button class="btn2 s" onclick="ui.wk++;render()">Próxima ›</button></div><div class="row"><select aria-label="Filtrar por status" style="width:auto" onchange="ui.fs=this.value;render()"><option value="">Todos os status</option>${['agendado', 'presente', 'falta', 'cancelado'].map(k => `<option value="${k}" ${ui.fs == k ? 'selected' : ''}>${BD[k][1]}</option>`).join('')}</select><button class="btn2 s" onclick="go('dia')">Visão diária</button><button class="btn2 s" onclick="go('mes')">Mês e lista de espera</button></div></div>` +
        days.map((d, i) => {
            const ap = S.appts.filter(a => a.data == d && (!ui.fs || a.status == ui.fs)).sort((a, b) => a.hora.localeCompare(b.hora));
            return `<div class="card"><h3>${nm[i]} ${br(d).slice(0, 5)} ${d == iso(new Date()) ? '<span class="badge ok">hoje</span>' : ''}</h3>${ap.map(a => `<div class="item"><div><b>${a.hora}</b> · ${pn(a.pid)} ${bdg(a.status)}</div><div class="row"><button class="btn2 s" onclick="setAp('${a.id}','presente')">Presente</button><button class="btn2 s" onclick="setAp('${a.id}','falta')">Falta</button><button class="btn2 s" onclick="remAp('${a.id}')">Remarcar</button><button class="btn2 s" onclick="cancAp('${a.id}')">Cancelar</button></div></div>`).join('') || '<p class="mut sm">Sem atendimentos.</p>'}</div>`;
        }).join('');
};

function aform() {
    modal(`<h3>Novo agendamento</h3><label for="g_p">Paciente</label><select id="g_p">${popts()}</select><div class="f2"><div><label for="g_d">Data</label><input type="date" id="g_d" value="${iso(new Date())}"></div><div><label for="g_h">Horário</label><input type="time" id="g_h" value="09:00"></div></div><div id="g_e"></div><div class="row" style="margin-top:14px"><button class="btn2" onclick="dlg().close()">Cancelar</button><button class="btn" onclick="addA()">Agendar</button></div>`);
}

function addA() {
    const a = {
        id: 'a' + Date.now(), pid: $('#g_p').value, data: $('#g_d').value, hora: $('#g_h').value, status: 'agendado'
    };
    if (!a.pid || !a.data || !a.hora) {
        $('#g_e').innerHTML = '<div class="err">Preencha todos os campos.</div>';
        return;
    }
    if (S.appts.some(x => x.data == a.data && x.hora == a.hora && x.status != 'cancelado')) {
        $('#g_e').innerHTML = '<div class="err">Horário já ocupado.</div>';
        return;
    }
    S.appts.push(a);
    save();
    dlg().close();
    toast('Agendado');
    render();
}

function setAp(id, st) {
    S.appts.find(a => a.id == id).status = st;
    save();
    render();
}

function cancAp(id) {
    ask('Cancelar este atendimento?', () => setAp(id, 'cancelado'));
}

function startAp(id) {
    const a = S.appts.find(x => x.id == id);
    ui.v = 'at';
    ui.pid = a.pid;
    newFor(a.pid);
    ui.sess.apt = id;
    render();
}

V.mes = () => {
    const b = new Date();
    b.setDate(1);
    b.setMonth(b.getMonth() + (ui.mo || 0));
    const y = b.getFullYear(), m = b.getMonth(), n = new Date(y, m + 1, 0).getDate(), off = (b.getDay() + 6) % 7;
    const cells = [...Array(off).fill(null), ...Array(n).keys()].map(x => x === null ? '<div></div>' : `<div class='card' style='padding:6px;margin:0;min-height:70px'><b>${x + 1}</b>${S.appts.filter(a => a.data == iso(new Date(y, m, x + 1)) && a.status != 'cancelado').map(a => `<div class='sm'>${a.hora} ${pn(a.pid).slice(0, 10)}</div>`).join('')}</div>`).join('');
    return `<button class='btn2 s' onclick="go('ag')">‹ Agenda semanal</button><div class='row sp' style='margin:12px 0'><h2 style='text-transform:capitalize'>${b.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2><div class='row'><button class='btn2 s' onclick='ui.mo=(ui.mo||0)-1;render()'>‹</button><button class='btn2 s' onclick='ui.mo=(ui.mo||0)+1;render()'>›</button></div></div><div class='tw'><div style='display:grid;grid-template-columns:repeat(7,1fr);gap:4px;min-width:560px'>${['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => `<b class='sm'>${d}</b>`).join('')}${cells}</div></div><div class='card' style='margin-top:16px'><h3>Lista de espera</h3><div class='row'><input id='w_n' placeholder='Nome' aria-label='Nome' style='flex:1'><input id='w_t' placeholder='Telefone' aria-label='Telefone' style='flex:1'><button class='btn' onclick='addW()'>Adicionar</button></div>${S.espera.map((w, i) => `<div class='item'><span>${esc(w.n)} · ${esc(w.t)}</span><button class='btn2 s' onclick="undo(S.espera,${i},'Contato')">Remover</button></div>`).join('')}</div>`;
};

function addW() {
    const n = $('#w_n').value.trim();
    if (!n) {
        toast('Informe o nome');
        return;
    }
    S.espera.push({ n, t: $('#w_t').value });
    save();
    render();
}

function remAp(id) {
    const a = S.appts.find(x => x.id == id);
    modal(`<h3>Remarcar</h3><div class='f2'><div><label for='r_d'>Data</label><input type='date' id='r_d' value='${a.data}'></div><div><label for='r_h'>Horário</label><input type='time' id='r_h' value='${a.hora}'></div></div><div id='r_e'></div><div class='row' style='margin-top:14px'><button class='btn2' onclick='dlg().close()'>Cancelar</button><button class='btn' id='r_ok'>Confirmar</button></div>`);
    $('#r_ok').onclick = () => {
        const d = $('#r_d').value, h = $('#r_h').value;
        if (S.appts.some(x => x.id != id && x.data == d && x.hora == h && x.status != 'cancelado')) {
            $('#r_e').innerHTML = "<div class='err'>Horário já ocupado.</div>";
            return;
        }
        a.data = d;
        a.hora = h;
        a.status = 'agendado';
        save();
        dlg().close();
        toast('Remarcado');
        render();
    };
}

V.dia = () => {
    const d = ui.dd || iso(new Date()), H = [];
    {
        const c = S.cfg, a = toMin(c.ini), b = toMin(c.fim);
        for (let t = a; t < b; t += c.dur)
            H.push(fmtMin(t));
    }
    return `<button class='btn2 s' onclick="go('ag')">‹ Agenda semanal</button><div class='row sp' style='margin:12px 0'><h2>${br(d)}</h2><div class='row'><button class='btn2 s' onclick="ui.dd=addDay('${d}',-1);render()">‹ Dia</button><button class='btn2 s' onclick="ui.dd=null;render()">Hoje</button><button class='btn2 s' onclick="ui.dd=addDay('${d}',1);render()">Dia ›</button></div></div><div class='card'>${H.map(h => {
        const a = S.appts.filter(x => x.data == d && x.hora == h && x.status != 'cancelado');
        return `<div class='item'><b style='width:56px'>${h}</b><div style='flex:1'>${a.map(x => `${pn(x.pid)} ${bdg(x.status)}`).join('<br>') || `<span class='badge ok'>○ Livre</span>`}</div>${a.length ? '' : `<button class='btn2 s' onclick="aform();$('#g_d').value='${d}';$('#g_h').value='${h}'">Agendar</button>`}</div>`;
    }).join('')}</div>`;
};
