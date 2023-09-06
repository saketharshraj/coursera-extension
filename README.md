# Coursera Fun Extension

This Chrome extension was developed purely for fun and as a learning experience. It's essential to note that using tools to copy-paste answers on Coursera or any other educational platform is against their guidelines. This extension is not intended to promote or encourage such behavior. Instead, it serves as a testament to the developer's curiosity and desire to learn.


## Features

### Normal User Mode
- **Drop and Mark**: Users can simply drop an `answer.json` file and click on "Mark Answer". If the JSON file contains the answer for the question on the page, it will be automatically marked.

### Developer Mode
- **Save Results**: Developers can create their answers by clicking on "Save Result". As the user clicks on this, the currently marked answer is saved in local storage.
- **Smart Merge**: If the same question appears again, the extension performs a smart merge of answers.
- **Export Answers**: Developers can export the saved answers as a JSON file and share it with normal users.
- **Generate Prompt**: This feature generates all the questions with options which can be copy-pasted into any generative AI. The result from the generative AI can be pasted back to the extension as an array, and it automatically populates the answer in the quiz.


## Developer's Guide

### Getting Started with Development

For those who wish to delve deeper into the extension's development or contribute, here's a step-by-step guide:

1. **Repository Setup**: Begin by forking and then cloning the repository onto your computer.
    ```bash
    git clone https://github.com/saketharshraj/coursera-extension
    ```

2. **Integrate with Chrome**:
   - Launch Chrome.
   - Navigate to `chrome://extensions/`.
   - Activate "Developer mode".
   - Opt for "Load unpacked" and navigate to the `extension` directory of the cloned repo.

3. **Code Modifications**: Implement and refine your changes.

4. **Assess Your Updates**: Before finalizing, ensure your modifications work seamlessly, especially within a Coursera course context.

5. **Pull Request Initiation**: Once satisfied, initiate a pull request to the primary repository for evaluation.

### How to Contribute

Your contributions can make this project even better! If you're considering contributing, here's a streamlined process:

1. Start by forking the repository.
2. Initiate a new branch dedicated to your feature or fix.
3. Implement and rigorously test your changes.
4. Propose a pull request to the primary repository for assessment.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.