module.exports = {
  // 1. Specifica dove Tailwind deve cercare le classi utilizzate
  content: [
    "./src/**/*.{html,js}", // Tutti i file HTML/JS nelle sottocartelle di src/
    "./src/*.{html,js}", // File HTML/JS direttamente in src/
  ],

  // 2. Personalizza il tema (colori, font, ecc.)
  theme: {
    extend: {}, // Puoi estendere le impostazioni predefinite qui
  },

  // 3. Aggiungi plugin Tailwind (opzionali)
  plugins: [],
};
