/* Prumo — Estado da aplicação, persistência (localStorage), preferências e registro de acessos */

const KEY = 'fisio-demo-v4';

function seed() {
    const P = [
        {
            id: 'p1', nome: 'Maria Souza (DEMO)', nasc: '1968-04-12', cpf: '', tel: '(11) 90000-0001', queixa: 'Dor no joelho direito após artroplastia', alertas: 'Hipertensa; evitar carga máxima'
        },
        {
            id: 'p2', nome: 'João Lima (DEMO)', nasc: '1990-09-30', cpf: '', tel: '(11) 90000-0002', queixa: 'Lombalgia crônica', alertas: ''
        },
        {
            id: 'p3', nome: 'Ana Costa (DEMO)', nasc: '1955-01-05', cpf: '', tel: '(11) 90000-0003', queixa: 'Reabilitação de ombro', alertas: 'Alergia a látex'
        }
    ];
    const mk = (pid, d, dor, adm) => ({
        id: 's' + pid + d, pid, data: addD(d), dor, adm, relato: 'Relato de exemplo.', conduta: 'Mobilização e exercícios (exemplo).', exe: '3x12 cadeia cinética', plano: 'Progredir carga', status: 'finalizada', add: []
    });
    const S = [mk('p1', -28, 8, 70), mk('p1', -21, 7, 80), mk('p1', -14, 5, 95), mk('p1', -7, 4, 105), mk('p2', -9, 6, null), mk('p2', -2, 5, null), mk('p3', -20, 3, null)];
    [3, 3, 4, 4].forEach((f, i) => S[i].forca = f);
    S.slice(0, 4).forEach(x => x.dores = ['joelho-d', 'coxa-d']);
    S.slice(4, 6).forEach(x => x.dores = ['lombar']);
    P[0].rev = 4;
    S.push({
        id: 'sd1', pid: 'p2', data: addD(0), dor: 4, adm: null, relato: '', conduta: '', exe: '', plano: '', status: 'rascunho', add: []
    });
    return {
        patients: P, sessions: S, appts: [{
                id: 'a1', pid: 'p1', data: addD(0), hora: '09:00', status: 'agendado'
            }, {
                id: 'a2', pid: 'p2', data: addD(0), hora: '10:00', status: 'agendado'
            }, {
                id: 'a3', pid: 'p3', data: addD(1), hora: '14:00', status: 'agendado'
            }]
    };
}

let S;

try {
    S = JSON.parse(localStorage.getItem(KEY));
}
catch (e) {
}

if (!S || !S.patients)
    S = seed();

const save = () => {
    try {
        localStorage.setItem(KEY, JSON.stringify(S));
    }
    catch (e) {
    }
};

const ui = {
    v: 'dash', pid: null, tab: 'resumo', q: '', wk: 0, sess: null, evo: {
        pid: 'p1', ind: 'dor', de: addD(-90), ate: addD(0)
    }
};

const pat = id => S.patients.find(p => p.id == id);

const pn = id => esc(pat(id)?.nome || '—');

const last = pid => S.sessions.filter(s => s.pid == pid && s.status == 'finalizada').sort((a, b) => b.data.localeCompare(a.data))[0];

let PREF = { t: 'auto', c: false };

try {
    Object.assign(PREF, JSON.parse(localStorage.getItem('fisio-pref')));
}
catch (e) {
}

function applyPref() {
    const r = document.documentElement;
    PREF.fs = PREF.fs || 16;
    if (PREF.dn)
        r.dataset.dens = 'c';
    else
        r.removeAttribute('data-dens');
    r.style.setProperty('--fs', PREF.fs + 'px');
    if (PREF.t == 'auto')
        r.removeAttribute('data-theme');
    else
        r.dataset.theme = PREF.t;
    if (PREF.c)
        r.dataset.contrast = 'high';
    else
        r.removeAttribute('data-contrast');
    try {
        localStorage.setItem('fisio-pref', JSON.stringify(PREF));
    }
    catch (e) {
    }
}

S.espera = S.espera || [];

S.prof = S.prof || {
    n: '', c: '', cl: ''
};

function tgFs(d) {
    PREF.fs = Math.min(22, Math.max(13, (PREF.fs || 16) + d * 2));
    applyPref();
}

S.lib = S.lib || [{
        id: 'l1', n: 'Agachamento na parede', d: 'Costas apoiadas na parede, descer até 60° de flexão e subir devagar.', img: ''
    }, {
        id: 'l2', n: 'Ponte glútea', d: 'Deitado, joelhos flexionados; elevar o quadril e manter 3 s.', img: ''
    }, {
        id: 'l3', n: 'Elevação da perna estendida', d: 'Deitado, contrair o quadríceps e elevar a perna sem flexionar o joelho.', img: ''
    }];

S.tpl = S.tpl || ['Mobilização articular grau II', 'Crioterapia 15 min', 'Alongamento global', 'Fortalecimento isotônico', 'TENS 20 min', 'Cinesioterapia ativa', 'Orientações posturais'];

S.log = S.log || [];

function logA(a) {
    S.log.push({
        t: new Date().toISOString(), u: ROLES[ROLE()], a
    });
    if (S.log.length > 200)
        S.log.shift();
}

S.cfg = S.cfg || {
    ini: '07:00', fim: '19:00', dur: 30
};

S.fin = S.fin || { valor: 150, pg: [] };
