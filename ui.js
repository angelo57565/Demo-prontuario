/* Prumo — Componentes de interface: aviso, janelas, confirmação, desfazer */

const bdg = s => `<span class="badge ${BD[s][2]}">${BD[s][0]} ${BD[s][1]}</span>`;

const toast = m => {
    const t = $('#toast');
    t.textContent = m;
    t.className = 'on';
    setTimeout(() => t.className = '', 2200);
};

const dlg = () => $('#dlg');

const modal = h => {
    dlg().innerHTML = h;
    dlg().setAttribute('aria-label', (dlg().querySelector('h3') || {}).textContent || 'Diálogo');
    if (!dlg().open)
        dlg().showModal();
};

function ask(m, ok) {
    modal(`<p>${m}</p><div class="row"><button class="btn2" onclick="dlg().close()">Cancelar</button><button class="btn" id="okb">Confirmar</button></div>`);
    $('#okb').onclick = () => {
        dlg().close();
        ok();
    };
}

const popts = sel => S.patients.map(p => `<option value="${p.id}" ${p.id == sel ? 'selected' : ''}>${esc(p.nome)}</option>`).join('');

function undo(arr, i, l) {
    const it = arr.splice(i, 1)[0];
    save();
    render();
    const t = $('#toast');
    t.innerHTML = l + ' removido. <button class="btn2 s" onclick="doUndo()">Desfazer</button>';
    t.style.pointerEvents = 'auto';
    t.className = 'on';
    ui.un = {
        arr, i, it
    };
    clearTimeout(ui.ut);
    ui.ut = setTimeout(() => {
        t.className = '';
        t.style.pointerEvents = 'none';
        ui.un = null;
    }, 6000);
}

function doUndo() {
    const u = ui.un;
    if (!u)
        return;
    u.arr.splice(u.i, 0, u.it);
    save();
    ui.un = null;
    $('#toast').className = '';
    render();
}

function zoom(src) {
    modal(`<img src='${src}' alt='Imagem ampliada' style='width:100%;border-radius:10px'><div class='row' style='margin-top:12px'><button class='btn' onclick='dlg().close()'>Fechar</button></div>`);
}

function cnt() {
    if (matchMedia('(prefers-reduced-motion:reduce)').matches)
        return;
    document.querySelectorAll('.kpi b').forEach(e => {
        const t = +e.textContent;
        if (!(t > 0))
            return;
        const t0 = performance.now();
        (function f(n) {
            const k = Math.min((n - t0) / 600, 1);
            e.textContent = Math.round(t * (1 - Math.pow(1 - k, 3)));
            if (k < 1)
                requestAnimationFrame(f);
        })(t0);
    });
}
