function initChat(chatArea, userInput, sendButton) {
    sendButton.addEventListener('click', () => sendMessage(userInput));
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage(userInput);
        }
    });
    window.chatArea = chatArea;
}

function initDataPipeline(checkChangesButton) {
    checkChangesButton.addEventListener('click', () => checkChanges());
}

function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    window.chatArea.appendChild(messageElement);
    window.chatArea.scrollTop = window.chatArea.scrollHeight;
}

async function checkChanges() {
    try {
        const response = await fetch('/api/v1/data_pipeline/check_changes', {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to check for changes');
        }
        const changedFileMessages = await response.json();
        changedFileMessages.forEach(message => {
            window.addMessageToChat(message, 'ragchat');
        });
        window.addMessageToChat("Memory is sync. You can start asking!", 'ragchat');

    } catch (error) {
        console.error('Error checking for changes:', error);
        window.addMessageToChat('Error while checking changes!', 'ragchat')
    }
}

async function sendMessage(userInput) {
    const message = userInput.value.trim();
    if (message) {
        window.addMessageToChat(message, 'you');
        try {
            const response = await fetch('/api/v1/qa/generate_answer', {
                method: 'POST',
                body: JSON.stringify({ user_query: message }),
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error('Failed to generate response!');
            }
            const data = await response.json();
            window.addMessageToChat(data.response, 'ragchat');
            data.resources.forEach(resource => {
                window.addMessageToChat(`File: ${resource.file_name}//Page: ${resource.page}`, 'ragchat');
            });
        } catch (error) {
            console.error('Error checking for changes:', error);
            window.addMessageToChat('Error while checking changes!', 'ragchat')
        }
    }
}

window.initChat = initChat;
window.addMessageToChat = addMessageToChat;
