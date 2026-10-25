/* Prumo — Constantes: status, menu, escalas, regiões do avatar, ícones */

const BD = {
    agendado: ['◷', 'Agendado', ''], presente: ['✓', 'Presente', 'ok'], falta: ['✕', 'Falta', 'warn'], cancelado: ['⊘', 'Cancelado', ''], rascunho: ['✎', 'Rascunho', 'warn'], finalizada: ['✓', 'Finalizada', 'ok']
};

const NG = {
    dash: 'Atendimento', pac: 'Atendimento', ag: 'Atendimento', sess: 'Atendimento', evo: 'Atendimento', lib: 'Gestão', rel: 'Gestão', fin: 'Gestão', cfg: 'Gestão', usr: 'Administração'
};

const NAV = [['dash', '⌂', 'Início'], ['pac', '☺', 'Pacientes'], ['ag', '▦', 'Agenda'], ['sess', '✎', 'Sessão'], ['evo', '↗', 'Evolução'], ['lib', '', 'Biblioteca'], ['rel', '', 'Relatórios'], ['fin', '', 'Financeiro'], ['cfg', '⚙', 'Configurações']];

const AF = [['hda', 'História da condição atual'], ['hist', 'História clínica e cirúrgica'], ['med', 'Medicamentos e comorbidades'], ['rot', 'Rotina, atividades e limitações funcionais'], ['exp', 'Objetivos e expectativas do paciente']];

const AP = [['loc', 'Dor: localização, intensidade, características e fatores associados'], ['insp', 'Inspeção e observação clínica'], ['adm', 'Amplitude de movimento'], ['for', 'Força muscular'], ['sens', 'Sensibilidade, equilíbrio e coordenação (se pertinente)'], ['marcha', 'Marcha e mobilidade funcional'], ['testes', 'Testes especiais e escalas padronizadas (apenas os pertinentes)']];

const PF = [['dx', 'Diagnóstico fisioterapêutico'], ['prog', 'Prognóstico funcional'], ['curto', 'Objetivos de curto prazo'], ['longo', 'Objetivos de longo prazo'], ['trat', 'Plano de tratamento'], ['freq', 'Frequência prevista e critérios de reavaliação'], ['cif', 'Classificação CIF (códigos e qualificadores)']];

const BM = [['cabeca', 'Cabeça', 'c', 100, 35, 22, 0, 0, 'fb'], ['pescoco', 'Pescoço', 'r', 92, 57, 16, 14, 0, 'fb'], ['ombro', 'Ombro', 'c', 62, 82, 14, 0, 1, 'fb'], ['braco', 'Braço', 'r', 44, 96, 16, 50, 1, 'fb'], ['antebraco', 'Antebraço', 'r', 38, 148, 16, 50, 1, 'fb'], ['mao', 'Mão', 'e', 44, 212, 9, 12, 1, 'fb'], ['torax', 'Tórax', 'r', 72, 72, 56, 40, 0, 'f'], ['abdome', 'Abdome', 'r', 74, 114, 52, 38, 0, 'f'], ['toracica', 'Coluna torácica', 'r', 72, 72, 56, 40, 0, 'b'], ['lombar', 'Coluna lombar', 'r', 74, 114, 52, 38, 0, 'b'], ['quadril', 'Quadril', 'r', 72, 154, 26, 26, 1, 'f'], ['gluteo', 'Glúteo', 'r', 72, 154, 26, 26, 1, 'b'], ['coxa', 'Coxa', 'r', 72, 182, 26, 72, 1, 'fb'], ['joelho', 'Joelho', 'c', 85, 268, 13, 0, 1, 'fb'], ['perna', 'Perna', 'r', 74, 282, 22, 70, 1, 'fb'], ['pe', 'Pé', 'e', 85, 366, 12, 8, 1, 'fb']];

const FEM = ['mao', 'coxa', 'perna'];

const ST = {
    em: 'Em andamento', at: 'Atingida', rv: 'Revisada'
}, IND = {
    dor: 'Dor (EVA)', adm: 'ADM (°)', forca: 'Força (0–5)'
};

const SCL = {
    osw: ['Oswestry (ODI)', 10, 0, 5, s => s / 50 * 100, '%', v => v <= 20 ? 'incapacidade mínima' : v <= 40 ? 'moderada' : v <= 60 ? 'grave' : v <= 80 ? 'incapacitante' : 'restrito ao leito ou exagero de sintomas'], berg: ['Berg', 14, 0, 4, s => s, '/56', v => v <= 20 ? 'alto risco de queda' : v <= 40 ? 'risco moderado de queda' : 'baixo risco de queda'], womac: ['WOMAC', 24, 0, 4, s => s / 96 * 100, '/100 (maior = pior)', v => ''], dash: ['DASH', 30, 1, 5, s => (s / 30 - 1) * 25, '/100 (maior = pior)', v => ''], tug: ['TUG (segundos)', 1, 0, 120, s => s, 's', v => v >= 12 ? '12 s ou mais: possível risco de queda (referência para idosos)' : 'abaixo de 12 s']
};

const ALLP = [...AP, ['tonus', 'Tônus e reflexos'], ['ausc', 'Ausculta, padrão respiratório e SpO₂'], ['pelv', 'Assoalho pélvico (força, tônus, funções)']];

const ESP = {
    orto: ['Ortopedia / traumatologia', ['loc', 'insp', 'adm', 'for', 'marcha', 'testes']], neuro: ['Neurologia', ['insp', 'for', 'sens', 'marcha', 'testes', 'tonus']], resp: ['Respiratória', ['loc', 'insp', 'ausc', 'testes']], pelv: ['Saúde pélvica', ['loc', 'insp', 'for', 'pelv', 'testes']]
};

const LOGO = `<svg viewBox='0 0 32 32' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' aria-hidden='true'><path d='M16 1v30' stroke-dasharray='1 3'/><rect x='8' y='3.5' width='14' height='7' rx='3.5' fill='var(--card)'/><rect x='10' y='12.5' width='14' height='7' rx='3.5' fill='var(--card)'/><rect x='8' y='21.5' width='14' height='7' rx='3.5' fill='var(--card)'/></svg>`;

const ROLES = {
    admin: 'Administrador', fisio: 'Fisioterapeuta', recep: 'Recepção'
}, ROLE = () => PREF.role || 'fisio';

const IC = {
    dash: '<path d="M3 11l9-8 9 8"/><path d="M5 9.5V20h14V9.5"/>', pac: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.800 3-6 6.500-6s5.900 2.200 6.500 6"/><path d="M16 4.500a3.500 3.500 0 010 7"/><path d="M18.500 14.200c1.700.8 2.700 2.700 3 5.800"/>', ag: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>', sess: '<path d="M4 20l1-4.500L16 4.500 19.500 8 8.500 19z"/>', evo: '<path d="M3 17l6-6 4 4 8-9"/><path d="M15 6h6v6"/>', usr: '<path d="M12 3l8 3v6c0 4.500-3.200 7.500-8 9-4.800-1.500-8-4.500-8-9V6z"/>', set: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>', list: '<path d="M8 6h13M8 12h13M8 18h13M3.500 6h.01M3.500 12h.01M3.500 18h.01"/>', clip: '<path d="M20 11.500l-8 8a5 5 0 01-7-7l8.500-8.500a3.300 3.300 0 014.700 4.700L10 17a1.700 1.700 0 01-2.400-2.400L15 7"/>', meta: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.500"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', rev: '<path d="M20 11a8 8 0 00-14-4L4 9"/><path d="M4 4v5h5"/><path d="M4 13a8 8 0 0014 4l2-2"/><path d="M20 20v-5h-5"/>'
};

const ic = n => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

IC.cfg = IC.set;

IC.lib = '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 21V5"/>';

IC.rel = '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>';

IC.fin = '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2c-.6-.8-1.5-1.2-2.6-1.2-1.5 0-2.5.8-2.5 2s1 1.8 2.6 2.1c1.6.3 2.6.9 2.6 2.1s-1.1 2-2.7 2c-1.2 0-2.2-.5-2.8-1.4M12 6v2M12 16v2"/>';
