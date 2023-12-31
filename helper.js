function levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1),
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function stringIsSimilar(str1, str2) {
    const distance = levenshteinDistance(str1, str2);
    const longest = Math.max(str1.length, str2.length);
    let match = ((longest - distance) / longest) * 100;
    return Math.round(match) >= 95;
}

function scrapeWebPage() {
    const questions = [];
    const quizzes = document.getElementsByClassName('rc-FormPartsQuestion');
    let questionCounter = 1; // To keep track of the question number

    for (let quiz of quizzes) {
        const quiz_data = quiz.getElementsByClassName('css-1kgqbsw');
        const question = `Q${questionCounter} ${quiz_data[0].textContent}`;
        const options = Array.from(quiz_data)
            .slice(1)
            .map((opt, index) => {
                const optionLetter = String.fromCharCode(65 + index); // Convert 0 to A, 1 to B, etc.
                return `${optionLetter}) ${opt.textContent}`;
            })
            .join('\n'); // Join the options with a newline

        questions.push({
            question: question,
            options: options,
        });

        questionCounter++; // Increment the question number for the next iteration
    }
    return questions;
}


function scrapeQuestionAnswer() {
    const questions = [];
    const quizzes = document.getElementsByClassName('rc-FormPartsQuestion');
    let questionCounter = 1; // To keep track of the question number

    for (let quiz of quizzes) {
        const quiz_data = quiz.getElementsByClassName('css-1kgqbsw');
        const question = quiz_data[0].textContent;
        const options = Array.from(quiz_data)
            .slice(1)
            .map((opt, index) => {
                const optionLetter = String.fromCharCode(65 + index); // Convert 0 to A, 1 to B, etc.
                return opt.textContent.trim();
            })

        questions.push({
            question: question,
            options: options,
        });

        questionCounter++; // Increment the question number for the next iteration
    }
    return questions;
}

function updatePopupDOM(questions) {
    let prompt = `I am giving a quiz test and below are ${questions.length} questions with their options. I want you to read each question and their options and give me the only correct option in array, array must be 0-indexed like 0 for A, 1 for B and so on. Only give the array as ouput, nothing else.<br><br>`;
    let displayText = '';
    displayText += prompt;
    questions.forEach(q => {
        displayText += `<strong>${q.question}</strong><br>`;
        displayText += `${q.options.replace(/\n/g, '<br>')}<br><br>`; // Convert newlines to <br> for HTML display
    });
    document.getElementById('results').innerHTML = displayText;
    let copyButton = document.getElementById('copyButton');
    copyButton.style.display = "block";
}

function scrapeQuestionAndCheckedOption() {
    const questions = [];
    const quizzes = document.getElementsByClassName('rc-FormPartsQuestion');
    
    for (let quiz of quizzes) {
        const quiz_data = quiz.getElementsByClassName('css-1kgqbsw');
        const isIncorrect = quiz.querySelector('[data-testid="GradeFeedback-caption"]')?.textContent.trim() === "Incorrect";
        if (isIncorrect) continue; // Skip this quiz if the answer is incorrect

        const questionElement = quiz.querySelector(
            '.css-1kgqbsw > p > span > span',
        );
        const question = questionElement
            ? questionElement.textContent.trim()
            : '';
        const options = quiz.querySelectorAll('.rc-Option');
        let checkedOption = '';
        for (let opt of options) {
            const inputElement = opt.querySelector(
                'input[type="radio"][checked]',
            );
            if (inputElement) {
                const optionTextElement = opt.querySelector(
                    '.css-1kgqbsw > p > span > span',
                );
                checkedOption = optionTextElement
                    ? optionTextElement.textContent.trim()
                    : '';
                break;
            }
        }

        if (question && checkedOption) {
            questions.push({
                question: question,
                answer: checkedOption,
            });
        }
    }
    return questions;
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function autoAnswer(answers) {
    const quizzes = document.querySelectorAll('.rc-FormPartsMcq');
    quizzes.forEach((quiz, index) => {
        if (index < answers.length) {
            const options = quiz.querySelectorAll('input[type="radio"]');
            if (options[answers[index]]) {
                options[answers[index]].click();
            }
        }
    });
}

function getAnswerIndex(currentQuiz, savedQuizzes) {
    console.log('Current Quiz', currentQuiz)
    console.log('Saved Quiz', savedQuizzes);
    const existingQuizIndex = savedQuizzes.findIndex(quiz => stringIsSimilar(quiz.question, currentQuiz.question));
    if (existingQuizIndex !== -1) {
        const correctOptionValue = savedQuizzes[existingQuizIndex].answer;
        const currentQuizOptions = currentQuiz.options;
        const correctOptionIndex = currentQuizOptions.findIndex(option => stringIsSimilar(option, correctOptionValue));
        return correctOptionIndex;
    }
    return -1
}

function smartMerge(currentQuizzes, savedQuizzes) {
    const finalQuizzes = []
    for (const currentQuiz of currentQuizzes) {
        // Check if the question already exists in the stored quizzes
        const existingQuizIndex = savedQuizzes.findIndex((quiz) =>
            stringIsSimilar(quiz.question, currentQuiz.question),
        );

        if (existingQuizIndex !== -1) {
            // If the question exists (with a similarity score greater than equal to 0.95), update the existing entry
            savedQuizzes[existingQuizIndex] = currentQuiz;
        } else {
            // Otherwise, append the new quiz
            finalQuizzes.push(currentQuiz);
        }
    }
    return finalQuizzes.concat(savedQuizzes);
}

// Function to handle the file reading and storage
function handleFile(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const uploadedData = JSON.parse(event.target.result);
            if (Array.isArray(uploadedData)) {
                const existingData = JSON.parse(localStorage.getItem('quizzes')) || [];
                const combinedData = smartMerge(existingData, uploadedData);
                localStorage.setItem('quizzes', JSON.stringify(combinedData));
                alert('Answers uploaded successfully!');
            } else {
                alert('Invalid JSON file format.');
            }
        } catch (error) {
            alert('Error parsing JSON file.');
        }
    };
    reader.readAsText(file);
}