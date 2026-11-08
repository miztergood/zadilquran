/**
 * ============================================================================
 * ZADIL QURAN - TAILWIND THEME CONFIGURATION (js/tailwind-config.js)
 * Palet Resmi Lembaga: Primary Crimson Maroon (#9a2024) & Secondary Pine Green (#1c6b45)
 * ============================================================================
 */
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                fontFamily: { sans: ['Inter', 'sans-serif'] },
                colors: {
                    primary: {
                        50: '#fdf2f2',
                        100: '#fde8e8',
                        200: '#f9c5c7',
                        300: '#f29fa3',
                        400: '#e56b71',
                        500: '#9a2024',
                        600: '#871a1e',
                        700: '#731417',
                        800: '#5f1013',
                        900: '#480a0c',
                        DEFAULT: '#9a2024'
                    },
                    secondary: {
                        50: '#edf7f2',
                        100: '#d7efe3',
                        200: '#b2dfc8',
                        300: '#83c9a6',
                        400: '#52ad82',
                        500: '#1c6b45',
                        600: '#165737',
                        700: '#12452c',
                        800: '#0e3421',
                        900: '#092316',
                        DEFAULT: '#1c6b45'
                    },
                    darkbg: '#0f172a',
                    darkcard: '#1e293b',
                    darkborder: '#334155'
                }
            }
        }
    };
}
