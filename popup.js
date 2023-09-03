document.getElementById('generatePrompt').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        chrome.scripting.executeScript({
            target: {tabId: currentTab.id},
            function: scrapeWebPage
        }, (results) => {
            // Display the results in the popup
            const questions = results[0].result;
            console.log(results)
            let prompt = `I am giving a quiz test and below are ${questions.length} questions with their options. I want you to read each question and their options and give me the only correct option in json format like this  {"q1": "A"} and so on<br><br>`
            let displayText = '';
            displayText += prompt
            questions.forEach(q => {
                displayText += `<strong>${q.question}</strong><br>`;
                displayText += `${q.options.replace(/\n/g, '<br>')}<br><br>`; // Convert newlines to <br> for HTML display
            });
            document.getElementById('results').innerHTML = displayText;
        });
    });
});


document.getElementById('copyButton').addEventListener('click', function() {
    const textToCopy = document.getElementById('results').innerText;
    copyToClipboard(textToCopy);
});

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function scrapeWebPage() {
    const questions = [];
    const quizzes = document.getElementsByClassName('rc-FormPartsQuestion');
    let questionCounter = 1; // To keep track of the question number

    for (let quiz of quizzes) {
        const quiz_data = quiz.getElementsByClassName('css-1kgqbsw');
        const question = `Q${questionCounter} ${quiz_data[0].textContent}`;
        const options = Array.from(quiz_data).slice(1).map((opt, index) => {
            const optionLetter = String.fromCharCode(65 + index); // Convert 0 to A, 1 to B, etc.
            return `${optionLetter}) ${opt.textContent}`;
        }).join('\n'); // Join the options with a newline

        questions.push({
            'question': question,
            'options': options
        });

        questionCounter++; // Increment the question number for the next iteration
    }
    return questions;
}
