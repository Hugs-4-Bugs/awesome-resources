let isResponseInProgress = false;
let controller;

document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const userQuery = document.getElementById("user-query");
    const sendBtn = document.getElementById("send-btn");
    const stopBtn = document.getElementById("stop-btn");

    let isResponseInProgress = false;
    let controller;

    sendBtn.addEventListener("click", function () {
        sendQuery();
    });

    userQuery.addEventListener("keypress", function (event) {
        if (event.key === 'Enter' && !event.shiftKey) { // Prevents form submission
            event.preventDefault();
            sendQuery();
        }
    });

    function sendQuery() {
        let query = userQuery.value.trim();
        if (query === "") return;

        // Display user's message
        displayMessage(query, 'user');

        // Clear the input field
        userQuery.value = "";

        // Show the Stop button
        stopBtn.style.display = 'inline-block';

        if (isResponseInProgress) return; // Prevent multiple responses
        isResponseInProgress = true;

        controller = new AbortController(); // Create a new AbortController for each request

        fetch(`http://localhost:8180/api/v1/ai/stream?query=${encodeURIComponent(query)}`, {
            signal: controller.signal
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result = '';

            // Create a single AI message div
            let aiMessageDiv = displayMessage("", 'ai');

            function processText({ done, value }) {
                if (done) {
                    isResponseInProgress = false;
                    stopBtn.style.display = 'none'; // Hide stop button
                    return;
                }

                result += decoder.decode(value, { stream: true });
                aiMessageDiv.innerText = result; // Update the single div instead of creating new ones
                reader.read().then(processText);
            }

            reader.read().then(processText);
        })
        .catch(error => {
            displayMessage('Error: Unable to communicate with AI. ' + error.message, 'ai');
            console.error('Fetch error:', error);
            isResponseInProgress = false;
            stopBtn.style.display = 'none'; // Hide Stop button on error
        });
    }

    // Stop Button functionality
    stopBtn.addEventListener('click', function () {
        if (controller) {
            controller.abort(); // Abort the fetch request
            isResponseInProgress = false;
            stopBtn.style.display = 'none'; // Hide the Stop button
            displayMessage("Response stopped.", 'ai');
        }
    });

    // Function to display messages
    function displayMessage(message, sender) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender === "user" ? "user-message" : "ai-message");

        if (sender === 'ai') {
            messageDiv.setAttribute('dir', 'ltr'); // Ensure left-to-right text direction
        }

        messageDiv.innerText = message;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageDiv; // Return the div so we can update it for streaming responses
    }

    // Toggle between Light and Dark Modes
    document.getElementById("toggle-mode-btn").addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        const modeIcon = document.getElementById("mode-icon");
        if (document.body.classList.contains("dark-mode")) {
            modeIcon.classList.replace("fa-moon", "fa-sun");
        } else {
            modeIcon.classList.replace("fa-sun", "fa-moon");
        }
    });
});
