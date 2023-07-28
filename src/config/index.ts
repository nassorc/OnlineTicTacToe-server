import "dotenv/config";

export const config = {
  API: {
    URL: process.env.URL,
    PORT: process.env.PORT
  },
  DB: {
    URL: process.env.DATBASE_URL
  },
  GAME: {
    MAX_GAMES: process.env.GAME_MAX_WINS
  }
  
}