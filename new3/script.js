// Mobile Menu Toggle
const mobileBtn = document.querySelector(".mobile-menu-btn");
const mobileNav = document.createElement("div");
mobileNav.className = "mobile-nav-overlay";
mobileNav.innerHTML = `
    <div class="mobile-nav-content">
        <button class="close-nav"><i data-lucide="x"></i></button>
        <div class="mobile-links">
            <a href="#" class="active">Home</a>
            <a href="#">Shop</a>
            <a href="#">Fruits & Veg</a>
            <a href="#">Beverages</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
        </div>
    </div>
`;
document.body.appendChild(mobileNav);

const style = document.createElement("style");
style.textContent = `
    .mobile-nav-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
        display: none; justify-content: flex-start;
    }
    .mobile-nav-overlay.active { display: flex; }
    .mobile-nav-content {
        background: #fff; width: 80%; max-width: 300px; height: 100%;
        padding: 20px; box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        transform: translateX(-100%); transition: 0.3s;
    }
    .mobile-nav-overlay.active .mobile-nav-content { transform: translateX(0); }
    .mobile-links { display: flex; flex-direction: column; gap: 20px; margin-top: 40px; }
    .mobile-links a { font-size: 18px; font-weight: 600; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    .close-nav { position: absolute; top: 20px; right: 20px; }
`;
document.head.appendChild(style);

const closeBtn = mobileNav.querySelector(".close-nav");

function toggleMenu() {
  mobileNav.classList.toggle("active");
  if (window.lucide) lucide.createIcons();
}

if (mobileBtn) mobileBtn.addEventListener("click", toggleMenu);
if (closeBtn) closeBtn.addEventListener("click", toggleMenu);

// Sticky Header
const header = document.querySelector(".main-header");
window.addEventListener("scroll", () => {
  if (!header) return;
  if (window.scrollY > 100) {
    header.style.position = "sticky";
    header.style.top = "0";
    header.style.zIndex = "999";
    header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  } else {
    header.style.position = "relative";
    header.style.boxShadow = "none";
  }
});

// Product Manager
const API_URL = "http://localhost:8000/api/products";
const ITEMS_PER_PAGE = 24;
let allProducts = [];
let currentPage = 1;

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
});

async function fetchProducts() {
  const container = document.getElementById("product-list-container");
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch");
    allProducts = await res.json();

    if (allProducts.length === 0) {
      container.innerHTML =
        '<div style="grid-column:1/-1; text-align:center;">No products found.</div>';
      return;
    }

    renderPage(1);
  } catch (err) {
    console.error(err);
    container.innerHTML =
      '<div style="grid-column:1/-1; text-align:center; color:red;">Failed to load products. Ensure server is running.</div>';
  }
}

function renderPage(page) {
  currentPage = page;
  const container = document.getElementById("product-list-container");
  container.innerHTML = "";

  // Calculate slice
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = allProducts.slice(start, end);

  // Generate HTML
  pageItems.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
            <div class="prod-img">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
                <div class="prod-actions">
                    <button><i data-lucide="eye"></i></button>
                </div>
            </div>
            <div class="prod-info">
                <h4>${p.name}</h4>
                <div class="price-row"></div>
            </div>
        `;
    container.appendChild(card);
  });

  // Process Images for Blur/Shimmer
  processImages(container);

  // Update Icons
  if (window.lucide) lucide.createIcons();

  // Update Pagination Controls
  updatePagination(allProducts.length, page);

  // Scroll top
  const section = document.getElementById("products");
  if (section)
    window.scrollTo({ top: section.offsetTop - 100, behavior: "smooth" });
}

function processImages(container) {
  const images = container.querySelectorAll(".prod-img img");

  images.forEach((img) => {
    // Init state
    img.style.opacity = "0";
    img.style.filter = "blur(10px)";
    img.style.transition = "opacity 0.5s ease, filter 0.5s ease";

    const onLoad = () => {
      img.style.opacity = "1";
      img.style.filter = "blur(0)";
      const parent = img.closest(".prod-img");
      if (parent) {
        parent.style.animation = "none";
        parent.style.background = "none";
      }
    };

    if (img.complete) {
      onLoad();
    } else {
      img.addEventListener("load", onLoad);
      img.addEventListener("error", () => {
        // Remove shimmer on error too
        const parent = img.closest(".prod-img");
        if (parent) parent.style.animation = "none";
      });
    }
  });
}

function updatePagination(totalItems, current) {
  const container = document.querySelector(".pagination-controls");
  if (!container) return;
  container.innerHTML = "";

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalPages <= 1) return;

  const createBtn = (text, page, isActive = false, isDisabled = false) => {
    const btn = document.createElement("button");
    btn.innerHTML = text;
    btn.className = `page-btn ${isActive ? "active" : ""}`;
    if (isDisabled) btn.disabled = true;
    btn.onclick = () => {
      if (!isDisabled && !isActive) renderPage(page);
    };
    return btn;
  };

  // Prev
  container.appendChild(createBtn("<", current - 1, false, current === 1));

  // Numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= current - 2 && i <= current + 2)) {
      container.appendChild(createBtn(i, i, i === current));
    } else if (
      (i === current - 3 && current > 4) ||
      (i === current + 3 && current < totalPages - 3)
    ) {
      const span = document.createElement("span");
      span.innerText = "...";
      span.style.alignSelf = "center";
      container.appendChild(span);
    }
  }

  // Next
  container.appendChild(
    createBtn(">", current + 1, false, current === totalPages)
  );
}
