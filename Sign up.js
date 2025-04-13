// Import Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// Supabase Credentials
const SUPABASE_URL = 'https://ynwaayatrrjkfcnqwsnn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud2FheWF0cnJqa2ZjbnF3c25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDQ0NDYsImV4cCI6MjA1NjA4MDQ0Nn0.w6Qbs-k9y93Vqm_bje57usbjIJqJGc15NP--Z0S8OQ0';

// Create Supabase Client
const supabase = createClient('https://ynwaayatrrjkfcnqwsnn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud2FheWF0cnJqa2ZjbnF3c25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDQ0NDYsImV4cCI6MjA1NjA4MDQ0Nn0.w6Qbs-k9y93Vqm_bje57usbjIJqJGc15NP--Z0S8OQ0');
console.log("✅ Supabase Connected!");

document.addEventListener("DOMContentLoaded", () => {
    
    // 📌 GOOGLE SIGN-IN
    const googleSignInBtn = document.getElementById('google-signin');

    if (googleSignInBtn) {
        googleSignInBtn.addEventListener("click", async () => {
            console.log("✅ Google Sign-In Button Clicked!");

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/myaccount.html` }
            });

            if (error) {
                console.error("❌ Google Sign-in Error:", error.message);
                alert("Google Sign-in failed: " + error.message);
            }
        });
    } else {
        console.error("❌ Google Sign-In button not found!");
    }

    // 📌 AUTH STATE CHANGE (Triggers after Google sign-in)
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
            console.log("✅ User signed in:", session.user);
            await saveUserToDB(session.user);
        }
    });
});
