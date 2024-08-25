function initChat(chatArea, userInput, sendButton) {
    sendButton.addEventListener('click', () => sendMessage(chatArea, userInput));
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage(chatArea, userInput);
        }
    });

    window.addMessageToChat = (sender, message) => addMessageToChat(chatArea, sender, message);
}

function sendMessage(chatArea, userInput) {
    const message = userInput.value.trim();
    if (message) {
        addMessageToChat(chatArea, 'you', message);
        userInput.value = '';
        // Here you would typically send the message to your backend
        // For now, we'll just mock a response
        setTimeout(() => {
            addMessageToChat(chatArea, 'ragchat: ', 'This is a mock response from the chatbot.');
        }, 1000);
    }
}

function addMessageToChat(chatArea, sender, message) {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatArea.appendChild(messageElement);
    chatArea.scrollTop = chatArea.scrollHeight;
}

window.initChat = initChat;
