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
        hideLoading();
        showSubmissionError(error);
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
    // Read as raw text first so we can show the ACTUAL server response
    // (instead of a generic "Unexpected token" message) when it isn't JSON.
    return response.text().then(rawText => {
      var parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        var snippet = rawText.replace(/\s+/g, ' ').trim().slice(0, 220);
        throw new Error(
          'Server ne JSON ki jagah kuch aur bheja (HTTP ' + response.status + '). ' +
          'Server response: "' + (snippet || '(empty response)') + '"'
        );
      }

      if (!response.ok) {
        var serverMsg = (parsed && (parsed.message || parsed.error)) || JSON.stringify(parsed);
        throw new Error('Server error (HTTP ' + response.status + '): ' + serverMsg);
      }

      if (!parsed || typeof parsed.result === 'undefined') {
        throw new Error('Server response did not include a "result" field.');
      }

      return parsed;
    });
  })
  .then(result => {
    displayResult(result.result, result.message); // Display result here
  })
  .catch(error => {
    console.error('Submission error:', error);
    hideLoading();
    showSubmissionError(error);
  });
}

// Shows a clear, dismissable error instead of leaving "Generating result..."
// spinning forever, and lets the user retry the submission.
function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showSubmissionError(error) {
  var overlay = document.getElementById('overlay');
  var loading = document.getElementById('loading');
  if (overlay) overlay.style.display = 'none';
  if (loading) loading.style.display = 'none';

  var existing = document.getElementById('submission-error-popup');
  if (existing) existing.remove();

  var popup = document.createElement('div');
  popup.id = 'submission-error-popup';
  popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
    'background:#fff;padding:20px 24px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.25);' +
    'z-index:2000;max-width:90%;width:380px;max-height:80vh;overflow-y:auto;' +
    'text-align:center;font-family:Inter,system-ui,sans-serif;';
  popup.innerHTML =
    '<p style="color:#c62828;font-weight:600;margin:0 0 8px;">Result generate nahi ho paaya</p>' +
    '<p style="color:#555;font-size:14px;margin:0 0 10px;">' +
      'Internet check karein aur dobara try karein. Agar problem bani rahe to neeche di gayi ' +
      'technical detail backend developer ko dikhayein:' +
    '</p>' +
    '<pre style="text-align:left;background:#f5f5f5;border:1px solid #e0e0e0;border-radius:6px;' +
      'padding:8px 10px;font-size:11px;line-height:1.4;color:#333;white-space:pre-wrap;' +
      'word-break:break-word;max-height:180px;overflow-y:auto;margin:0 0 16px;">' +
      (error && error.message ? escapeHtml(error.message) : 'unknown error') +
    '</pre>' +
    '<button id="submission-error-retry" style="background:#1976d2;color:#fff;border:none;' +
      'padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;margin-right:8px;">Retry</button>' +
    '<button id="submission-error-close" style="background:#eee;color:#333;border:none;' +
      'padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">Close</button>';
  document.body.appendChild(popup);

  document.getElementById('submission-error-retry').onclick = function () {
    popup.remove();
    showLoading();
    showResult();
  };
  document.getElementById('submission-error-close').onclick = function () {
    popup.remove();
  };
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
    var decodedHtml;
    try {
        decodedHtml = atob(result);
    } catch (e) {
        hideLoading();
        showSubmissionError(new Error('Result data from server was invalid/corrupted.'));
        return;
    }

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
