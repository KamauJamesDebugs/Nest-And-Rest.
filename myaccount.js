import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ynwaayatrrjkfcnqwsnn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud2FheWF0cnJqa2ZjbnF3c25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDQ0NDYsImV4cCI6MjA1NjA4MDQ0Nn0.w6Qbs-k9y93Vqm_bje57usbjIJqJGc15NP--Z0S8OQ0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ Checking User Session...");

async function getUserSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error("❌ Error fetching session:", error.message);
        return;
    }

    if (data.session) {
        const user = data.session.user;
        console.log("✅ User Logged In:", user);

        // Update UI with user data
        document.getElementById("user-name").textContent = user.user_metadata.full_name;
        document.getElementById("user-picture").src = user.user_metadata.avatar_url;

        // ✅ Replace history **after confirming session**  
        history.replaceState(null, "", "index.html");

    } else {
        console.warn("❌ No active session found. Redirecting to login...");
        window.location.replace("index.html"); // Redirect if no session
    }
}

// Logout function
async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("❌ Error logging out:", error.message);
    } else {
        console.log("✅ User logged out successfully!");
        window.location.replace("index.html"); // Redirect to login page
    }
}

// Attach event listener to logout button
document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.querySelector(".btn-logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }
});

// Fetch session when page loads
getUserSession();