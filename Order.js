// Import Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// Supabase Credentials
const SUPABASE_URL = 'https://ynwaayatrrjkfcnqwsnn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud2FheWF0cnJqa2ZjbnF3c25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDQ0NDYsImV4cCI6MjA1NjA4MDQ0Nn0.w6Qbs-k9y93Vqm_bje57usbjIJqJGc15NP--Z0S8OQ0';

// Create Supabase Client
const supabase = createClient('https://ynwaayatrrjkfcnqwsnn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud2FheWF0cnJqa2ZjbnF3c25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDQ0NDYsImV4cCI6MjA1NjA4MDQ0Nn0.w6Qbs-k9y93Vqm_bje57usbjIJqJGc15NP--Z0S8OQ0');
console.log("✅ Supabase Connected!");

// Get logged-in user
async function getUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
  
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return user;
    }
    // Function to fetch the cart items for the logged-in user
async function getCartItems() {
    const user = await getUser(); // Get the logged-in user
    if (!user) return;
  
    // Query the 'cart' table to get the items for the current user
    const { data, error } = await supabase
      .from('cart') // Assuming your cart table is named 'cart'
      .select('id, product_id, quantity') // Select relevant fields (you can adjust this as needed)
      .eq('user_id', user.id); // Match the user ID
  
    if (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }
  
    return data; // Return the cart items
  }
  
  // Function to fetch and display cart items
  async function displayCartItems() {
    const cartItems = await getCartItems(); // Get cart items for the logged-in user
    if (!cartItems || cartItems.length === 0) {
      document.getElementById('cart-items-list').innerHTML = 'Your cart is empty.';
      return;
    }
  
    // Get the cart items list container
    const cartItemsList = document.getElementById('cart-items-list');
    cartItemsList.innerHTML = ''; // Clear previous items
  
    // Loop through the cart items and display them
    cartItems.forEach(async (item) => {
      // You can get the product details (e.g., name, price) by querying the 'products' table using the product_id
      const { data: product, error } = await supabase
        .from('products') // Assuming you have a 'products' table
        .select('id, name, price') // Adjust the fields as needed
        .eq('id', item.product_id)
        .single();
  
      if (error) {
        console.error('Error fetching product details:', error);
        return;
      }
  
      // Create a list item for the cart
      const li = document.createElement('li');
      li.textContent = `${product.name} - Quantity: ${item.quantity} - Price: $${product.price.toFixed(2)}`;
      
      // Append the item to the cart list
      cartItemsList.appendChild(li);
    });
  }
  
  // Call the displayCartItems function to show the cart items when the page loads
  displayCartItems();

  
  // Handle the form submission
  async function handleOrderSubmission(event) {
    event.preventDefault(); // Prevent form submission (page reload)
  
    // Get the logged-in user
    const user = await getUser();
    if (!user) {
      alert('You must be logged in to place an order.');
      return;
    }
  
    // Get customer details from the modal form
    const customerName = document.querySelector('input[type="text"][placeholder="Full Name"]').value;
    const email = document.querySelector('input[type="email"][placeholder="Email"]').value;
    const shippingAddress = document.querySelector('input[type="text"][placeholder="Shipping Address"]').value;
    const phoneNumber = document.querySelector('input[type="tel"][placeholder="Phone Number"]').value;
  
    // Insert order data into the 'orders' table
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user.id, // Use logged-in user ID
          customer_name: customerName,
          customer_email: email,
          shipping_address: shippingAddress,
          phone_number: phoneNumber,
          created_at: new Date(), // Automatically set the timestamp
        }
      ]);
  
    if (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit your order.');
    } else {
      console.log('Order submitted successfully:', data);
      alert('Your order has been submitted successfully!');
      // Close the modal after successful submission
      document.getElementById('modal').classList.remove('active');
    }
  }
  
  // Add event listener for the form submission
  document.querySelector('.modal form').addEventListener('submit', handleOrderSubmission);
  
  document.getElementById('placeOrderBtn').addEventListener('click', async () => {
    const user = await getUser();
    if (!user) return alert("Please log in first.");
  
    // 1. Fetch the latest order details for the user
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('customer_name, customer_email, shipping_address, phone_number')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) // get latest one
      .limit(1)
      .single();
  
    if (orderError || !orderData) {
      console.error('Order fetch error:', orderError);
      return alert("No customer details found.");
    }
  
    // 2. Fetch cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart')
      .select('product_id, quantity')
      .eq('user_id', user.id);
  
    if (cartError || !cartItems || cartItems.length === 0) {
      console.error('Cart fetch error:', cartError);
      return alert("Cart is empty.");
    }
  
    // 3. For each cart item, fetch the product info
    const orderItemsTextArray = await Promise.all(cartItems.map(async item => {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name, price')
        .eq('id', item.product_id)
        .single();
  
      if (productError) {
        console.error('Product fetch error:', productError);
        return `Unknown product (x${item.quantity})`;
      }
  
      return `- ${product.name} x${item.quantity} @ $${product.price}`;
    }));
  
    const orderItemsText = orderItemsTextArray.join('\n');
  
    // 4. Build full message for email
    const emailBody = `
  ✅ NEW ORDER RECEIVED
  
  📦 Order Items:
  ${orderItemsText}
  
  🧑 Customer:
  Name: ${orderData.customer_name}
  Email: ${orderData.customer_email}
  Phone: ${orderData.phone_number}
  Address: ${orderData.shipping_address}
  
  🔐 User ID: ${user.id}
    `;
  
    // 5. Send email via EmailJS
    emailjs.send("service_f4ysnsc", "template_joolt2d", {
      message: emailBody,
      user_email: orderData.customer_email, // Make sure this matches the variable in your EmailJS template
    })
    .then(() => {
      const statusMsg = document.getElementById("status-message");
      if (statusMsg) statusMsg.textContent = "✅ Order email sent!";
      alert("Order email sent successfully!");
    })
    .catch(error => {
      console.error("Email send error:", error);
      const statusMsg = document.getElementById("status-message");
      if (statusMsg) statusMsg.textContent = "❌ Failed to send email.";
      alert("Failed to send order email.");
    });
  });