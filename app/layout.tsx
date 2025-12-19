import React from 'react';
import { CartProvider } from '../components/CartContext';
import { ProductsProvider } from '../components/ProductsContext';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shore to Door - Premium Kerala Fresh Fish',
  description: 'B2B Wholesale Fish Ordering System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Malayalam:wght@400;500;700&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com" suppressHydrationWarning></script>
        <script suppressHydrationWarning dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                    display: ['Poppins', 'Inter', 'sans-serif'],
                    malayalam: ['"Noto Sans Malayalam"', 'sans-serif'],
                  },
                  colors: {
                    ocean: {
                        50: '#f0f9ff',
                        100: '#e0f2fe',
                        200: '#bae6fd',
                        300: '#7dd3fc',
                        400: '#38bdf8',
                        500: '#0ea5e9',
                        600: '#0284c7',
                        700: '#0369a1',
                        800: '#075985',
                        900: '#0c4a6e',
                        950: '#082f49',
                    },
                    seafoam: {
                        50: '#ecfdf5',
                        100: '#d1fae5',
                        200: '#a7f3d0',
                        300: '#6ee7b7',
                        400: '#34d399',
                        500: '#10b981',
                        600: '#059669',
                        700: '#047857',
                        800: '#065f46',
                        900: '#064e3b',
                        950: '#022c22',
                    },
                    slate: {
                        50: '#f8fafc',
                        100: '#f1f5f9',
                        200: '#e2e8f0',
                        300: '#cbd5e1',
                        400: '#94a3b8',
                        500: '#64748b',
                        600: '#475569',
                        700: '#334155',
                        800: '#1e293b',
                        900: '#0f172a',
                        950: '#020617',
                    }
                  },
                  boxShadow: {
                    'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 12px -4px rgba(0, 0, 0, 0.05)',
                    'card': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
                    'hover': '0 12px 24px -4px rgba(0, 0, 0, 0.08), 0 8px 16px -8px rgba(0, 0, 0, 0.08)',
                    'floating': '0 20px 40px -8px rgba(0, 0, 0, 0.12), 0 12px 24px -12px rgba(0, 0, 0, 0.12)',
                    'glow': '0 0 20px -5px rgba(14, 165, 233, 0.3)',
                    'glow-green': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
                  },
                  animation: {
                    'fadeIn': 'fadeIn 0.3s ease-out',
                    'slideUp': 'slideUp 0.4s ease-out',
                    'scaleIn': 'scaleIn 0.2s ease-out',
                    'shimmer': 'shimmer 2s infinite',
                    'bounce-slow': 'bounce 3s infinite',
                  },
                  keyframes: {
                    fadeIn: {
                      '0%': { opacity: '0', transform: 'translateY(10px)' },
                      '100%': { opacity: '1', transform: 'translateY(0)' },
                    },
                    slideUp: {
                      '0%': { opacity: '0', transform: 'translateY(20px)' },
                      '100%': { opacity: '1', transform: 'translateY(0)' },
                    },
                    scaleIn: {
                      '0%': { opacity: '0', transform: 'scale(0.95)' },
                      '100%': { opacity: '1', transform: 'scale(1)' },
                    },
                    shimmer: {
                      '0%': { backgroundPosition: '-1000px 0' },
                      '100%': { backgroundPosition: '1000px 0' },
                    },
                  },
                  backdropBlur: {
                    xs: '2px',
                  },
                  borderRadius: {
                    '2xl': '1rem',
                    '3xl': '1.5rem',
                    '4xl': '2rem',
                  },
                }
              }
            }
          `
        }} />
      </head>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased selection:bg-ocean-100 selection:text-ocean-900">
        <ProductsProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
