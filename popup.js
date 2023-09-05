document
    .getElementById('devModeToggle')
    .addEventListener('change', function () {
        const devTools = document.querySelector('.dev-tools');
        if (this.checked) {
            devTools.style.display = 'block';
        } else {
            devTools.style.display = 'none';
        }
    });

document.getElementById('fillResult').addEventListener('click', function () {
    const answers = JSON.parse(document.getElementById('answersInput').value);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: autoAnswer,
            args: [answers],
        });
    });
});

document
    .getElementById('generatePrompt')
    .addEventListener('click', function () {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                const currentTab = tabs[0];
                chrome.scripting.executeScript(
                    {
                        target: { tabId: currentTab.id },
                        function: scrapeWebPage,
                    },
                    (results) => {
                        // Process the results
                        const questions = results[0].result;
                        updatePopupDOM(questions);
                    },
                );
            },
        );
    });

document.getElementById('copyButton').addEventListener('click', function () {
    const textToCopy = document.getElementById('results').innerText;
    copyToClipboard(textToCopy);
});

document.getElementById('saveQuiz').addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                function: scrapeQuestionAndCheckedOption,
            },
            (results) => {
                const currentQuizzes = results[0].result;

                // Retrieve existing quizzes from localStorage or initialize an empty array
                let savedQuizzes = [];
                try {
                    savedQuizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
                } catch (err) {
                    savedQuizzes = [];
                    console.log(err);
                }

                const mergedQuizzes = smartMerge(currentQuizzes, savedQuizzes) 
                
                // Save the updated quizzes array back to localStorage
                localStorage.setItem('quizzes', JSON.stringify(mergedQuizzes));
            },
        );
    });
});

document.getElementById('exportButton').addEventListener('click', function () {
    // Retrieve quizzes from localStorage
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];

    // Convert quizzes array to a JSON string
    const jsonString = JSON.stringify(quizzes, null, 2); // The "2" here is for pretty-printing the JSON

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a download link for the Blob
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quizzes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

document
    .getElementById('findAndMarkAnswers')
    .addEventListener('click', function () {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                const currentTab = tabs[0];
                chrome.scripting.executeScript(
                    {
                        target: { tabId: currentTab.id },
                        function: scrapeQuestionAnswer,
                    },
                    (results) => {
                        const questions = results[0].result;
                        const savedAnswers =
                            JSON.parse(localStorage.getItem('quizzes')) || [];
                        const currentQuizAnswers = [];
                        for (const question of questions) {
                            // returns the index of the answer or returns -1 if doesn't exist
                            const answerIndex = getAnswerIndex(
                                question,
                                savedAnswers,
                            );
                            currentQuizAnswers.push(answerIndex);
                        }
                        document.getElementById('answersInput').innerHTML =
                            JSON.stringify(currentQuizAnswers);
                        document.getElementById('fillResult').click();
                    },
                );
            },
        );
    });

document.getElementById('fileInput').addEventListener('change', function () {
    const file = this.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const uploadedData = JSON.parse(event.target.result);
                // Validate the uploaded data if necessary
                if (Array.isArray(uploadedData)) {
                    const existingData =
                        JSON.parse(localStorage.getItem('quizzes')) || [];
                    const combinedData = smartMerge(existingData, uploadedData);
                    localStorage.setItem(
                        'quizzes',
                        JSON.stringify(combinedData),
                    );
                    alert('Answers uploaded successfully!');
                } else {
                    alert('Invalid JSON file format.');
                }
            } catch (error) {
                alert('Error parsing JSON file.');
            }
        };
        reader.readAsText(file);
    } else {
        alert('Please select a JSON file first.');
    }
});
