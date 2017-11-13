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
let getRadios = $("input:radio");
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
  let selectedAnswer = $("input:radio:checked").attr("id");
  let currentLevel = "#level";

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
      levelCount++
    }
    getIncorrect.text(`${incorrectTotal} / 3`); // display incorrect total
    currentLevel = $(`${currentLevel}${levelCount}`);
    moveBackward(currentLevel);
  }
});

function moveForward(level) {
  console.log(level, "inside");
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

function moveBackward(level) {
  if (incorrectTotal === 3) {
    gameOver($("#lose"));
  } else if (level === $(getLevel1)) {
    level = $(getLevel1);
  } else {
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

}

/* if the player makes it through all of the questions then he is taken to the winning screen*/


/* if the player has 3 inccorect answers take him to the losing screen*/
