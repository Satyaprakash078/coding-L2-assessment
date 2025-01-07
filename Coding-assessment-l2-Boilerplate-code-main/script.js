async function fetchCartData() {
    try {
        const response = await fetch(
            "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889"
        );
        const data = await response.json();
        console.log("Fetched Data:", data); // Log the fetched data
        return data;
    } catch (error) {
        console.error("Error fetching cart data:", error);
    }
}

// Format price in Indian Rupees (₹)
function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(price);
}

// Render cart items dynamically
function renderCartItems(cartItems) {
    const cartLeftContainer = document.querySelector(".cart-left");
    if (!cartLeftContainer) {
        console.error("Cart left container not found!");
        return;
    }
    cartLeftContainer.innerHTML = ""; // Clear existing items

    if (!Array.isArray(cartItems)) {
        console.error("cartItems is not an array:", cartItems);
        return;
    }

    cartItems.forEach((item) => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-item-details">
                <h3>${item.title}</h3>
                <p>${formatPrice(item.price / 100)}</p>
                <div class="cart-item-quantity">
                    <input type="number" value="${item.quantity}" min="1" data-id="${item.id}">
                </div>
                <div class="cart-item-subtotal">${formatPrice((item.price / 100) * item.quantity)}</div>
            </div>
            <i class="ri-delete-bin-line remove-item" data-id="${item.id}"></i> <!-- Trash Icon -->
        `;

        cartLeftContainer.appendChild(cartItem);
    });

    // Add event listeners for quantity changes
    addQuantityEventListeners();

    // Add event listeners for remove buttons
    addRemoveEventListeners();

    // Update totals
    updateCartTotal(cartItems); // Pass cartItems to update totals
}

// Add event listeners for quantity input fields
function addQuantityEventListeners() {
    const quantityInputs = document.querySelectorAll(".cart-item-quantity input");
    quantityInputs.forEach((input) => {
        input.addEventListener("change", (e) => {
            const itemId = e.target.dataset.id;
            const newQuantity = parseInt(e.target.value);

            // Update the quantity in the cart data
            const cartItem = cartData.find((item) => item.id == itemId);
            if (cartItem) {
                cartItem.quantity = newQuantity;
                renderCartItems(cartData); // Re-render to update subtotals
                updateCartTotal(cartData); // Update the totals
            }
        });
    });
}

// Add event listeners for remove buttons
function addRemoveEventListeners() {
    const removeButtons = document.querySelectorAll(".remove-item");
    removeButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const itemId = e.target.dataset.id;

            // Remove the item from the cart data
            cartData = cartData.filter((item) => item.id != itemId);
            renderCartItems(cartData); // Re-render the cart
            updateCartTotal(cartData); // Update the totals
        });
    });
}

// Function to update the cart total
function updateCartTotal(cartItems) {
    let subtotal = 0;

    cartItems.forEach((item) => {
        subtotal += (item.price / 100) * item.quantity; // Calculate subtotal
    });

    const total = subtotal; // Assuming no taxes or discounts for now

    // Update the subtotal and total in the DOM
    document.getElementById("subtotal").textContent = formatPrice(subtotal);
    document.getElementById("total").textContent = formatPrice(total);
}

// Initialize the cart
let cartData = [];
async function initializeCart() {
    const data = await fetchCartData();
    if (data && data.items) {
        cartData = data.items; // Use data.items instead of data
        renderCartItems(cartData);
    } else {
        console.error("Invalid data format:", data);
    }
}

// Run the cart initialization
initializeCart();