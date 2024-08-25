function initIndexOperations(createIndexButton, loadIndexButton) {
    createIndexButton.addEventListener('click', () => console.log('Create Index clicked'));
    loadIndexButton.addEventListener('click', () => console.log('Load Index clicked'));
}

window.initIndexOperations = initIndexOperations;
