
const products = [
  {
    id: 1, name: "Everyday Canvas Tote", category: "Fashion",
    price: 799, oldPrice: 999, badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2, name: "Classic Everyday Sneakers", category: "Fashion",
    price: 1899, oldPrice: 2299, badge: "POPULAR",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3, name: "Wireless Headphones", category: "Electronics",
    price: 2499, oldPrice: 2999, badge: "SAVE 17%",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4, name: "Minimal Table Lamp", category: "Home",
    price: 1299, oldPrice: 1599, badge: "NEW",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5, name: "Premium Wrist Watch", category: "Fashion",
    price: 2199, oldPrice: 2699, badge: "TOP PICK",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6, name: "Modern Travel Backpack", category: "Fashion",
    price: 1599, oldPrice: 1899, badge: "",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7, name: "Wireless Earbuds", category: "Electronics",
    price: 1799, oldPrice: 2199, badge: "TRENDING",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8, name: "Ceramic Home Vase", category: "Home",
    price: 699, oldPrice: 899, badge: "",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80"
  }
];

const $ = (selector) => document.querySelector(selector);

const grid = $("#productGrid");
const searchInput = $("#searchInput");
const filters = $("#filters");
const sortSelect = $("#sortSelect");
const emptyState = $("#emptyState");

const cartDrawer = $("#cartDrawer");
const overlay = $("#overlay");
const cartItems = $("#cartItems");
const checkoutDialog = $("#checkoutDialog");
const toast = $("#toast");

let activeCategory = "all";
let searchTerm = "";
let showWishlistOnly = false;
let toastTimer;

function loadArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

let cart = loadArray("nova-cart")
  .filter(item => products.some(p => p.id === item.id))
  .map(item => ({
    id: item.id,
    qty: Math.max(1, Math.floor(Number(item.qty) || 1))
  }));

let wishlist = loadArray("nova-wishlist")
  .filter(id => products.some(p => p.id === id));

function saveState() {
  try {
    localStorage.setItem("nova-cart", JSON.stringify(cart));
    localStorage.setItem("nova-wishlist", JSON.stringify(wishlist));
  } catch {
    showToast("Storage unavailable. Changes may not persist.");
  }
}

function money(value) {
  return "₹" + value.toLocaleString("en-IN");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function getFilteredProducts() {
  let result = products.filter(product => {
    const matchesCategory =
      activeCategory === "all" ||
      product.category === activeCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWishlist =
      !showWishlistOnly || wishlist.includes(product.id);

    return matchesCategory && matchesSearch && matchesWishlist;
  });

  switch (sortSelect.value) {
    case "low":
      result.sort((a, b) => a.price - b.price);
      break;
    case "high":
      result.sort((a, b) => b.price - a.price);
      break;
    case "name":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return result;
}

function renderProducts() {
  const list = getFilteredProducts();

  grid.innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-image">
        <img
          src="${product.image}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://placehold.co/500x550/f2f3ed/315b43?text=Nova+Store'"
        >
        ${product.badge
          ? `<span class="product-badge">${escapeHTML(product.badge)}</span>`
          : ""}
        <button
          class="wish-btn ${wishlist.includes(product.id) ? "selected" : ""}"
          data-wish="${product.id}"
          aria-label="${wishlist.includes(product.id) ? "Remove from" : "Add to"} wishlist"
          aria-pressed="${wishlist.includes(product.id)}"
        >${wishlist.includes(product.id) ? "♥" : "♡"}</button>
        <button class="add-btn" data-add="${product.id}">
          Add to bag +
        </button>
      </div>
      <div class="product-info">
        <p class="product-category">${escapeHTML(product.category)}</p>
        <h3>${escapeHTML(product.name)}</h3>
        <p class="product-price">
          ${money(product.price)}
          <span class="old-price">${money(product.oldPrice)}</span>
        </p>
      </div>
    </article>
  `).join("");

  emptyState.hidden = list.length !== 0;
  grid.hidden = list.length === 0;
  $("#resultsCount").textContent =
    `${list.length} product${list.length === 1 ? "" : "s"} found`;

  $("#wishCount").textContent = wishlist.length;
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  $("#cartCount").textContent = count;
  $("#drawerCount").textContent = `(${count})`;
}

function renderCart() {
  updateCartCount();

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <p style="font-size:35px">♧</p>
        <p>Your bag is waiting for something lovely.</p>
      </div>`;
  } else {
    cartItems.innerHTML = cart.map(item => {
      const product = products.find(p => p.id === item.id);

      return `
        <div class="cart-row">
          <img src="${product.image}" alt="${escapeHTML(product.name)}">
          <div>
            <h3>${escapeHTML(product.name)}</h3>
            <p>${money(product.price)}</p>
            <div class="qty">
              <button data-qty="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button data-qty="${product.id}" data-change="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="remove-btn" data-remove="${product.id}">Remove</button>
        </div>`;
    }).join("");
  }

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + product.price * item.qty;
  }, 0);

  $("#cartSubtotal").textContent = money(subtotal);
  $("#checkoutTotal").textContent = money(subtotal);
  $("#checkoutBtn").disabled = cart.length === 0;
  $("#checkoutBtn").style.opacity = cart.length === 0 ? ".5" : "1";
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }

  saveState();
  renderCart();

  const product = products.find(p => p.id === id);
  showToast(`${product.name} added to your bag.`);
}

function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(itemId => itemId !== id);
    showToast("Removed from wishlist.");
  } else {
    wishlist.push(id);
    showToast("Added to wishlist ♥");
  }

  saveState();
  renderProducts();
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#closeCart").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function applyCategory(category) {
  activeCategory = category;
  showWishlistOnly = false;

  document.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === category
    );
  });

  renderProducts();
}

grid.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const wishButton = event.target.closest("[data-wish]");

  if (addButton) {
    addToCart(Number(addButton.dataset.add));
  }

  if (wishButton) {
    toggleWishlist(Number(wishButton.dataset.wish));
  }
});

filters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (button) applyCategory(button.dataset.category);
});

document.querySelectorAll("[data-nav]").forEach(link => {
  link.addEventListener("click", () => {
    applyCategory(link.dataset.nav);
  });
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim();
  renderProducts();
});

$("#searchForm").addEventListener("submit", event => {
  event.preventDefault();
  searchTerm = searchInput.value.trim();
  renderProducts();
  $("#shop").scrollIntoView({ behavior: "smooth" });
});

sortSelect.addEventListener("change", renderProducts);

$("#resetBtn").addEventListener("click", () => {
  searchInput.value = "";
  searchTerm = "";
  sortSelect.value = "featured";
  showWishlistOnly = false;
  applyCategory("all");
});

$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#continueShopping").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

$("#wishlistBtn").addEventListener("click", () => {
  showWishlistOnly = true;
  activeCategory = "all";
  searchTerm = "";
  searchInput.value = "";

  document.querySelectorAll(".filter").forEach(button => {
    button.classList.toggle(button.dataset.category === "all" ? "active" : "active", false);
  });

  renderProducts();
  $("#shop").scrollIntoView({ behavior: "smooth" });

  if (wishlist.length === 0) {
    showToast("Your wishlist is empty. Tap ♡ on a product to save it.");
  }
});

cartItems.addEventListener("click", event => {
  const qtyButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");

  if (qtyButton) {
    const id = Number(qtyButton.dataset.qty);
    const change = Number(qtyButton.dataset.change);
    const item = cart.find(entry => entry.id === id);

    if (item) {
      item.qty += change;
      if (item.qty <= 0) {
        cart = cart.filter(entry => entry.id !== id);
      }
    }

    saveState();
    renderCart();
  }

  if (removeButton) {
    const id = Number(removeButton.dataset.remove);
    cart = cart.filter(item => item.id !== id);
    saveState();
    renderCart();
    showToast("Item removed from your bag.");
  }
});

$("#checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return;

  closeCart();
  $("#checkoutTotal").textContent = money(
    cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.id);
      return sum + product.price * item.qty;
    }, 0)
  );

  checkoutDialog.showModal();
});

$("#closeCheckout").addEventListener("click", () => {
  checkoutDialog.close();
});

$("#checkoutForm").addEventListener("submit", event => {
  event.preventDefault();

  if (!cart.length) {
    checkoutDialog.close();
    showToast("Your bag is empty.");
    return;
  }

  const formData = new FormData(event.currentTarget);
  const customerName = formData.get("name").trim();

  // Frontend demo only: no order is sent to a server.
  cart = [];
  saveState();
  renderCart();
  event.currentTarget.reset();
  checkoutDialog.close();

  showToast(`Thanks, ${customerName}! Demo order completed.`);
});

$("#newsletterForm").addEventListener("submit", event => {
  event.preventDefault();

  const email = $("#newsletterEmail").value.trim();

  if (!email) return;

  $("#newsletterMessage").textContent =
    "Thanks for your interest! Newsletter subscription needs a backend.";
  event.currentTarget.reset();
});

$("#topLink").addEventListener("click", event => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
  }
});

// Initial page setup
saveState();
renderProducts();
renderCart();
