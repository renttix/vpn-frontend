import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                },
                'vpn-blue': '#1a2238',
                'vpn-white': '#ffffff',
                'vpn-gray': {
                    DEFAULT: '#222222', // Darkened for better contrast
                    light: '#595959', // Darkened from #666666 for better contrast on light backgrounds
                    dark: '#e0e0e0' // Light gray for dark mode
                },
                'vpn-red': '#d72638',
                'vpn-bg': '#f5f5f7',
                'ad-bg': {
                    DEFAULT: '#f8f8f8', // Light background for ads in light mode
                    dark: '#1e1e24' // Slightly lighter than main dark background
                },
                'ad-border': {
                    DEFAULT: '#e5e5e5', // Subtle border for ads in light mode
                    dark: '#2a2a35' // Subtle border for ads in dark mode
                },
                'beast-red': '#bb3654', // keeping for backward compatibility
                'beast-bg': '#fbfbfb', // keeping for backward compatibility
                'beast-dark': '#282833', // keeping for backward compatibility
                'beast-gray': '#9b9da3', // keeping for backward compatibility
            },
            fontFamily: {
                sans: ["Roboto", ...fontFamily.sans],
                serif: ["Roboto", ...fontFamily.sans],
                heading: ["Roboto", "sans-serif"],
                body: ["Roboto", "sans-serif"],
                // keeping old fonts for backward compatibility but using Roboto
                druk: ['Roboto', 'sans-serif'],
                drukit: ['Roboto', 'sans-serif'],
                helvetica: ['Roboto', 'sans-serif'],
                georgia: ['Roboto', 'sans-serif'],
                // headline font now using Roboto
                headline: ['Roboto', 'sans-serif'],
            },
            fontSize: {
                // Enhanced typography scale for better hierarchy
                'xs': ['0.75rem', { lineHeight: '1.1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.6rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.85rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1.2' }],
                '6xl': ['3.75rem', { lineHeight: '1.1' }],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            spacing: {
                // Add custom spacing values
                '18': '4.5rem',
                '68': '17rem',
                '84': '21rem',
                '96': '24rem',
                '128': '32rem',
            },
            container: {
                center: true,
                padding: {
                    DEFAULT: '1rem',
                    sm: '2rem',
                    lg: '4rem',
                    xl: '5rem',
                    '2xl': '6rem',
                },
                screens: {
                    sm: '640px',
                    md: '768px',
                    lg: '1024px',
                    xl: '1280px',
                    '2xl': '1536px',
                },
            },
            zIndex: {
                '100': '100',
                '999': '999',
            },
        }
    },
    plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
