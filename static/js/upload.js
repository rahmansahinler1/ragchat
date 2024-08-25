function initFileUpload(uploadButton, fileInput) {
    uploadButton.addEventListener('click', function() {
        console.log("Upload button clicked");
        fileInput.click();
    });

    fileInput.addEventListener('change', function(event) {
        console.log("File selected");
        const file = event.target.files[0];
        if (file) {
            uploadFile(file);
        }
    });
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file)

    try {
        const response = await fetch('/api/v1/upload_file/', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('HTTP error! status: ${response.status}');
        }

        const result = await response.json();
        if (typeof window.addMessageToChat === 'function') {
            window.addMessageToChat('System', 'File uploaded correctly ${result.filename}');
        } else {
            console.error('addMessageToChat function is not available!');
        }
    } catch (error) {
        console.error('Error uploading file!', error)
    }
}

window.initFileUpload = initFileUpload;
