/* Prumo — Funções utilitárias (datas, texto, validação, imagens) */

const $ = s => document.querySelector(s);

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
}[c]));

const iso = d => {
    const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4);
    return z.toISOString().slice(0, 10);
};

const addD = n => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return iso(d);
};

const br = s => s.split('-').reverse().join('/');

const diff = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);

const idade = n => {
    const t = new Date(), d = new Date(n);
    let a = t.getFullYear() - d.getFullYear();
    if (t < new Date(t.getFullYear(), d.getMonth(), d.getDate()))
        a--;
    return a;
};

function cpfOk(c) {
    c = c.replace(/\D/g, '');
    if (c.length != 11 || /^(\d)\1+$/.test(c))
        return false;
    for (let t = 9; t < 11; t++) {
        let s = 0;
        for (let i = 0; i < t; i++)
            s += c[i] * (t + 1 - i);
        if ((s * 10 % 11) % 10 != c[t])
            return false;
    }
    return true;
}

function imgRead(file, cb, mx) {
    const r = new FileReader();
    r.onload = () => {
        const i = new Image();
        i.onload = () => {
            const k = Math.min(1, mx / Math.max(i.width, i.height)), c = document.createElement('canvas');
            c.width = i.width * k;
            c.height = i.height * k;
            c.getContext('2d').drawImage(i, 0, 0, c.width, c.height);
            cb(c.toDataURL('image/jpeg', .7));
        };
        i.src = r.result;
    };
    r.readAsDataURL(file);
}

const addDay = (s, n) => {
    const x = new Date(s + 'T12:00:00');
    x.setDate(x.getDate() + n);
    return iso(x);
};

const emptyH = (m, b = '') => `<div class='mut' style='text-align:center;padding:18px'><p>${m}</p>${b}</div>`;

const toMin = s => +s.slice(0, 2) * 60 + +s.slice(3, 5), fmtMin = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

const brl = v => 'R$ ' + (+v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
