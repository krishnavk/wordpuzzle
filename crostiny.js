let gameInstance = {
  gameData: {},
  triesLeft: 0,
  wrongAnswers: [],
  clues: [],
  status: "Failed",
};

fetchGameData = async () => {
  const res = await fetch("gameData.json");
  if (res.status === 200) {
    return await res.json();
  } else {
    throw new Error("Unable to fetch game data");
  }
};

onLoad = async () => {
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
    `<input class='square' id='text-entered' type='text' maxlength='${gameInstance.gameData.enum}' autofocus/><span class='grey small-font'>(${gameInstance.gameData.enum} letters)</span>`,
    ".user-text",
    "string"
  );
};


printHearts = () => {
  return iterateElement(
    '<i class="fas fa-heart red"></i>',
    "hearts",
    gameInstance.triesLeft
  ).map((ele) => ele.outerHTML);
};

printStars = () => {
  return iterateElement(
    '<i class="fas fa-star coral"></i>',
    "stars",
    gameInstance.triesLeft
  ).map((ele) => ele.outerHTML);
};

printOptions = () => {
  return iterateElement(
    "<div class='clue'></div>",
    "clues",
    gameInstance.clues.length - gameInstance.triesLeft + 1
  ).map((ele, index) => {
    ele.innerHTML = gameInstance.clues[index];
    return ele.outerHTML;
  });
};

iterateElement = (element, selector, times) => {
  let elementArray = new Array(times).fill(element);
  let parser = new DOMParser();
  return elementArray.map((ele, index) => {
    let htmlElement = parser.parseFromString(ele, "text/html").body.firstChild;
    htmlElement.classList.add(selector + index);
    htmlElement.id = selector + "-" + index;
    return htmlElement;
  });
};

resetSquares = () => {
  document.querySelector("#text-entered").value = "";
  document.querySelector("#text-entered").focus();
};

updateDOM = (data, element, type) => {
  switch (type) {
    case "string":
      document.querySelector(element).innerHTML = data;
      break;
    case "array":
      document.querySelector(element).innerHTML = data.join(" ");
      break;
  }
};

showDOMElement = (element) => {
  document.querySelector(element).classList.remove("hide");
  document.querySelector(element).classList.add("show");
};

hideDOMElement = (element) => {
  document.querySelector(element).classList.remove("show");
  document.querySelector(element).classList.add("hide");
};

addClassToDOMElement = (element, className) => {
  document.querySelector(element).classList.add(className);
};

getValueOfDOMElement = (element, type) => {
  switch (type) {
    case "value":
      return document.querySelector(element).value;
    case "html":
      return document.querySelector(element).innerHTML;
  }
};

getDOMElementByQuerySelector = (element) => {
 return document.querySelector(element).value;
}

verifyEndGame = () => {
  showDOMElement(".explanation");
  if (
    getValueOfDOMElement("#text-entered", "value").toUpperCase() ==
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

showSuccessMsg = () => {
  gameInstance.status = "completed";
  buildImage();
  hideDOMElement(".submit");
  showDOMElement(".endMessage");
  updateDOM("Congrats!!!", ".endMessageText", "string");
  addClassToDOMElement(".endMessageText", "coral");
  showExplanation();
};

showFailureMsg = () => {
  buildImage();
  updateDOM(printHearts(), ".hearts", "array");
  hideDOMElement(".submit");
  showDOMElement(".endMessage");
  updateDOM("Hard Luck", ".endMessageText", "string");
  addClassToDOMElement(".endMessageText", "red");
  showExplanation();
};

showExplanation = () => {
  if (gameInstance.gameData.answerexplanation) {
    updateDOM(
      `Answer Explanation: ${gameInstance.gameData.answerexplanation}`,
      ".explanation",
      "string"
    );
  }
};

continueGameAndShowNextOption = () => {
  gameInstance.wrongAnswers.push(
    getValueOfDOMElement("#text-entered", "value").toUpperCase()
  );
  resetSquares();
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

buildImage = () => {
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

copyImage = () => {
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
