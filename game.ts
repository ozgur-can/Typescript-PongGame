(function () {
  var CSS = {
    arena: {
      width: 900,
      height: 600,
      background: "#62247B",
      position: "fixed",
      top: "50%",
      left: "50%",
      zIndex: "999",
      transform: "translate(-50%, -50%)",
    },
    ball: {
      width: 15,
      height: 15,
      position: "absolute",
      top: 0,
      left: 350,
      borderRadius: 50,
      background: "#C6A62F",
    },
    line: {
      width: 0,
      height: 600,
      borderLeft: "2px dashed #C6A62F",
      position: "absolute",
      top: 0,
      left: "50%",
    },
    stick: {
      width: 12,
      height: 85,
      position: "absolute",
      background: "#C6A62F",
    },
    stick1: {
      left: 0,
      top: 150,
    },
    stick2: {
      right: 0,
      top: 150,
    },
    scoreboard: {
      textAlign: "center",
      fontSize: "2.5em",
      paddingTop: "1rem",
      fontFamily: "Helvetica, Arial, sans-serif",
    },
  };

  var CONSTS: any = {
    gameSpeed: 10,
    score1: 0,
    score2: 0,
    stick1Speed: 0,
    stick2Speed: 0,
    ballTopSpeed: 0,
    ballLeftSpeed: 0,
  };

  function start() {
    // open if save game exist
    let saveGame = loadSaveGame();
    if (saveGame) {
      CONSTS = saveGame;
    }

    draw();
    setEvents();
    roll();
    loop();
  }

  function draw() {
    $("<div/>", { id: "score-board" }).css(CSS.scoreboard).appendTo("body");
    $("<span/>", { id: "left" })
      .text(`left: ${CONSTS.score1} `)
      .appendTo("#score-board");
    $("<span/>", { id: "right" })
      .text(`right: ${CONSTS.score2} `)
      .appendTo("#score-board");
    $("<div/>", { id: "pong-game" }).css(CSS.arena).appendTo("body");
    $("<div/>", { id: "pong-line" }).css(CSS.line).appendTo("#pong-game");
    $("<div/>", { id: "pong-ball" }).css(CSS.ball).appendTo("#pong-game");
    $("<div/>", { id: "stick-1" })
      .css($.extend(CSS.stick1, CSS.stick))
      .appendTo("#pong-game");
    $("<div/>", { id: "stick-2" })
      .css($.extend(CSS.stick2, CSS.stick))
      .appendTo("#pong-game");
  }

  function setEvents() {
    $(document).on("keydown", function (e) {
      // player 1 keydown events
      if (e.key == "w" || e.key == "W") {
        CONSTS.stick1Speed = -22;
      }

      if (e.key == "s" || e.key == "S") {
        CONSTS.stick1Speed = 22;
      }

      // player 2 keydown events
      if (e.key == "ArrowUp") {
        CONSTS.stick2Speed = -22;
      }

      if (e.key == "ArrowDown") {
        CONSTS.stick2Speed = 22;
      }
    });

    $(document).on("keyup", function (e) {
      // player 1 keyup event
      if (e.key == "w" || e.key == "W" || e.key == "s" || e.key == "S") {
        CONSTS.stick1Speed = 0;
      }

      // player 2 keyup event
      if (e.key == "ArrowUp" || e.key == "ArrowDown") {
        CONSTS.stick2Speed = 0;
      }
    });
  }

  function loop() {
    //@ts-ignore
    window.pongLoop = setInterval(function () {
      CSS.stick1.top += CONSTS.stick1Speed;
      CSS.stick2.top += CONSTS.stick2Speed;
      $("#stick-1").css("top", CSS.stick1.top);
      $("#stick-2").css("top", CSS.stick2.top);

      CSS.ball.top += CONSTS.ballTopSpeed;
      CSS.ball.left += CONSTS.ballLeftSpeed;

      if (
        CSS.ball.top <= 0 ||
        CSS.ball.top >= CSS.arena.height - CSS.ball.height
      ) {
        CONSTS.ballTopSpeed = CONSTS.ballTopSpeed * -1;
      }

      $("#pong-ball").css({ top: CSS.ball.top, left: CSS.ball.left });

      // left check
      if (CSS.ball.left <= CSS.stick.width) {
        // left loss, right win
        if (
          CSS.ball.top + CSS.ball.height < CSS.stick1.top ||
          CSS.ball.top > CSS.stick1.top + CSS.stick.height
        ) {
          updateScore(++CONSTS.score2, "right");
          saveGame();
          roll();
        }

        // left saves ball, game continues
        if (
          CSS.ball.top + CSS.ball.height / 2 > CSS.stick1.top &&
          CSS.ball.top + CSS.ball.height / 2 < CSS.stick1.top + CSS.stick.height
        ) {
          CONSTS.ballLeftSpeed = CONSTS.ballLeftSpeed * -1;
        }
      }

      // right check
      if (CSS.ball.left >= CSS.arena.width - CSS.ball.width - CSS.stick.width) {
        // right loss, left win
        if (
          CSS.ball.top + CSS.ball.height < CSS.stick2.top ||
          CSS.ball.top > CSS.stick2.top + CSS.stick.height
        ) {
          updateScore(++CONSTS.score1, "left");
          saveGame();
          roll();
        }

        // right saves ball, game continues
        if (
          CSS.ball.top + CSS.ball.height / 2 > CSS.stick2.top &&
          CSS.ball.top + CSS.ball.height / 2 < CSS.stick2.top + CSS.stick.height
        ) {
          CONSTS.ballLeftSpeed = CONSTS.ballLeftSpeed * -1;
        }
      }

      checkGameEnd();
    }, CONSTS.gameSpeed);
  }

  // game end alert
  function checkGameEnd() {
    let winner = undefined;
    if (CONSTS.score1 == 5) {
      winner = "Left";
    }

    if (CONSTS.score2 == 5) {
      winner = "Right";
    }

    if (winner) {
      const playAgain = confirm(
        `${winner} wins.\n\nScore: Left: ${CONSTS.score1}, Right: ${CONSTS.score2}\n\nPlay again?`
      );

      if (playAgain) {
        // start new game
        newGame();
        // refresh page
        window.location.reload();
      }
    }
  }

  function roll() {
    // center new ball
    CSS.ball.top = CSS.arena.height / 2 - CSS.ball.height / 2;
    CSS.ball.left = CSS.arena.width / 2 - CSS.ball.width / 2;

    CONSTS.ballTopSpeed = getRandom(-1, -5);
    CONSTS.ballLeftSpeed = getRandom(-10, 10);
  }

  // calculate random number
  function getRandom(min, max) {
    let random = Math.floor(Math.random() * (max - min + 1)) + min;
    return random == 0 ? getRandom(min, max) : random;
  }

  // update score
  function updateScore(score, id) {
    $(`#${id}`).text(`${id}: ${score} `);
  }

  // save to storage
  function saveGame() {
    localStorage.setItem("savegame", JSON.stringify(CONSTS));
  }

  // get data from storage
  function loadSaveGame() {
    return JSON.parse(localStorage.getItem("savegame"));
  }

  // clear storage
  function deleteSaveGame() {
    localStorage.clear();
  }

  // clear variables & storage
  function newGame() {
    CONSTS = {
      gameSpeed: 10,
      score1: 0,
      score2: 0,
      stick1Speed: 0,
      stick2Speed: 0,
      ballTopSpeed: 0,
      ballLeftSpeed: 0,
    };
    deleteSaveGame();
  }

  start();
})();
