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
    } = await supabase.auth.getUser()
  
    if (error) {
      console.error('Error fetching user:', error)
      return null
    }
    return user
  }
  
  // Add product to cart (persistent)
  async function addToCart(productId) {
    const user = await getUser()
    if (!user) {
      alert("Please log in to add items to your cart.")
      return
    }
  
    // Check if product is already in cart
    const { data: existingItem } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle()
  
    if (existingItem) {
      // Update quantity
      await supabase
        .from('cart')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id)
    } else {
      // Insert new cart item
      await supabase.from('cart').insert([
        {
          user_id: user.id,
          product_id: productId,
          quantity: 1,
        },
      ])
    }
  
    alert("Product added to cart!")
  }
  
  // Fetch and display products
  async function fetchProducts() {
    const { data: products, error } = await supabase.from('products').select('*')
  
    if (error) {
      console.error("Failed to load products:", error)
      return
    }
  
    const container = document.getElementById('products-container')
    container.innerHTML = ''
  
    products.forEach(product => {
      const productCard = document.createElement('div')
      productCard.className = 'product'
      productCard.innerHTML = `
        <img src="${product.image_url}" alt="${product.name}">
        <h2>${product.name}</h2>
        <p>Ksh ${product.price}</p>
        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
      `
      container.appendChild(productCard)
    })
  
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id')
        addToCart(productId)
      })
    })
  }
  
  // Theme switch
  document.getElementById("toggle-theme").addEventListener("click", () => {
    document.body.classList.toggle("luxury")
    document.body.classList.toggle("cozy")
  })
  
  // Dark mode
  document.getElementById("toggle-mode").addEventListener("click", () => {
    document.body.classList.toggle("dark")
  })
  
  // View cart
  document.getElementById("view-cart").addEventListener("click", () => {
    window.location.href = "cart.html"
  })
  
  // Load products on page load
  fetchProducts()