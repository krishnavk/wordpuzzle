let gameInstance = {
  gameData: {},
  triesLeft: 0,
  enteredAnswer: [],
  wrongAnswers: [],
  clues: [],
  status: "Failed",
};

const row1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const row2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const row3 = ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"];

const fetchGameData = async () => {
  const res = await fetch("gameData.json");
  if (res.status === 200) {
    return await res.json();
  } else {
    throw new Error("Unable to fetch game data");
  }
};

const onLoad = async () => {
  const data = await fetchGameData();
  gameInstance.gameData = data["crostiny-clues"][0];
  gameInstance.clues = Object.keys(gameInstance.gameData)
    .filter((key) => key.match(/Attempt\dClue/i) && gameInstance.gameData[key])
    .map((key) => gameInstance.gameData[key]);
  gameInstance.triesLeft = gameInstance.clues.length;
  updateDOM(`Theme: ${gameInstance.gameData.Theme}`, ".theme", "string");
  updateDOM(
    `Puzzle#: ${gameInstance.gameData["Puzzle no"]}`,
    ".puzzle-num",
    "string"
  );
  updateDOM(printHearts(), ".hearts", "array");
  updateDOM(printOptions(), ".clue-list", "array");
  updateDOM(
    `<span class='square'></span><span class='grey small-font'>(${gameInstance.gameData.enum} letters)</span>`,
    ".user-text",
    "string"
  );
  printKeyBoard();
};

const printKeyBoard = () => {
  row1.forEach((key) => {
    const buttonElement = createDOMElement("button");
    buttonElement.textContent = key;
    buttonElement.setAttribute("id", key);
    buttonElement.addEventListener("click", () => handleClick(key));
    updateDOM(buttonElement, ".row1", "list");
  });
  row2.forEach((key) => {
    const buttonElement = createDOMElement("button");
    buttonElement.textContent = key;
    buttonElement.setAttribute("id", key);
    buttonElement.addEventListener("click", () => handleClick(key));
    updateDOM(buttonElement, ".row2", "list");
  });
  row3.forEach((key) => {
    const buttonElement = createDOMElement("button");
    buttonElement.textContent = key;
    buttonElement.setAttribute("id", key);
    buttonElement.addEventListener("click", () => handleClick(key));
    updateDOM(buttonElement, ".row3", "list");
  });
};

const handleClick = (letter) => {
  if (letter === "DEL") {
    deleteLetter();
  } else if (letter === "ENTER") {
    verifyEndGame();
  } else {
    addLetter(letter);
  }
};

const deleteLetter = () => {
  if (gameInstance.enteredAnswer.length) {
    gameInstance.enteredAnswer.pop()
    resetSquare();
  }
}

const addLetter = (letter) => {
  if (gameInstance.enteredAnswer.length < gameInstance.gameData.enum) {
    gameInstance.enteredAnswer.push(letter)
    resetSquare();
  }
}

const printHearts = () => {
  return iterateElement(
    '<i class="fas fa-heart red"></i>',
    "hearts",
    gameInstance.triesLeft
  ).map((ele) => ele.outerHTML);
};

const printStars = () => {
  return iterateElement(
    '<i class="fas fa-star coral"></i>',
    "stars",
    gameInstance.triesLeft
  ).map((ele) => ele.outerHTML);
};

const printOptions = () => {
  return iterateElement(
    "<div class='clue'></div>",
    "clues",
    gameInstance.clues.length - gameInstance.triesLeft + 1
  ).map((ele, index) => {
    ele.innerHTML = gameInstance.clues[index];
    return ele.outerHTML;
  });
};

const iterateElement = (element, selector, times) => {
  let elementArray = new Array(times).fill(element);
  let parser = new DOMParser();
  return elementArray.map((ele, index) => {
    let htmlElement = parser.parseFromString(ele, "text/html").body.firstChild;
    htmlElement.classList.add(selector + index);
    htmlElement.id = selector + "-" + index;
    return htmlElement;
  });
};

const resetSquare = () => {
  updateDOM(gameInstance.enteredAnswer.join(""), '.square', 'string')
};

const updateDOM = (data, element, type) => {
  switch (type) {
    case "string":
      document.querySelector(element).innerHTML = data;
      break;
    case "array":
      document.querySelector(element).innerHTML = data.join(" ");
      break;
    case "list":
      document.querySelector(element).append(data);
      break;
  }
};

const createDOMElement = (element) => {
  return document.createElement(element)
}

const showDOMElement = (element) => {
  document.querySelector(element).classList.remove("hide");
  document.querySelector(element).classList.add("show");
};

const hideDOMElement = (element) => {
  document.querySelector(element).classList.remove("show");
  document.querySelector(element).classList.add("hide");
};

const addClassToDOMElement = (element, className) => {
  document.querySelector(element).classList.add(className);
};

const getValueOfDOMElement = (element, type) => {
  switch (type) {
    case "value":
      return document.querySelector(element).value;
    case "html":
      return document.querySelector(element).innerHTML;
  }
};

const getDOMElementByQuerySelector = (element) => {
  return document.querySelector(element).value;
};

const verifyEndGame = () => {
  showDOMElement(".explanation");
  if (
    gameInstance.enteredAnswer.join("").toUpperCase() ==
    gameInstance.gameData.correctanswer.toUpperCase()
  ) {
    showSuccessMsg();
  } else {
    gameInstance.triesLeft--;
    if (gameInstance.triesLeft > 0) {
      continueGameAndShowNextOption();
    } else {
      showFailureMsg();
    }
  }
};

const showSuccessMsg = () => {
  gameInstance.status = "completed";
  buildImage();
  hideDOMElement(".key-container");
  showDOMElement(".endMessage");
  updateDOM("Congrats!!!", ".endMessageText", "string");
  addClassToDOMElement(".endMessageText", "coral");
  showExplanation();
};

const showFailureMsg = () => {
  buildImage();
  updateDOM(printHearts(), ".hearts", "array");
  hideDOMElement(".key-container");
  showDOMElement(".endMessage");
  updateDOM("Hard Luck", ".endMessageText", "string");
  addClassToDOMElement(".endMessageText", "red");
  showExplanation();
};

const showExplanation = () => {
  if (gameInstance.gameData.answerexplanation) {
    updateDOM(
      `Answer Explanation: ${gameInstance.gameData.answerexplanation}`,
      ".explanation",
      "string"
    );
  }
};

const continueGameAndShowNextOption = () => {
  gameInstance.wrongAnswers.push(
    gameInstance.enteredAnswer.join("").toUpperCase()
  );
  gameInstance.enteredAnswer = []
  resetSquare();
  updateDOM(printOptions(), ".clue-list", "array");
  updateDOM(printHearts(), ".hearts", "array");
  if (gameInstance.wrongAnswers.length) {
    updateDOM(
      `Attempts: ${gameInstance.wrongAnswers.join(", ")}`,
      ".explanation",
      "string"
    );
  }
};

const buildImage = () => {
  updateDOM(`Theme: ${gameInstance.gameData.Theme}`, ".themeImage", "string");
  updateDOM(
    `Puzzle Number: ${gameInstance.gameData["Puzzle no"]}`,
    ".puzzuleNumIamge",
    "string"
  );
  updateDOM(
    `Clue: ${gameInstance.clues[0]}(${gameInstance.gameData.enum})`,
    ".clueImage",
    "string"
  );
  updateDOM(
    `Crostiny: ${printStars().join(" ")} ${
      gameInstance.status === "completed"
        ? "Champ"
        : "Atleast I tried. And you?"
    }`,
    ".resultImage",
    "string"
  );
};

const copyImage = () => {
  html2canvas(document.querySelector(".shareImage"), {
    width: 350,
    height: 200,
  }).then((canvas) =>
    canvas.toBlob((blob) => {
      saveAs(
        blob,
        `crostiny-${
          gameInstance.gameData.Theme ? `${gameInstance.gameData.Theme}-` : ""
        }${gameInstance.gameData["Puzzle no"]}.jpeg`
      );
      navigator.clipboard
        .write([new ClipboardItem({ "image/png": blob })])
        .then(() => console.log("copy successful"))
        .catch((error) => console.log("copy unsuccessful due to ", error));
    })
  );
};

onLoad();
