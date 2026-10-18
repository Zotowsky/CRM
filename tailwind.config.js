/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          cherry: '#670626', // Глубокий бордовый (Вишня)
          matcha: '#BAD797', // Светло-зеленый (Матча)
          'matcha-light': '#F3F8EF', // Очень светлый фон для страниц
          'matcha-dark': '#9CB87C', // Темнее матчи для ховеров и границ
          'matcha-border': '#D5E8C3', // Цвет рамок карточек
        }
      },
    },
    plugins: [],
  }