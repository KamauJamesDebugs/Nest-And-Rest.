// Import Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// Supabase Credentials
const SUPABASE_URL = 'https://ynwaayatrrjkfcnqwsnn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud2FheWF0cnJqa2ZjbnF3c25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDQ0NDYsImV4cCI6MjA1NjA4MDQ0Nn0.w6Qbs-k9y93Vqm_bje57usbjIJqJGc15NP--Z0S8OQ0';

// Create Supabase Client
const supabase = createClient('https://ynwaayatrrjkfcnqwsnn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud2FheWF0cnJqa2ZjbnF3c25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDQ0NDYsImV4cCI6MjA1NjA4MDQ0Nn0.w6Qbs-k9y93Vqm_bje57usbjIJqJGc15NP--Z0S8OQ0');
console.log("✅ Supabase Connected!");
// Fetch the logged-in user
async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error('Error fetching user:', error);
        return null;
    }
    return user;
}

// Fetch cart items from the database for the logged-in user
async function fetchCart() {
    const user = await getUser();
    if (!user) {
        alert("Please log in to view your cart.");
        return;
    }

    // Fetch cart items for the logged-in user
    const { data: cartItems, error } = await supabase
        .from('cart')
        .select('*, products(name, price, image_url)')  // Fetch associated product info
        .eq('user_id', user.id);

    if (error) {
        console.error("Error fetching cart items:", error);
        return;
    }

    displayCart(cartItems);
}

// Display cart items in the UI
function displayCart(cartItems) {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = ''; // Clear existing items

    let total = 0;

    cartItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.products.name} x${item.quantity} - Ksh ${item.products.price}`;

        total += item.products.price * item.quantity;

        // Add a remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = "Remove";
        removeBtn.onclick = () => removeFromCart(item.id);

        li.appendChild(removeBtn);
        cartContainer.appendChild(li);
    });

    // Update the total price
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

// Remove item from cart in the database
async function removeFromCart(cartItemId) {
    const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartItemId);

    if (error) {
        console.error("Error removing item from cart:", error);
        return;
    }

    fetchCart();  // Refresh the cart after removal
}

// Clear all items from the cart
async function clearCart() {
    const user = await getUser();
    if (!user) {
        alert("Please log in to clear your cart.");
        return;
    }

    const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

    if (error) {
        console.error("Error clearing cart:", error);
        return;
    }

    fetchCart();  // Refresh the cart after clearing
}

// Event listener for clear cart button
document.getElementById('clear-cart').addEventListener('click', clearCart);

// Load cart items when the page loads
document.addEventListener('DOMContentLoaded', fetchCart);