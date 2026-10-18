// ── Shared strata base tokens ─────────────────────────────────────────────────
const base = (theme) => ({
    error:   { main: '#ff4444', light: '#ff7070', dark: '#cc1f1f' },
    success: { main: '#52984a', light: '#6dbd63', dark: '#2d5428' },
    warning: { main: '#FF8C42', light: '#ffad72', dark: '#c45a10' },
    info:    { main: '#4a9eff', light: '#7ab8ff', dark: '#1a6fcc' },
    text: {
        main:  '#ffffff',
        alt:   'rgba(255,255,255,0.55)',
        info:  'rgba(255,255,255,0.35)',
        light: '#ffffff',
        dark:  '#000000',
    },
    alt: {
        green:     '#52984a',
        greenDark: '#244a20',
    },
    border: {
        main:    'rgba(255,255,255,0.07)',
        light:   'rgba(255,255,255,0.12)',
        dark:    'rgba(0,0,0,0.5)',
        input:   'rgba(255,255,255,0.12)',
        divider: 'rgba(255,255,255,0.07)',
    },
    secondary: {
        main:          '#0f0f0f',
        light:         '#1a1a1a',
        dark:          '#0a0a0a',
        contrastText:  '#ffffff',
    },
    mode: theme,
});

export const StandardPalette = (theme) => ({
    ...base(theme),
    primary: {
        main:         '#FF5C3A',
        light:        '#FF8C42',
        dark:         '#cc3a1e',
        contrastText: '#ffffff',
    },
});

export const LSPDPalette = (theme) => ({
    ...base(theme),
    primary: {
        main:         '#c9a84c',
        light:        '#e0c06a',
        dark:         '#8a6e28',
        contrastText: '#ffffff',
    },
});

export const GuardiusPalette = (theme) => ({
    ...base(theme),
    primary: {
        main:         '#c9a84c',
        light:        '#e0c06a',
        dark:         '#8a6e28',
        contrastText: '#ffffff',
    },
});

export const BCSOPalette = (theme) => ({
    ...base(theme),
    primary: {
        main:         '#c49a3c',
        light:        '#d9b85e',
        dark:         '#8a6a22',
        contrastText: '#ffffff',
    },
});

export const SASTPalette = (theme) => ({
    ...base(theme),
    primary: {
        main:         '#677aa8',
        light:        '#8fa3c8',
        dark:         '#3d5080',
        contrastText: '#ffffff',
    },
});

export const DOJPalette = (theme) => ({
    ...base(theme),
    primary: {
        main:         '#009688',
        light:        '#4db6ac',
        dark:         '#00675b',
        contrastText: '#ffffff',
    },
});

export const MedicalPalette = (theme) => ({
    ...base(theme),
    primary: {
        main:         '#4a9eff',
        light:        '#7ab8ff',
        dark:         '#1a6fcc',
        contrastText: '#ffffff',
    },
});

export const GetDeptPalette = (workplace, theme) => {
    switch (workplace) {
        case 'lspd':        return LSPDPalette(theme);
        case 'bcso':        return BCSOPalette(theme);
        case 'sast':        return SASTPalette(theme);
        case 'guardius':    return GuardiusPalette(theme);
        case 'doj':
        case 'dattorney':
        case 'mayoroffice': return DOJPalette(theme);
        case 'doctors':
        case 'safd':        return MedicalPalette(theme);
        default:            return StandardPalette(theme);
    }
};
