       // Disable Right Click
       document.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    document.addEventListener("keydown", function(e) {
        if (
            e.key === "F12" ||
            (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
            (e.ctrlKey && e.key === "U")
        ) {
            e.preventDefault();
        }
    });

    document.addEventListener("keydown", function(e) {
        if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
            e.preventDefault();
        }
    });

    window.addEventListener("beforeunload", function(event) {
        if (cart.length > 0) {
            event.preventDefault();
            event.returnValue = "Changes you made may not be saved."; // This triggers the default browser warning.
        }
    });

    window.onscroll = function() {
        let scrollTopBtn = document.getElementById("scrollTopBtn");
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            scrollTopBtn.style.display = "block";
        } else {
            scrollTopBtn.style.display = "none";
        }
    };

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }



    let cart = [];

    function addToCart(productName, price) {
        // Check if the product is already in the cart
        let existingItem = cart.find(item => item.name === productName);

        if (existingItem) {
            existingItem.qty += 1; // Increase quantity
        } else {
            cart.push({
                name: productName,
                price: price,
                qty: 1
            });
        }

        updateCartUI(); // Update the cart UI

        // Show toast notification
        document.getElementById("toast-message").innerText = `${productName} added to cart!`;
        let toastElement = new bootstrap.Toast(document.getElementById("cartToast"));
        toastElement.show();
    }
    

    function updateCartUI() {
        let cartItemsContainer = document.getElementById("cart-items");
        let cartCount = document.getElementById("cart-count");
        let cartTotal = document.getElementById("cart-total");

        cartItemsContainer.innerHTML = "";
        let totalAmount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<tr><td colspan="5" class="text-center">Your cart is empty</td></tr>';
        } else {
            cart.forEach((item, index) => {
                let itemTotal = item.price * item.qty;
                totalAmount += itemTotal;

                cartItemsContainer.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>Rp. ${item.price.toLocaleString()}</td>
                <td style="width: 100px;">
                    <div class="d-flex align-items-center flex-nowrap">
                        <button class="btn btn-sm btn-warning px-2" onclick="changeQty(${index}, -1)">-</button>
                        <input type="number" class="form-control form-control-sm text-center mx-1 qty-input" 
                            value="${item.qty}" min="1" onchange="updateQty(${index}, this.value)" 
                            style="max-width: 45px;">
                        <button class="btn btn-sm btn-warning px-2" onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </td>
                <td>Rp. ${itemTotal.toLocaleString()}</td>
                <td><button class="btn btn-sm btn-danger" onclick="removeItem(${index})">🗑</button></td>
            </tr>
        `;
            });
        }

        cartTotal.innerText = `Rp. ${totalAmount.toLocaleString()}`;
        cartCount.innerText = cart.length;
    }

    function changeQty(index, change) {
        let newQty = cart[index].qty + change;
        if (newQty > 0) {
            cart[index].qty = newQty;
        } else {
            cart.splice(index, 1); // Remove item if qty = 0
        }
        updateCartUI();
    }
    
    function updateQty(index, value) {
        let newQty = parseInt(value);
        if (!isNaN(newQty) && newQty > 0) {
            cart[index].qty = newQty;
        } else {
            cart[index].qty = 1; // Default to 1 if invalid input
        }
        updateCartUI();
    }

    function removeItem(index) {
        cart.splice(index, 1);
        updateCartUI();
    }

    function clearCart() {
        cart = [];
        updateCartUI();
    }

    function checkout() {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        console.log("Cart contents:", cart); // Debugging

        let checkoutItems = document.getElementById("checkout-items");
        let totalPrice = 0;
        let rows = "";

        cart.forEach((item, index) => {
            console.log(`Item ${index}:`, item); // Debugging output

            if (!item || typeof item.price === "undefined" || typeof item.qty === "undefined") {
                console.error("Error: Missing data in cart item", item);
                return;
            }

            let itemTotal = item.price * item.qty;
            totalPrice += itemTotal;

            rows += `
        <tr>
            <td>${item.name || "Unknown"}</td>
            <td>Rp. ${item.price.toLocaleString()}</td>
            <td>${item.qty}</td>
            <td>Rp. ${itemTotal.toLocaleString()}</td>
        </tr>
    `;
        });

        // Update the table
        checkoutItems.innerHTML = rows;

        // Update total price
        document.getElementById("checkout-total").textContent = `Rp. ${totalPrice.toLocaleString()}`;

        // Show the checkout modal
        let checkoutModal = new bootstrap.Modal(document.getElementById("checkoutModal"));
        checkoutModal.show();
    }


    function processCheckout() {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        let storeName = document.getElementById("storeName").value.trim();
        let customerName = document.getElementById("customerName").value.trim();
        let phoneNumber = document.getElementById("customerPhone").value.trim();
        let address = document.getElementById("customerAddress").value.trim();

        if (!storeName || !customerName || !phoneNumber || !address) {
            alert("Please fill in all fields.");
            return;
        }

        let message = `*Incoming Order*\n\n`;
        message += `${storeName}\n`;
        message += `${customerName} - ${phoneNumber}\n\n`;

        message += `Items:\n\n`;


        let totalPrice = 0;
        cart.forEach((item) => {
            let itemTotal = item.price * item.qty;
            totalPrice += itemTotal;

            message += `*${item.name}*\n`;
            message += `    - Rp. ${item.price.toLocaleString()} @${item.qty} Rp. ${itemTotal.toLocaleString()}\n`;
        });

        message += `-----------------------------------\n`;
        message += `Total: Rp. ${totalPrice.toLocaleString()}\n\n`;
        message += `Shipping Address:\n${address}`;

        // Encode message for WhatsApp
        let encodedMessage = encodeURIComponent(message);

        // WhatsApp link
        let whatsappURL = `https://wa.me/62859106559658?text=${encodedMessage}`;

        // Hide modal
        let checkoutModal = bootstrap.Modal.getInstance(document.getElementById("checkoutModal"));
        checkoutModal.hide();

        // Clear cart
        cart = [];
        updateCartUI();

        // Redirect to WhatsApp
        window.location.href = whatsappURL;
    }

    function filterProducts(category) {
        let products = document.getElementsByClassName("product-card");

        for (let i = 0; i < products.length; i++) {
            let productCategory = products[i].getAttribute("data-category"); // Get category from data attribute

            if (category === 'all' || productCategory === category) {
                products[i].style.display = "block";
            } else {
                products[i].style.display = "none";
            }
        }
    }

    function searchProducts() {
        let input = document.getElementById("searchInput").value.toLowerCase();
        let cards = document.getElementsByClassName("product-card");

        for (let i = 0; i < cards.length; i++) {
            let title = cards[i].getElementsByClassName("card-title")[0].innerText.toLowerCase();
            if (title.includes(input)) {
                cards[i].style.display = "block";
            } else {
                cards[i].style.display = "none";
            }
        }
    }