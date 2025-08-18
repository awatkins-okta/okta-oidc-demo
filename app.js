// ⚠️ PASTE YOUR OKTA CONFIGURATION HERE
const oktaConfig = {
    issuer: 'https://awatkins-oie.oktapreview.com/oauth2/default', // e.g., https://dev-12345.okta.com/oauth2/default
    clientId: '0oap9k1jqdu3opdfb1d7', // The Client ID you copied from Okta
    redirectUri: window.location.origin + window.location.pathname, // This uses the current page URL
    scopes: ['openid', 'profile', 'email', 'offline_access']
};

// Initialize the OktaAuth object
const authClient = new OktaAuth(oktaConfig);

// Get references to DOM elements
const loggedOutView = document.getElementById('logged-out-view');
const loggedInView = document.getElementById('logged-in-view');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const userProfile = document.getElementById('user-profile');

// Function to update the UI based on authentication state
const updateUI = async () => {
    const isAuthenticated = await authClient.isAuthenticated();
    if (isAuthenticated) {
        // User is logged in
        loggedOutView.style.display = 'none';
        loggedInView.style.display = 'block';
        const user = await authClient.getUser();
        // Get the access token from the token manager
        const accessToken = authClient.tokenManager.getSync('accessToken');
        const grantedScopes = accessToken ? accessToken.scopes : [];
        
        // Create a new object to display both profile and scopes
        const displayData = {
            userInfo: user,
            grantedScopes: grantedScopes
        };
        userProfile.textContent = JSON.stringify(displayData, null, 2);
        
    } else {
        // User is logged out
        loggedOutView.style.display = 'block';
        loggedInView.style.display = 'none';
        userProfile.textContent = '';
    }
};

// Handle the redirect callback from Okta
const handleAuth = async () => {
    // Check if the URL contains authentication tokens
    if (authClient.isLoginRedirect()) {
        try {
            // Parse tokens and store them
            await authClient.handleLoginRedirect();
        } catch (err) {
            console.error('Error handling login redirect:', err);
        }
    }
    updateUI(); // Update the UI regardless
};

// Add event listeners for login and logout
loginButton.addEventListener('click', () => {
    authClient.signInWithRedirect();
});

logoutButton.addEventListener('click', () => {
    // Explicitly provide the post-logout redirect URI to fix the issue.
    // This uses the same redirectUri defined in your oktaConfig.
    authClient.signOut({
        postLogoutRedirectUri: oktaConfig.redirectUri
    });
});

// Run the authentication check when the page loads
handleAuth();
