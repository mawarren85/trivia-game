/* have a variable that keeps track of right answers out of total questions*/
let correctTotal;
/* have a variable that keeps track of wrong answers out of 3  */
let wrongTotal;
/* if at any time a player gets three questions wrong...he is taken to the loser screen */

/*  have a variable that keeps track of category chosen  */
let category = $("#pick-category");
//console.log(category.val())
let selectedCategory;
category.change(function() {
  selectedCategory = category.val();
});


/*  have a variable that keeps track of difficulty chosen  */
let selectedDifficulty;
let difficulty = $("#pick-difficulty");
let getRadios = $("input:radio");

difficulty.change(function() {
  let selectedDifficulty = difficulty.val();
  if (!selectedCategory) {
    alert("Pick a category first!")
    difficulty.find("option:first").attr("selected", "selected")
  }

  $.ajax({
    url: `https://opentdb.com/api.php?amount=1&category=${selectedCategory}&difficulty=${selectedDifficulty}&type=multiple`,
    success: function(result) {
      console.log(result)
      let setQuestion = $("#question").text(result["results"]["0"]["question"])
      let wrongAnswers = result["results"]["0"]["incorrect_answers"]
      let answers = [];
      answers.push(result["results"]["0"]["correct_answer"])

      for (let i = 0; i < wrongAnswers.length; i++) {
        answers.push(wrongAnswers[i])
      }

      shuffleArray(answers);

      for (let i = 0; i < getRadios.length; i++) {
        let radioID = ($(getRadios[i]).attr("id"))

        for (let j = 0; j < answers.length; j++) {
          $(`label[for=${radioID}]`).text(answers[i])
        }
      }
    }
  });
});

function shuffleArray(answers) {
  for (let i = answers.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = answers[i];
    answers[i] = answers[j];
    answers[j] = temp;
  }
  return answers;
}

/* if category is not selected then the difficulty tab should not return a trivia question  ... check by using .length   if category object.length > 0 then go ahead and let the difficulty tab make an api call...the short way is .......  if ($(category).length)*/

/* once a category and difficulty level have been chosen then the difficulty tab produces a question after event change on the difficulty drop down */




/* the event change also causes 4 different answers to populate with radio buttons .... toggle class 'hidden?' */

/*  a selection of the radio button causes the submit button to activate...if the submit button is hit without a radio button being selected then an alert pops up saying that you need to select an answer */

/* with a valid answer selected the submit button checks to see if the answer is correct or wrong*/

/* if the answer is wrong then the player is taken back to the previous screen...the incorrect tally is incremented...and the form populates another question with radio buttons...the category and difficulty level stay the same*/

/*  if the answer is correct then the player is taken to the next screen and the correct answers are incremented.  the form populates another question with radio buttons...category and difficulty levels stay the same */


/* if the difficulty and/ or category is changed... new questions should be populated with new answer radio buttons */

/* if the player makes it through all of the questions then he is taken to the winning screen*/
