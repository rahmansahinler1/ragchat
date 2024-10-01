document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('.file-checkbox');
    const checkboxes2 = document.querySelectorAll('.file-checkbox2');
    const removeButton = document.getElementById('domain-remove');
    const removeButton2 = document.getElementById('btn-remove');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
            removeButton.disabled = !anyChecked;
        });
    });
    checkboxes2.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const anyChecked = Array.from(checkboxes2).some(cb => cb.checked);
            removeButton2.disabled = !anyChecked;
        });
    });

    removeButton.addEventListener('click', function() {
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                checkbox.closest('.file-item').remove();
            }
        });
        removeButton.disabled = true;
    });
    removeButton2.addEventListener('click', function() {
        checkboxes2.forEach(checkbox => {
            if (checkbox.checked) {
                checkbox.closest('.file-item').remove();
            }
        });
        removeButton2.disabled = true;
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const fileLists = document.querySelectorAll('.file-list, .chosen-files-list');
    const emptyMessages = document.querySelectorAll('.empty-message');

    function updateEmptyMessages() {
        fileLists.forEach((fileList, index) => {
            const emptyMessage = emptyMessages[index];
            if (fileList.children.length === 0) {
                emptyMessage.style.display = 'block';
            } else {
                emptyMessage.style.display = 'none';
            }
        });
    }

    updateEmptyMessages();

    fileLists.forEach(fileList => {
        const observer = new MutationObserver(updateEmptyMessages);
        observer.observe(fileList, { childList: true });
    })});
    document.addEventListener('DOMContentLoaded', function() {
        const fileLists = document.querySelectorAll('.file-list, .chosen-files-list');
        const emptyMessages = document.querySelectorAll('.empty-message');
    
        function updateEmptyMessages() {
            fileLists.forEach((fileList, index) => {
                const emptyMessage = emptyMessages[index];
                const fileItems = fileList.querySelectorAll('.file-item');
                if (fileItems.length === 0) {
                    emptyMessage.style.display = 'block';
                } else {
                    emptyMessage.style.display = 'none';
                }
            });
        }
    
        updateEmptyMessages();
    
        fileLists.forEach(fileList => {
            const observer = new MutationObserver(updateEmptyMessages);
            observer.observe(fileList, { childList: true });
        })});
    
        function togglePassword() {
            const passwordInput = document.getElementById("password");
            if (passwordInput.type === "password") {
              passwordInput.type = "text";
              
            } else {
              passwordInput.type = "password";
            }
          }
          function scrollDown() {
            window.scrollBy(0, window.innerHeight);
        }