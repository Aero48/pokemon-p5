let playerData = {
  pokeballs: {
    poke: 99,
    great: 99,
    ultra: 99,
    master: 99,
  },

  berries: {
    razz: 99,
    nanab: 99,
    pinap: 99,
  },
};

let locationPokemon = [
  {
    name: "pidgey",
    poolVal: 30,
    minLevel: 5,
    maxLevel: 10,
  },
  {
    name: "tentacruel",
    poolVal: 30,
    minLevel: 20,
    maxLevel: 30,
  },
  {
    name: "ditto",
    poolVal: 20,
    minLevel: 20,
    maxLevel: 30,
  },
  {
    name: "drifblim",
    poolVal: 20,
    minLevel: 20,
    maxLevel: 30,
  },
];

let pokemon;
let trainer;

let ballBtn;
let itemBtn;
let runBtn;

let pokeX = -56;
let pokeY = 0;

let trainerX = 208;
let trainerY = 48;
let canvasScale = 4;

let targetPokeX = -56;
let targetPokeY = 0;

let targetTrainerX = 208;
let targetTrainerY = 48;

let encounterPokemon;
let encounterLevel;

let encounterText = "";

let throwMod = 20;

let pokeFont;

// Booleans

// True when in a Pokemon Encounter
let inEncounter = true;
// True when encounter is interactable (after animation is complete)
let encounterInteract = false;
// True when encounter menu is interactive
let encounterMenu = false;

// Indicates the current interactable menu
let currentMenu = "none";

// Indicates if a berry is active
let activeBerry = "none";

// Indicates whether next click ends the encounter
let encounterNearlyDone = false;

// is screen grayscale? (encounter only)
let grayscale = false;

// Updates canvas size depending on window width
function updateCanvasScale() {
  if (windowWidth > 1000) {
    canvasScale = 4;
  } else if (windowWidth > 600) {
    canvasScale = 3;
  } else if (windowWidth > 360) {
    canvasScale = 2;
  } else {
    canvasScale = 1;
  }
}

// Runs before encounter starts
async function preEncounter(poke) {
  await $.getJSON(
    `https://pokeapi.co/api/v2/pokemon-species/${poke.name}`,
    function (data) {
      encounterPokemon = data;
    }
  );

  encounterLevel = Math.floor(
    Math.random() * (poke.maxLevel - poke.minLevel) + poke.minLevel
  );

  // Delay for encounter start animation
  setTimeout(() => {
    encounter(encounterPokemon.name);
  }, 3000);
}

// Runs when preEncounter is finished
async function encounter(poke) {
  pokemon = await loadImage(`./images/${poke}.png`);
  targetPokeX = 96;
  targetTrainerX = 16;
  grayscale = true;

  // Ensures everything is set up within the given time (p5 animations can get out of sync)
  setTimeout(() => {
    encounterText = `Wild  ${encounterPokemon.name.toUpperCase()} appeared!`;
    pokeX = 96;
    trainerX = 16;
    encounterInteract = true;
  }, 1270);
}

// Displays menu options when ready
function showEncounterMenu() {
  encounterMenu = true;
  encounterText = "";
  setTimeout(() => {
    currentMenu = "main";
  }, 10);
}

// Pool randomizer for wild Pokemon
function randomPokemon(pokeList) {
  let totalPool = 0;
  let randomGen = Math.random();

  pokeList.forEach((pokemon) => {
    totalPool += pokemon.poolVal;
  });
  let randomNum = randomGen * totalPool;

  let poolIteration = 0;
  for (let i = 0; i < pokeList.length; i++) {
    poolIteration += pokeList[i].poolVal;
    if (randomNum < poolIteration) {
      return pokeList[i];
    }
  }
}

// Runs for every "ball wobble" when attempting to catch a Pokemon
function ballWobble(y) {
  let randValue = Math.random() * 65535;
  if (randValue >= y) {
    return true;
  } else {
    return false;
  }
}

// Runs all necessary calculations for capturing a Pokemon (nasty code. need to look into later)
function calcCatch(catchRate, level, ball) {
  let throwBonus;
  if (level - throwMod > 1) {
    throwBonus = level - throwMod;
  } else {
    throwBonus = 1;
  }

  console.log("catch rate: " + catchRate);
  console.log("level: " + level);
  console.log("ball: " + ball);
  console.log("throw bonus: " + throwBonus);

  let x =
    (((3 * level - 2 * throwBonus) * (catchRate * ball)) / (3 * level)) * 1;
  console.log("X: " + x);
  let y = Math.floor(65535 / Math.sqrt(Math.sqrt(255 / x)));
  console.log("Y: " + y);
  if (x > 255) {
    y = 65536;
  }
  setTimeout(() => {
    if (ballWobble(y)) {
      console.log("Oh no! The Pokémon broke free!");
      currentMenu = "none";
      encounterMenu = false;
      encounterText = "Oh no! The Pokémon broke free!";
      return;
    } else {
      console.log("wobble");
      setTimeout(() => {
        if (ballWobble(y)) {
          console.log("Aww! It appeared to be caught!");
          currentMenu = "none";
          encounterMenu = false;
          encounterText = "Aww! It appeared to be caught!";
          return;
        } else {
          console.log("wobble");
          setTimeout(() => {
            if (ballWobble(y)) {
              console.log("Aargh! Almost had it!");
              currentMenu = "none";
              encounterMenu = false;
              encounterText = "Aargh! Almost had it!";
              return;
            } else {
              console.log("wobble");
              setTimeout(() => {
                if (ballWobble(y)) {
                  console.log("Shoot! It was so close, too!");
                  currentMenu = "none";
                  encounterMenu = false;
                  encounterText = "Shoot! It was so close, too!";
                  return;
                } else {
                  console.log("caught!");
                  currentMenu = "none";
                  encounterMenu = false;
                  encounterNearlyDone = true;
                  encounterText = `Gotcha! ${encounterPokemon.name.toUpperCase()} was caught!`;
                }
              }, 1500);
            }
          }, 1500);
        }
      }, 1500);
    }
  }, 4000);
}

// Resets variables when encounter is complete
function encounterComplete() {
  currentMenu = "none";
  encounterMenu = false;
  encounterInteract = false;
  inEncounter = false;
  activeBerry = "none";
  encounterNearlyDone = false;
}

// Preload function for p5. Loads static image files
function preload() {
  pokeFont = loadFont("./css/fonts/pokefont.ttf");
  pokemon = loadImage("./images/ditto.png");
  trainer = loadImage("./images/trainer.png");
  textbox = loadImage("./images/textbox.png");
  smallMenu = loadImage("./images/small_menu.png");

  pokemonUI = loadImage("./images/pokemon_ui.png");
  levelIcon = loadImage("./images/lvl_icon.png");

  ballBtn = loadImage("./images/ball_btn.png");
  itemBtn = loadImage("./images/item_btn.png");
  runBtn = loadImage("./images/run_btn.png");

  pokeballBtn = loadImage("./images/pokeball_btn.png");
  greatballBtn = loadImage("./images/greatball_btn.png");
  ultraballBtn = loadImage("./images/ultraball_btn.png");
}

// Setup function for p5. Initializes canvas & fonts
function setup() {
  updateCanvasScale();
  cvs = createCanvas(160 * canvasScale, 144 * canvasScale);
  cvs.position(windowWidth / 2 - (160 * canvasScale) / 2, 200);

  textFont(pokeFont);

  preEncounter(randomPokemon(locationPokemon)); //TEMPORARY
  //encounter(encounterPokemon);
}

// Runs every frame in p5.
function draw() {
  background(100);

  // Everything to render only during an encounter
  if (inEncounter) {
    if (pokeX < targetPokeX) {
      pokeX += 2;
    } else {
      grayscale = false;
    }

    if (trainerX > targetTrainerX) {
      trainerX -= 2.5;
    }
    // Encounter Elements
    trainer.resizeNN(48 * canvasScale, 48 * canvasScale);
    textbox.resizeNN(160 * canvasScale, 48 * canvasScale);
    smallMenu.resizeNN(96 * canvasScale, 48 * canvasScale);
    pokemon.resizeNN(56 * canvasScale, 56 * canvasScale);

    image(pokemon, pokeX * canvasScale, pokeY * canvasScale);
    image(trainer, trainerX * canvasScale, trainerY * canvasScale);
    image(textbox, 0, 96 * canvasScale);
    textSize(8 * canvasScale);
    textLeading(16 * canvasScale);
    textWrap(WORD);
    text(encounterText, 8 * canvasScale, 118 * canvasScale, 144 * canvasScale);

    if (encounterInteract) {
      pokemonUI.resizeNN(79 * canvasScale, 15 * canvasScale);
      image(pokemonUI, 9 * canvasScale, 16 * canvasScale);
      levelIcon.resizeNN(8 * canvasScale, 8 * canvasScale);
      image(levelIcon, 48 * canvasScale, 8 * canvasScale);
      textSize(8 * canvasScale);
      text(
        encounterPokemon.name.toUpperCase(),
        8 * canvasScale,
        7.5 * canvasScale
      );
      text(encounterLevel, 56 * canvasScale, 15.5 * canvasScale);
    }

    if (encounterMenu) {
      if (currentMenu == "main") {
        //image(smallMenu, 64*canvasScale, 96*canvasScale);
        ballBtn.resizeNN(48 * canvasScale, 24 * canvasScale);
        itemBtn.resizeNN(48 * canvasScale, 24 * canvasScale);
        runBtn.resizeNN(48 * canvasScale, 24 * canvasScale);

        image(ballBtn, 8 * canvasScale, 109 * canvasScale);
        image(itemBtn, 56 * canvasScale, 109 * canvasScale);
        image(runBtn, 104 * canvasScale, 109 * canvasScale);
      }

      if (currentMenu == "ball") {
        pokeballBtn.resizeNN(48 * canvasScale, 24 * canvasScale);
        greatballBtn.resizeNN(48 * canvasScale, 24 * canvasScale);
        ultraballBtn.resizeNN(48 * canvasScale, 24 * canvasScale);

        image(pokeballBtn, 8 * canvasScale, 109 * canvasScale);
        image(greatballBtn, 56 * canvasScale, 109 * canvasScale);
        image(ultraballBtn, 104 * canvasScale, 109 * canvasScale);

        text("x" + playerData.pokeballs.poke, 27 * canvasScale, 126 * canvasScale);
        text("x" + playerData.pokeballs.great, 75 * canvasScale, 126 * canvasScale);
        text("x" + playerData.pokeballs.ultra, 123 * canvasScale, 126 * canvasScale);
      }
    }

    //Filter Code
    if (grayscale == true) {
      filter(GRAY);
    }
  }
}

// Resizes canvas when window is resized
function windowResized() {
  updateCanvasScale();
  resizeCanvas(160 * canvasScale, 144 * canvasScale);
  cvs.position(windowWidth / 2 - (160 * canvasScale) / 2, 200);
}

function screenInteract() {
  //Either moves on to main encounter menu, or ends the encounter depending on booleans
  if (encounterInteract & !encounterMenu) {
    if (!encounterNearlyDone) {
      showEncounterMenu();
    } else {
      encounterComplete();
    }

  }

  if (encounterMenu) {
    // MAIN MENU CLICK LISTENERS
    if (currentMenu == "main") {
      if (
        mouseX > 8 * canvasScale &&
        mouseX < (8 + 48) * canvasScale &&
        mouseY > 109 * canvasScale &&
        mouseY < (109 + 24) * canvasScale
      ) {
        setTimeout(() => {
          currentMenu = "ball";
        }, 10);
        //calcCatch(encounterPokemon.capture_rate, encounterLevel, 2);
      }

      if (
        mouseX > 56 * canvasScale &&
        mouseX < (56 + 48) * canvasScale &&
        mouseY > 109 * canvasScale &&
        mouseY < (109 + 24) * canvasScale
      ) {
        currentMenu = "item";
      }

      if (
        mouseX > 104 * canvasScale &&
        mouseX < (104 + 48) * canvasScale &&
        mouseY > 109 * canvasScale &&
        mouseY < (109 + 24) * canvasScale
      ) {
        encounterNearlyDone = true;
        currentMenu = "none";
        encounterMenu = false;
        encounterText = "Got away safely!";
        //encounterComplete();
      }
    }

    // POKEBALL MENU CLICK LISTENERS
    if (currentMenu == "ball") {
      if (
        mouseX > 8 * canvasScale &&
        mouseX < (8 + 48) * canvasScale &&
        mouseY > 109 * canvasScale &&
        mouseY < (109 + 24) * canvasScale &&
        playerData.pokeballs.poke > 0
      ) {
        calcCatch(encounterPokemon.capture_rate, encounterLevel, 1);
        currentMenu = "none";
        playerData.pokeballs.poke--;
      }

      if (
        mouseX > 56 * canvasScale &&
        mouseX < (56 + 48) * canvasScale &&
        mouseY > 109 * canvasScale &&
        mouseY < (109 + 24) * canvasScale &&
        playerData.pokeballs.great > 0
      ) {
        calcCatch(encounterPokemon.capture_rate, encounterLevel, 1.5);
        currentMenu = "none";
        playerData.pokeballs.great--;
      }

      if (
        mouseX > 104 * canvasScale &&
        mouseX < (104 + 48) * canvasScale &&
        mouseY > 109 * canvasScale &&
        mouseY < (109 + 24) * canvasScale &&
        playerData.pokeballs.ultra > 0
      ) {
        calcCatch(encounterPokemon.capture_rate, encounterLevel, 2);
        currentMenu = "none"
        playerData.pokeballs.ultra--;
      }
    }
  }
}

function mouseClicked() {
  screenInteract();
}

function touchEnded() {
  screenInteract();
}
