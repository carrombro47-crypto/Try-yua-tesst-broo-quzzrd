/* ===========================================================
   results.js
   Result submission, display, printing and modal image viewer
   Split out from indexs.html so the quiz logic and result logic
   live in separate files.
   =========================================================== */

function showResult() {
  let is_dpp = false;
  const type = 'batch_test';
  const batch_name = 'Yakeen NEET Hindi 2.0 2027';
  var batch_id = '6a38f418034b8baed508e6e4';
  var test_id = '6a893a5bbc192b01ead1a6ba';
  var test_name = 'Rank Booster Test-01';

  let data = {
    batch_id: batch_id,
    test_id: test_id,
    test_name: test_name,
    batch_name: batch_name,
    questions: questions,
    type: type
  };

  if (is_dpp) {
    var urlParts = window.location.pathname.split('/');
    var subject_slug = urlParts[3];

    fetch(`/get-subject-name/${batch_name}/${batch_id}/${subject_slug}`)
      .then(response => response.json())
      .then(subjectData => {
        if (!subjectData.success) {
          throw new Error('Failed to fetch subject name');
        }

        data.subject_slug = subject_slug;
        data.subject_name = subjectData.subject_name;

        return submitTestfinal(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  } else {
    submitTestfinal(data);
  }
}

// Function to submit test data and handle response
function submitTestfinal(data) {
  return fetch('/submit-test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(result => {
    displayResult(result.result, result.message); // Display result here
  })
  .catch(error => {
    console.error('Submission error:', error);
  });
}

function printResult() {
    var printWindow = window.open('', '_blank');

    var printContent = '<html><head><title>Quiz Results</title>';
    printContent += '<style>';
    printContent += 'body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #f0f0f0; }';
    printContent += '.section { margin-bottom: 30px; background-color: #fff; border: 1px solid #ddd; border-radius: 5px; padding: 15px; }';
    printContent += 'h2 { color: #333; text-align: center; }';
    printContent += '.question, .answer { margin-bottom: 15px; padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 5px; }';
    printContent += 'img { max-width: 100%; height: auto; display: block; margin: 10px 0; }';
    printContent += '.question-number { font-weight: bold; margin-bottom: 5px; }';
    printContent += '.correct-answer { margin-top: 5px; color: green; }';
    printContent += '.user-response { margin-top: 5px; }';
    printContent += '.user-response.correct { color: orange; }';
    printContent += '.user-response.wrong { color: red; }';
    printContent += '</style>';
    printContent += '</head><body>';

    var resultDiv = document.getElementById('result');
    var sections = resultDiv.querySelectorAll('#headings');

    // Questions and Answers combined section
    printContent += '<div class="section"><h2>All Questions with Correct Answers and Your Responses</h2>';
    var questionCounter = 1;
    sections.forEach(function(section) {
        var nextTable = section.nextElementSibling;
        if (nextTable && nextTable.tagName === 'TABLE') {
            var questions = nextTable.querySelectorAll('tr:not(:first-child):not(:last-child)');
            questions.forEach(function(question) {
                var questionImage = question.querySelector('img');
                var answerCell = question.querySelector('td:nth-child(3)');
                var correctAnswer = answerCell.querySelector('div[style*="color: green"]');
                var userResponse = answerCell.querySelector('div[style*="color: orange"], div[style*="color: red"]');

                printContent += '<div class="question">';
                printContent += '<div class="question-number">Question ' + questionCounter + '</div>';
                if (questionImage) {
                    printContent += questionImage.outerHTML;
                }
                if (correctAnswer) {
                    printContent += '<div class="correct-answer">Correct Answer: ' + correctAnswer.innerHTML + '</div>';
                }
                if (userResponse) {
                    var isCorrect = userResponse.style.color === "orange";
                    var responseClass = isCorrect ? "correct" : "wrong";
                    printContent += '<div class="user-response ' + responseClass + '">Your Response: ' + userResponse.innerHTML + '</div>';
                }
                printContent += '</div>';
                questionCounter++;
            });
        }
    });
    printContent += '</div>';
    var overallResultContainer = document.querySelector(".overall-result-container");
    printContent += '<div>' + overallResultContainer.innerHTML + '</div>';

    printContent += '</body></html>';

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

function displayResult(result, message) {
    var resultContainer = document.getElementById('result');

    // Decode the Base64 string
    const decodedHtml = atob(result);

    // Insert the decoded HTML into the result container
    hideLoading();
    resultContainer.innerHTML = decodedHtml;
    resultContainer.innerHTML += '<button id="printResultBtn" onclick="printResult()">Print Result</button>';
    resultContainer.innerHTML += '<br><div>' + message + '</div>';

    // Add styling
    var overallResultContainer = document.querySelector(".overall-result-container");
    overallResultContainer.style.backgroundColor = "#f2f2f2";
    overallResultContainer.style.padding = "20px";
    overallResultContainer.style.borderRadius = "10px";
    overallResultContainer.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";

    var overallResultBox = document.querySelector(".overall-result-box");
    overallResultBox.style.backgroundColor = "#fff";
    overallResultBox.style.padding = "20px";
    overallResultBox.style.borderRadius = "10px";
    overallResultBox.style.boxShadow = "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)";

    var accuracyScore = document.querySelector(".accuracy-score");
    accuracyScore.style.fontWeight = "bold";
    accuracyScore.style.fontSize = "1.2em";

    var feedbackMessage = document.querySelector(".feedback-message");
    feedbackMessage.style.fontWeight = "bold";
    feedbackMessage.style.fontSize = "1.1em";

    // Style the result images
    var resultImages = document.querySelectorAll('.result-image');
    resultImages.forEach(function(img) {
        img.style.maxWidth = '200px';
        img.style.maxHeight = '200px';
        img.style.objectFit = 'contain';
        img.style.cursor = 'pointer';
    });

    // Hide other elements
    document.getElementById("optt").style.display = "none";
    document.getElementById("question-palette-button").style.display = "none";
    document.getElementById("quiz").style.display = "none";
    var cbtKeypadEl = document.getElementById('cbt-keypad');
    if (cbtKeypadEl) cbtKeypadEl.classList.remove('active');
    resultContainer.style.display = "block";
    links();
}

function links() {
  const videoSolutionLinks = document.querySelectorAll('.video-solution-link');
  videoSolutionLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      const videoLink = event.target.getAttribute('data-link');
      if (videoLink === '#') {
        event.preventDefault(); // Prevent default action of the link
        alert('No solution added.');
      } else if (videoLink.includes('youtube')) {
        // Open YouTube links directly
        window.open(videoLink, '_blank');
      } else {
        // Open the video solution link in a new tab or perform your desired action
        window.open(`https://player-fqv0.onrender.com/?l=${videoLink}`, '_blank');
      }
    });
  });
}

function openModal(src) {
    var modal = document.getElementById("myModal");
    var modalImg = document.getElementById("img01");
    modal.style.display = "block";
    modalImg.src = src;
}

function closeModal() {
    document.getElementById("myModal").style.display = "none";
}
