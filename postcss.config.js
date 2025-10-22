// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},  // ✅ le bon plugin Tailwind à jour
    autoprefixer: {},            // ✅ pour la compatibilité navigateurs
  },
};

