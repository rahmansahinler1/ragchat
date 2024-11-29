window.checkVersion = async function checkVersion() {
    try {
        const response = await fetch('/api/version');
        const data = await response.json();
        const currentVersion = localStorage.getItem('appVersion');
        
        if (!currentVersion) {
            localStorage.setItem('appVersion', data.version);
            return;
        }

        if (data.version !== currentVersion) {
            localStorage.setItem('appVersion', data.version);
            window.location.reload(true);
        }
    } catch (error) {
        console.error('Version check failed:', error);
    }
}

window.fetchUserInfo = async function(userID) {
    try {
        const response = await fetch('/api/v1/db/get_user_info', {
            method: 'POST',
            body: JSON.stringify({ user_id: userID }),
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch initial user data');
        }

        const data = await response.json();

        if (!data) {
            console.error('User could not be found!');
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching initial user data:', error);
        return null;
    }
};

window.selectDomain = async function selectDomain(domainId, userID) {
    try {
        const url = `/api/v1/qa/select_domain?userID=${encodeURIComponent(userID)}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                domain_id: domainId
            })
        });

        if (!response.ok) {
            return 0;
        }

        const data = await response.json();
        
        if (data["message"] !== "success") {
            return 0;
        }

        return 1;

    } catch (error) {
        console.error('Error selecting domain', error);
        return 0;
    }
}