/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "oldschool-orange": "#FFA500",
        "newschool-orange": "#F98404",
        "telegram-blue": "#54A9EB",
      },
    },
  },
  plugins: [],
}
