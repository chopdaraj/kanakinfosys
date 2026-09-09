/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
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
        black: '#121316',
        blue: {
          50: '#FFF5EF',
          100: '#FFE6D5',
          200: '#FFCDA9',
          300: '#FFAF7D',
          400: '#FF9151',
          500: '#F26522',
          600: '#E45516',
          700: '#C8420A',
          800: '#9C3105',
          900: '#702202',
          950: '#451200',
        },
        purple: {
          50: '#FFF5EF',
          100: '#FFE6D5',
          200: '#FFCDA9',
          300: '#FFAF7D',
          400: '#FF9151',
          500: '#F26522',
          600: '#E45516',
          700: '#C8420A',
          800: '#9C3105',
          900: '#702202',
          950: '#451200',
        },
        violet: {
          50: '#FFF5EF',
          100: '#FFE6D5',
          200: '#FFCDA9',
          300: '#FFAF7D',
          400: '#FF9151',
          500: '#F26522',
          600: '#E45516',
          700: '#C8420A',
          800: '#9C3105',
          900: '#702202',
          950: '#451200',
        },
        indigo: {
          50: '#EBF7F5',
          100: '#D2EFEA',
          200: '#A6DFD5',
          300: '#74CDBC',
          400: '#4FAF9F',
          500: '#4FAF9F',
          600: '#3D9384',
          700: '#31766A',
          800: '#22534A',
          900: '#183B35',
          950: '#0F2622',
        },
        navy: {
          50: '#F8F9FB',
          100: '#F1F3F6',
          200: '#E1E5EB',
          300: '#C2CAD6',
          400: '#A3ADC0',
          500: '#7E8BA3',
          600: '#616F85',
          700: '#4E5A6D',
          800: '#3D4755',
          900: '#2A313C',
          950: '#171B21',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};