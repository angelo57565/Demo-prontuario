/* Prumo — Eventos globais: atalhos, rascunho automático e aviso ao sair */

document.addEventListener('keydown', e => {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey || dlg().open)
        return;
    const m = {
        i: 'dash', p: 'pac', a: 'ag', n: 'sess', e: 'evo'
    };
    if (e.key == '/') {
        e.preventDefault();
        srch();
    }
    else if (m[e.key])
        go(m[e.key]);
});

document.addEventListener('input', e => {
    const i = e.target.id || '';
    if ((ui.v == 'sess' || ui.v == 'at') && ui.sess && ui.sess.status != 'finalizada' && i.startsWith('s_')) {
        ui.dirty = true;
        clearTimeout(ui.at);
        ui.at = setTimeout(autoS, 1500);
    }
});

window.onbeforeunload = e => {
    if (ui.dirty) {
        e.preventDefault();
        return '';
    }
};

document.addEventListener('click', e => {
    if (e.target.classList && e.target.classList.contains('th'))
        zoom(e.target.src);
});
