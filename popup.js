document.getElementById('fillResult').addEventListener('click', function() {
    const answers = JSON.parse(document.getElementById('answersInput').value);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: autoAnswer,
            args: [answers]
        });
    });
});

document.getElementById('generatePrompt').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        chrome.scripting.executeScript({
            target: {tabId: currentTab.id},
            function: scrapeWebPage
        }, (results) => {
            // Process the results
            const questions = results[0].result;
            updatePopupDOM(questions);
        });
    });
});

document.getElementById('copyButton').addEventListener('click', function() {
    const textToCopy = document.getElementById('results').innerText;
    copyToClipboard(textToCopy);
});


document.getElementById("saveQuiz").addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: scrapeQuestionAndCheckedOption,
        }, (results) => {
            const currentQuizzes = results[0].result;

            // Retrieve existing quizzes from localStorage or initialize an empty array
            let quizzes = [];
            try {
                quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
            } catch(err) {
                quizzes = []
                console.log(err)
            }
            
            for (const currentQuiz of currentQuizzes) {
                // Check if the question already exists in the stored quizzes
                const existingQuizIndex = quizzes.findIndex(quiz => stringIsSimilar(quiz.question, currentQuiz.question));
            
                if (existingQuizIndex !== -1) {
                    // If the question exists (with a similarity score greater than equal to 0.95), update the existing entry
                    quizzes[existingQuizIndex] = currentQuiz;
                } else {
                    // Otherwise, append the new quiz
                    quizzes.push(currentQuiz);
                }
            }
            // Save the updated quizzes array back to localStorage
            localStorage.setItem('quizzes', JSON.stringify(quizzes));
        });
    });
})


document.getElementById('exportButton').addEventListener('click', function() {
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


