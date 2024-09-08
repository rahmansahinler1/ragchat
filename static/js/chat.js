function initChat(chatArea, userInput, sendButton) {
    sendButton.addEventListener('click', () => sendMessage(chatArea, userInput));
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage(chatArea, userInput);
        }
    });

    // Expose sendMessage to global scope
    window.sendMessage = (message) => {
        addMessageToChat(chatArea, 'ragchat', message);
    };
}

async function sendMessage(chatArea, userInput) {
    const message = userInput.value.trim();
    if (message) {
        addMessageToChat(chatArea, 'you', message);
        try {
            const response = await fetch('/api/v1/qa/generate_answer', {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error('Failed to generate response!');
            }
            const changedFileMessages = await response.json();
            changedFileMessages.forEach(message => {
                window.sendMessage(message);
            });
            window.sendMessage("Memory is sync. You can start asking!");
    
        } catch (error) {
            console.error('Error checking for changes:', error);
            window.sendMessage('Error while checking changes!')
        }
    }
}

function addMessageToChat(chatArea, sender, message) {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatArea.appendChild(messageElement);
    chatArea.scrollTop = chatArea.scrollHeight;
}

window.initChat = initChat;
