export const GROUP_THEMES = {
  ACTIONS_MOVIES: ["Die Hard", "Terminator", "Matrix", "John Wick", "Mad Max", "Gladiator"],
  APEX_PREDATORS: ["Lions", "Great Whites", "Grizzlies", "Orcas", "Komodo Dragons", "Tigers"],
  AVENGERS: ["Iron Man", "Captain America", "Thor", "Hulk", "Black Widow", "Hawkeye"],
  CEREAL: ["Captain Crunch", "Fruit Loops", "Lucky Charms", "Frosted Flakes", "Cocoa Puffs"],
  COLORS: ["Neon Blue", "Electric Lime", "Hot Pink", "Cyber Yellow", "Ultra Violet"],
  DOG_BREEDS: ["Golden Retriever", "German Shepherd", "Labrador", "Bulldog", "Beagle"],
  FAST_FOOD: ["McDonalds", "Burger King", "Wendys", "Taco Bell", "Chick-fil-A"],
  HARRY_POTTER: ["Gryffindor", "Slytherin", "Hufflepuff", "Ravenclaw", "Potter"],
  MARIO_KART: ["Mario", "Luigi", "Bowser", "Peach", "Yoshi"],
  NBA_TEAMS: ["Lakers", "Celtics", "Warriors", "Bulls", "Heat"],
  PLANETS: ["Mercury", "Venus", "Earth", "Mars", "Jupiter"],
  POKEMON: ["Pikachu", "Charizard", "Squirtle", "Bulbasaur", "Jigglypuff"],
  SHOE_BRANDS: ["Nike", "Adidas", "New Balance", "Saucony", "Brooks"],
  STAR_WARS: ["Jedi", "Sith", "Droid", "Wookiee", "Mandalorian"],
  SUPERHEROES: ["Superman", "Batman", "Spiderman", "Wonder Woman", "Flash"],
  TAYLOR_SWIFT: ["Fearless", "Red", "1989", "Reputation", "Lover"],
  VEGETABLES: ["Carrot", "Broccoli", "Corn", "Potato", "Spinach"],
  VIDEO_GAMES: ["Minecraft", "Roblox", "Fortnite", "Call of Duty", "Zelda"],
  WEATHER: ["Tornado", "Hurricane", "Blizzard", "Tsunami", "Lightning"],
  WWE: ["The Rock", "John Cena", "Undertaker", "Stone Cold", "Hulk Hogan"]
};

export const getRandomTheme = () => {
  const keys = Object.keys(GROUP_THEMES);
  return keys[Math.floor(Math.random() * keys.length)] as keyof typeof GROUP_THEMES;
};