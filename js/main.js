/* jshint esversion:6 */

/* ------------- smooth scroll to link ------------ */

$(document).on('click', 'a[href^="#"]', function(event) {
  event.preventDefault();

  $('html, body').animate({
    scrollTop: $($.attr(this, 'href')).offset().top
  }, 2000);
});
/*  only let the choose event happen once per page so you cant change questions repeatedly */

/* variable to keep track of point total */

/* have a variable that keeps track of right answers out of total questions*/
let correctTotal = 0;
/* have a variable that keeps track of wrong answers out of 3  */
let incorrectTotal = 0;
/* if at any time a player gets three questions wrong...he is taken to the loser screen */

/* ------------- keep track of category selected ------------ */
let category = $("#pick-category");
let selectedCategory;
category.change(function() {
  selectedCategory = category.val();
});

/* -----------------------------------------------------------
--keep track of difficulty selected
--once difficulty value changes make an api call for the question with the appropriate category and difficulty selections
-------------------------------------------------------------- */

let difficulty = $("#pick-difficulty");
let getRadios = $("input[name='answers']");
let selectedDifficulty;


let difficultyChange = difficulty.change(function() {
  selectedDifficulty = difficulty.val();

  if (!selectedCategory) {
    alert("Pick a category first!");
    difficulty.find("option:first").attr("selected", "selected")
  } else {
    $.ajax({
      url: `https://opentdb.com/api.php?amount=1&category=${selectedCategory}&difficulty=${selectedDifficulty}&type=multiple`,
      success: function(data) {
        askQuestion(data);
      }
    });
  }
});

/* -----------------------------------------------------------
--populate form with call result
--combine correct and incorrect answers into one array and then
shuffle the new array
--hide radio buttons and submit button on start page
-------------------------------------------------------------- */
let radioID;
let correctAnswer;

function askQuestion(result) {

  let setQuestion = $("#question").text(result["results"]["0"]["question"]);
  let wrongAnswers = result["results"]["0"]["incorrect_answers"];
  correctAnswer = result["results"]["0"]["correct_answer"];
  let answers = [];
  answers.push(correctAnswer);
  console.log(correctAnswer);

  for (let i = 0; i < wrongAnswers.length; i++) {
    answers.push(wrongAnswers[i]);
  }

  shuffleArray(answers);

  for (let i = 0; i < getRadios.length; i++) {
    radioID = ($(getRadios[i]).attr("id"));

    for (let j = 0; j < answers.length; j++) {
      $(`label[for=${radioID}]`).text(answers[i]);
    }
  }

  $(".hidden").toggleClass("hidden"); //  hide radio and submit on start page
}

function shuffleArray(answers) {
  for (let i = answers.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = answers[i];
    answers[i] = answers[j];
    answers[j] = temp;
  }
  return answers;
}

/* -----------------------------------------------------------
--once submit is clicked check if answer is correct
--if correct move to next level..increase correct count
--if incorrect move back a level..increase incorrect count
-------------------------------------------------------------- */

let levelCount = 1;
let getLevel1 = $("#level1");
let getSubmit = $("#submit");
let getCorrect = $(".correct");
let getIncorrect = $(".incorrect");
getCorrect.text(`${correctTotal} / 12`);
getIncorrect.text(`${incorrectTotal} / 3`);

getSubmit.click(function() {
  let selectedAnswer =
   $("input[name='answers']:radio:checked").attr("id");
  let currentLevel = "#level";
console.log(selectedAnswer)
  if (!selectedAnswer) {
    alert("Choose an answer");
  } else if (correctTotal === 11) {
    gameOver($("#win"));
  } else if ($(`label[for=${selectedAnswer}]`).text() === correctAnswer) {
    correctTotal++;
    levelCount++;
    getCorrect.text(`${correctTotal} / 12`); // display correct answer total
    currentLevel = $(`${currentLevel}${levelCount}`);
    moveForward(currentLevel);
  } else {
    incorrectTotal++;
    levelCount--;
    if (levelCount === 0) {
      levelCount++;
    }
    getIncorrect.text(`${incorrectTotal} / 3`); // display incorrect total
    currentLevel = $(`${currentLevel}${levelCount}`);
    moveBackward(currentLevel);
  }
});

function moveForward(level) {
  moveAvatarForward(level);
  console.log(level, "current level");
  $('html, body').animate({
    scrollTop: $(level).offset().top
  }, 5000); // originally set at 2000...set back!
  $.ajax({
    url: `https://opentdb.com/api.php?amount=1&category=${selectedCategory}&difficulty=${selectedDifficulty}&type=multiple`,
    success: function(data) {
      askQuestion(data);
    }
  });
}

function moveBackward(level) {
  if (incorrectTotal === 3) {
    gameOver($("#lose"));
  } else if (level === $(getLevel1)) {
    level = $(getLevel1);
  } else {
    moveAvatarBackward(level);
    $('html, body').animate({
      scrollTop: $(level).offset().top
    }, 2000);
    $.ajax({
      url: `https://opentdb.com/api.php?amount=1&category=${selectedCategory}&difficulty=${selectedDifficulty}&type=multiple`,
      success: function(data) {
        askQuestion(data);
      }
    });
  }
}

function gameOver(result) {

  $(".trivia").toggleClass("hidden");
  $('html, body').animate({
    scrollTop: $(result).offset().top
  }, 2000);
  $(".game-over-image").css("background-image", `url(${selectedAvatarNoQuotes})`);     // set avatar pic on loser page

  if ($(result).attr("id") === "lose") {
    failTextP ();
  } else {
    winTextP();
  }
}

function failTextP () {
  let getLoserTextP = $(".loser-text-p");
  if ($(getSmartRadio).text() === "Yes") {
    getLoserTextP.text("I thought you said you were smart.");
  } else if ($(getSmartRadio).text() === "Maybe") {
    getLoserTextP.text("Maybe you should have checked 'not smart.'");
  } else {
    getLoserTextP.text("At least you knew how smart you were.");
  }
}

function winTextP () {
  let getWinTextP = $(".win-text-p");
  if ($(getSmartRadio).text() === "Yes") {
    getWinTextP.text("You were right. You are smart!");
  } else if ($(getSmartRadio).text() === "Maybe") {
    getWinTextP.text("You should have said you were smart!");
  } else {
    getWinTextP.text("You should be more confident. You are smart!");
  }
}
/* ------------- new player setup ------------ */

let getAvatarContainer = $(".avatar-container > div");
let getSetupButton = $("#setup-button");
let getNameDisplay = $("#displayName");
let getSmartRadio;
let selectedAvatar;
let selectedAvatarID;
let selectedAvatarSrc;
let selectedAvatarNoQuotes;
let imgKeys = {
  cartman: "images/cartman.png",
  hipster: "images/hipster.png",
  lisa: "images/lisa.png",
  spongebob: "images/spongebob.png",
  brian: "images/brian.jpg",
  yoda: "images/yoda.gif",
  gosling: "images/gosling.png",
  garfield: "images/garfield.png"
};

getAvatarContainer.click(function(event) { // get avatar selected
  selectedAvatar = event.target;
  selectedAvatarID = $(selectedAvatar).attr("id");
  selectedAvatarSrc = imgKeys[selectedAvatarID];
  $(".blue").toggleClass("blue");
  $(selectedAvatar).toggleClass("blue");
  selectedAvatarNoQuotes = selectedAvatarSrc.replace(/"/g, "");
});

getSetupButton.click(function() { // display name on question form
  event.preventDefault();
  let getName = $("#name");
  let getNameVal = getName.val();
  getNameDisplay.text(`Player: ${getNameVal}`);
  getSmartRadio = $("input[name='smart']:radio:checked");
  console.log(getSmartRadio);

  $("#avatar-start").append(`<img src=${selectedAvatarSrc}>`).attr("class", "avatar"); // put avatar on start page

});

/* ----------------------- fail page ----------------------- */



/* ----------------------- animate ----------------------- */
let level2_1 = {
  start: {
    x: 650,
    y: 550,
    angle: 61.631,
    length: 0.325
  },
  end: {
    x: 300,
    y: 1100,
    angle: 41.363,
    length: 0.610
  }
};
let level2_2 = {
  start: {
    x: 300,
    y: 1100,
    angle: 254.631,
    length: 0.025
  },
  end: {
    x: 350,
    y: 1300,
    angle: 296.363,
    length: 1.310
  }
};
let level2_3 = {
  start: {
    x: 350,
    y: 1300,
    angle: 295.631,
    length: 1.286
  },
  end: {
    x: 470,
    y: 1500,
    angle: 89.363,
    length: 0.640
  }
};
let level3_1 = {
  start: {
    x: 470,
    y: 1500,
    angle: 314.631,
    length: 0.086
  },
  end: {
    x: 270,
    y: 2000,
    angle: 300.363,
    length: 0.640
  }
};
let level3_2 = {
  start: {
    x: 270,
    y: 2000,
    angle: 330.631,
    length: 1.686
  },
  end: {
    x: 500,
    y: 2250,
    angle: 359.363,
    length: 0.0740
  }
};
let level3_3 = {
  start: {
    x: 500,
    y: 2250,
    angle: 180.631,
    length: 0.086
  },
  end: {
    x: 250,
    y: 2550,
    angle: 267.363,
    length: 1.440
  }
};
let level3_4 = {
  start: {
    x: 250,
    y: 2550,
    angle: 315.631,
    length: 1.586
  },
  end: {
    x: 550,
    y: 2800,
    angle: 340.363,
    length: 0.940
  }
};
let level3_5 = {
  start: {
    x: 550,
    y: 2800,
    angle: 151.631,
    length: 0.086
  },
  end: {
    x: 450,
    y: 3000,
    angle: 34.363,
    length: 0.940
  }
};
let level4_1 = {
  start: {
    x: 550,
    y: 3000,
    angle: 93.631,
    length: 0.986
  },
  end: {
    x: 500,
    y: 3550,
    angle: 275.363,
    length: 1.040
  }
};
let level4_2 = {
  start: {
    x: 550,
    y: 3550,
    angle: 314.631,
    length: 0.686
  },
  end: {
    x: 400,
    y: 4000,
    angle: 75.363,
    length: 0.440
  }
};
let level5_1 = {
  start: {
    x: 400,
    y: 4000,
    angle: 65.631,
    length: 0.986
  },
  end: {
    x: 250,
    y: 4200,
    angle: 25.263,
    length: 0.540
  }
};
let level5_2 = {
  start: {
    x: 250,
    y: 4200,
    angle: 315.631,
    length: 0.486
  },
  end: {
    x: 400,
    y: 4500,
    angle: 335.263,
    length: 0.840
  }
};
let level5_3 = {
  start: {
    x: 400,
    y: 4500,
    angle: 290.631,
    length: 0.786
  },
  end: {
    x: 300,
    y: 4900,
    angle: 335.263,
    length: 0.840
  }
};
let level5_4 = {
  start: {
    x: 300,
    y: 4900,
    angle: 290.631,
    length: 0.786
  },
  end: {
    x: 410,
    y: 5500,
    angle: 335.263,
    length: 0.840
  }
};
let level5_5 = {
  start: {
    x: 410,
    y: 5500,
    angle: 343.631,
    length: 0.786
  },
  end: {
    x: 400,
    y: 5990,
    angle: 316.263,
    length: 1.240
  }
};
let level6_1 = {
  start: {
    x: 400,
    y: 5990,
    angle: 72.631,
    length: 1.086
  },
  end: {
    x: 620,
    y: 6550,
    angle: 335.263,
    length: 0.840
  }
};
let level6_2 = {
  start: {
    x: 620,
    y: 6550,
    angle: 357.631,
    length: 0.286
  },
  end: {
    x: 360,
    y: 6970,
    angle: 274.263,
    length: 0.840
  }
};
let level7_1 = {
  start: {
    x: 360,
    y: 6970,
    angle: 269.631,
    length: 0.986
  },
  end: {
    x: 360,
    y: 7450,
    angle: 58.263,
    length: 0.840
  }
};
let level7_2 = {
  start: {
    x: 360,
    y: 7450,
    angle: 69.631,
    length: 1.986
  },
  end: {
    x: 400,
    y: 7850,
    angle: 317.263,
    length: 0.840
  }
};
let level7_3 = {
  start: {
    x: 400,
    y: 7850,
    angle: 270.631,
    length: 1.986
  },
  end: {
    x: 380,
    y: 8100,
    angle: 10.263,
    length: 0.140
  }
};
let level7_4 = {
  start: {
    x: 380,
    y: 8100,
    angle: 88.631,
    length: 0.986
  },
  end: {
    x: 380,
    y: 8500,
    angle: 297.263,
    length: 1.340
  }
};
let level7_5 = {
  start: {
    x: 380,
    y: 8500,
    angle: 10.631,
    length: 0.986
  },
  end: {
    x: 380,
    y: 8900,
    angle: 20.263,
    length: 1.340
  }
};
let level8_1 = {
  start: {
    x: 380,
    y: 8900,
    angle: 40.631,
    length: 0.986
  },
  end: {
    x: 380,
    y: 9575,
    angle: 285.263,
    length: 1.240
  }
};
let level8_2 = {
  start: {
    x: 380,
    y: 9575,
    angle: 256.631,
    length: 1.486
  },
  end: {
    x: 415,
    y: 9775,
    angle: 73.263,
    length: 1.240
  }
};
let level8_3 = {
  start: {
    x: 415,
    y: 9775,
    angle: 1.631,
    length: 0.486
  },
  end: {
    x: 375,
    y: 10000,
    angle: 64.263,
    length: 1.640
  }
};
let level9_1 = {
  start: {
    x: 375,
    y: 10000,
    angle: 102.631,
    length: 2.086
  },
  end: {
    x: 350,
    y: 10250,
    angle: 282.263,
    length: 2.240
  }
};
let level9_2 = {
  start: {
    x: 350,
    y: 10250,
    angle: 300.631,
    length: 0.986
  },
  end: {
    x: 550,
    y: 10700,
    angle: 310.263,
    length: 1.140
  }
};
let level9_3 = {
  start: {
    x: 550,
    y: 10700,
    angle: 323.631,
    length: 0.286
  },
  end: {
    x: 270,
    y: 11800,
    angle: 26.263,
    length: 0.640
  }
};
let level9_4 = {
  start: {
    x: 270,
    y: 11800,
    angle: 32.631,
    length: 0.286
  },
  end: {
    x: 570,
    y: 12375,
    angle: 69.263,
    length: 0.640
  }
};
let level10_1 = {
  start: {
    x: 570,
    y: 12375,
    angle: 75.631,
    length: 1.586
  },
  end: {
    x: 415,
    y: 12775,
    angle: 298.263,
    length: 1.240
  }
};
let level10_2 = {
  start: {
    x: 415,
    y: 12775,
    angle: 95.631,
    length: 1.586
  },
  end: {
    x: 425,
    y: 13250,
    angle: 305.263,
    length: 0.740
  }
};
let level11_1 = {
  start: {
    x: 425,
    y: 13250,
    angle: 281.631,
    length: 0.886
  },
  end: {
    x: 300,
    y: 13700,
    angle: 59.963,
    length: 0.440
  }
};
let level11_2 = {
  start: {
    x: 300,
    y: 13700,
    angle: 69.931,
    length: 1.186
  },
  end: {
    x: 200,
    y: 13900,
    angle: 49.963,
    length: 1.440
  }
};
let level11_3 = {
  start: {
    x: 200,
    y: 13900,
    angle: 39.931,
    length: 0.186
  },
  end: {
    x: 560,
    y: 14255,
    angle: 101.963,
    length: 0.640
  }
};
let level11_4 = {
  start: {
    x: 560,
    y: 14255,
    angle: 285.931,
    length: 0.286
  },
  end: {
    x: 250,
    y: 14755,
    angle: 26.963,
    length: 0.540
  }
};
let level12_1 = {
  start: {
    x: 250,
    y: 14755,
    angle: 37.931,
    length: 0.786
  },
  end: {
    x: 650,
    y: 15350,
    angle: 30.963,
    length: 0.440
  }
};
let level12_2 = {
  start: {
    x: 650,
    y: 15350,
    angle: 269.931,
    length: 0.186
  },
  end: {
    x: 595,
    y: 15950,
    angle: 38.963,
    length: 0.240
  }
};
let returnToLevel1 = {
  start: {
    x: 470,
    y: 1500,
    angle: 7.931,
    length: 0.886
  },
  end: {
    x: 650,
    y: 550,
    angle: 359.963,
    length: 0.340
  }
};
let returnToLevel2 = {
  start: {
    x: 550,
    y: 3000,
    angle: 7.931,
    length: 0.886
  },
  end: {
    x: 470,
    y: 1500,
    angle: 359.963,
    length: 0.340
  }
};
let returnToLevel3 = {
  start: {
    x: 400,
    y: 4000,
    angle: 7.931,
    length: 0.886
  },
  end: {
    x: 450,
    y: 3000,
    angle: 359.963,
    length: 0.340
  }
};
let returnToLevel4 = {
  start: {
    x: 400,
    y: 5990,
    angle: 7.931,
    length: 0.886
  },
  end: {
    x: 400,
    y: 4000,
    angle: 359.963,
    length: 0.340
  }
};
let returnToLevel5 = {
  start: {
    x: 360,
    y: 6970,
    angle: 7.931,
    length: 0.886
  },
  end: {
    x: 400,
    y: 5900,
    angle: 359.963,
    length: 0.340
  }
};
let returnToLevel6 = {
  start: {
    x: 380,
    y: 8900,
    angle: 7.931,
    length: 0.886
  },
  end: {
    x: 360,
    y: 6970,
    angle: 359.963,
    length: 0.340
  }
};
let returnToLevel7 = {
  start: {
    x: 375,
    y: 10000,
    angle: 7.931,
    length: 0.886
  },
  end: {
    x: 380,
    y: 8900,
    angle: 359.963,
    length: 0.340
  }
};
let returnToLevel8 = {
  start: {
    x: 570,
    y: 12375,
    angle: 7.931,
    length: 0.886
  },
  end: {
    x: 375,
    y: 10000,
    angle: 359.963,
    length: 0.340
  }
};
let returnToLevel9 = {
  start: {
    x: 425,
    y: 13250,
    angle: 7.931,
    length: 0.886
  },
  end: {
    x: 570,
    y: 12375,
    angle: 359.963,
    length: 0.340
  }
};
let returnToLevel10 = {
  start: {
    x: 250,
    y: 14755,
    angle: 7.931,
    length: 0.886
  },
  end: {
    x: 425,
    y: 13250,
    angle: 359.963,
    length: 0.340
  }
};

function moveAvatarForward(level) {

  if ($(level).attr("id") === "level2") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(level2_1)
    }, 1500, "linear", function() {
      $("#avatar-start > img").animate({
        path: new $.path.bezier(level2_2)
      }, 1500, "linear", function() {
        $("#avatar-start > img").animate({
          path: new $.path.bezier(level2_3)
        }, 1500, "linear");
      });
    });
  } else if ($(level).attr("id") === "level3") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(level3_1)
    }, 1000, "linear", function() {
      $("#avatar-start > img").animate({
        path: new $.path.bezier(level3_2)
      }, 1000, "linear", function() {
        $("#avatar-start > img").animate({
          path: new $.path.bezier(level3_3)
        }, 1000, "linear", function() {
          $("#avatar-start > img").animate({
            path: new $.path.bezier(level3_4)
          }, 1000, "linear", function() {
            $("#avatar-start > img").animate({
              path: new $.path.bezier(level3_5)
            }, 1500, "linear");
          });
        });
      });
    });
  } else if ($(level).attr("id") === "level4") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(level4_1)
    }, 1500, "linear", function() {
      $("#avatar-start > img").animate({
        path: new $.path.bezier(level4_2)
      }, 1500, "linear");
    });
  } else if ($(level).attr("id") === "level5") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(level5_1)
    }, 1500, "linear", function() {
      $("#avatar-start > img").animate({
        path: new $.path.bezier(level5_2)
      }, 200, "linear", function() {
        $("#avatar-start > img").animate({
          path: new $.path.bezier(level5_3)
        }, 200, "linear", function() {
          $("#avatar-start > img").animate({
            path: new $.path.bezier(level5_4)
          }, 1000, "linear", function() {
            $("#avatar-start > img").animate({
              path: new $.path.bezier(level5_5)
            }, 1000, "linear");
          });
        });
      });
    });
  } else if ($(level).attr("id") === "level6") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(level6_1)
    }, 1000, "linear", function() {
      $("#avatar-start > img").animate({
        path: new $.path.bezier(level6_2)
      }, 1500, "linear");
    });
  } else if ($(level).attr("id") === "level7") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(level7_1)
    }, 500, "linear", function() {
      $("#avatar-start > img").animate({
        path: new $.path.bezier(level7_2)
      }, 800, "linear", function() {
        $("#avatar-start > img").animate({
          path: new $.path.bezier(level7_3)
        }, 1000, "linear", function() {
          $("#avatar-start > img").animate({
            path: new $.path.bezier(level7_4)
          }, 1000, "linear", function() {
            $("#avatar-start > img").animate({
              path: new $.path.bezier(level7_5)
            }, 1000, "linear");
          });
        });
      });
    });
  } else if ($(level).attr("id") === "level8") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(level8_1)
    }, 1000, "linear", function() {
      $("#avatar-start > img").animate({
        path: new $.path.bezier(level8_2)
      }, 1000, "linear", function() {
        $("#avatar-start > img").animate({
          path: new $.path.bezier(level8_3)
        }, 1000, "linear");
      });
    });
  } else if ($(level).attr("id") === "level9") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(level9_1)
    }, 1000, "linear", function() {
      $("#avatar-start > img").animate({
        path: new $.path.bezier(level9_2)
      }, 1000, "linear", function() {
        $("#avatar-start > img").animate({
          path: new $.path.bezier(level9_3)
        }, 1000, "linear", function() {
          $("#avatar-start > img").animate({
            path: new $.path.bezier(level9_4)
          }, 1000, "linear");
        });
      });
    });
  } else if ($(level).attr("id") === "level10") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(level10_1)
    }, 1000, "linear", function() {
      $("#avatar-start > img").animate({
        path: new $.path.bezier(level10_2)
      }, 1500, "linear");
    });
  } else if ($(level).attr("id") === "level11") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(level11_1)
    }, 1500, "linear", function() {
      $("#avatar-start > img").animate({
        path: new $.path.bezier(level11_2)
      }, 1500, "linear", function() {
        $("#avatar-start > img").animate({
          path: new $.path.bezier(level11_3)
        }, 1000, "linear", function() {
          $("#avatar-start > img").animate({
            path: new $.path.bezier(level11_4)
          }, 1000, "linear");
        });
      });
    });
  } else {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(level12_1)
    }, 1000, "linear", function() {
      $("#avatar-start > img").animate({
        path: new $.path.bezier(level12_2)
      }, 1000, "linear");
    });
  }
}

function moveAvatarBackward(level) {
  console.log(level);
  if ($(level).attr("id") === "level1") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(returnToLevel1)
    }, 1000, "linear");
  } else if ($(level).attr("id") === "level2") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(returnToLevel2)
    }, 1000, "linear");
  } else if ($(level).attr("id") === "level3") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(returnToLevel3)
    }, 1000, "linear");
  } else if ($(level).attr("id") === "level4") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(returnToLevel4)
    }, 1000, "linear");
  } else if ($(level).attr("id") === "level5") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(returnToLevel5)
    }, 1000, "linear");
  } else if ($(level).attr("id") === "level6") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(returnToLevel6)
    }, 1000, "linear");
  } else if ($(level).attr("id") === "level7") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(returnToLevel7)
    }, 1000, "linear");
  } else if ($(level).attr("id") === "level8") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(returnToLevel8)
    }, 1000, "linear");
  } else if ($(level).attr("id") === "level9") {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(returnToLevel9)
    }, 1000, "linear");
  } else {
    $("#avatar-start > img").animate({
      path: new $.path.bezier(returnToLevel10)
    }, 1000, "linear");
  }
}








/* have a way to store player avatar and scores */

/* move avatar around the board */
