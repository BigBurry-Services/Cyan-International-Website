document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  initHeroProductAnimation();
  initScrollAnimations();
  initNavbarScroll();
  initMobileMenu();
  initMobileDropdown();
  initInquiryForm();
  initActiveNavHighlight();
});

function initMobileMenu() {
  const toggleBtn = document.querySelector(".mobile-toggle");
  const closeBtn = document.querySelector(".close-sidebar");
  const sidebar = document.querySelector(".mobile-sidebar");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.add("active");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      sidebar.classList.remove("active");
    });
  }
}

function initMobileDropdown() {
  const browseBtn = document.getElementById("browse-cats-btn");
  const dropdown = document.getElementById("cat-dropdown-header");

  if (browseBtn && dropdown) {
    browseBtn.addEventListener("click", (e) => {
      // In mobile, we want to toggle. In desktop, hover handles it, but click is fine too.
      // Prevent default if it was a link, but it's a button.
      e.stopPropagation(); // Prevent closing immediately if we add window listener
      dropdown.classList.toggle("show");
    });

    // Close when clicking outside
    window.addEventListener("click", (e) => {
      if (!browseBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove("show");
      }
    });
  }
}
window.onerror = function (msg, url, line) {
  alert("JS Error: " + msg + "\nLine: " + line);
};

function initNavbarScroll() {
  const header = document.querySelector("header");
  const updateNavbar = () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
      header.classList.remove("transparent-nav");
    } else {
      header.classList.remove("scrolled");
      header.classList.add("transparent-nav");
    }
  };

  // Initial check
  updateNavbar();
  window.addEventListener("scroll", updateNavbar);
}

async function fetchData() {
  console.log("Fetching data...");
  // Use global siteData if available (for local file protocol compatibility)
  if (
    typeof window.siteData !== "undefined" ||
    typeof siteData !== "undefined"
  ) {
    const data = window.siteData || siteData;
    console.log("Data found:", data);
    try {
      renderCategories(data.categories);
      renderProducts(data.products);
      renderNavbarDropdowns(data.categories, data.products);
      renderAllCategoriesPage(data.categories);
      renderPageContent(); // Add this
      renderTestimonials(); // Add this
    } catch (e) {
      console.error("Render error:", e);
      alert("Render error: " + e.message);
    }
    return;
  }

  // Fallback to fetch (e.g., if we run on a server that updates data.json)
  try {
    const response = await fetch("data.json");
    const data = await response.json();

    renderCategories(data.categories);
    renderProducts(data.products);
    renderNavbarDropdowns(data.categories, data.products);
    renderAllCategoriesPage(data.categories);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function renderAllCategoriesPage(categories) {
  const container = document.getElementById("all-categories-grid");
  if (!container) return;

  container.innerHTML = categories
    .map(
      (cat) => `
    <a href="category-detail.html?id=${cat.id}" class="category-grid-item">
        <div class="category-image-wrap">
            <img src="${cat.image}" alt="${cat.name}" loading="lazy">
        </div>
        <h3>${cat.name}</h3>
        <p>${cat.desc ? cat.desc.substring(0, 60) + "..." : ""}</p>
    </a>
  `,
    )
    .join("");
}

function renderCategories(categories) {
  const container = document.getElementById("category-grid-display");
  if (!container) return;

  const batchSize = 6; // Show 6 items
  let currentIndex = 0;

  function updateDisplay() {
    // Calculate the batch of 4 categories
    const batch = [];
    for (let i = 0; i < batchSize; i++) {
      batch.push(categories[(currentIndex + i) % categories.length]);
    }

    // Render HTML
    container.innerHTML = batch
      .map(
        (cat) => `
        <a href="category-detail.html?id=${cat.id}" class="category-grid-item animate-fade">
            <div class="category-image-wrap">
                <img src="${cat.image}" alt="${cat.name}" loading="lazy">
            </div>
            <h3>${cat.name}</h3>
        </a>
    `,
      )
      .join("");

    // Advance index
    currentIndex = (currentIndex + batchSize) % categories.length;
  }

  // Initial call
  updateDisplay();

  // Rotate every 2 seconds
  setInterval(updateDisplay, 2000);
}

function renderProducts(products) {
  const grid = document.getElementById("product-grid");
  if (!grid) {
    console.warn("Product grid not found");
    return;
  }

  console.log("Rendering products:", products.length);

  // Determine if we are on the home page or products page
  const isHomePage =
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname.endsWith("/");
  const isProductsPage = window.location.pathname.includes("products.html"); // Changed to includes for safer match

  console.log("Page check:", {
    isHomePage,
    isProductsPage,
    path: window.location.pathname,
  });

  let productsToDisplay = products;

  if (!isProductsPage) {
    // On Home page (or any other page that isn't products.html), filter for featured items
    productsToDisplay = products.filter((p) => p.featured === true);
    // If no featured items found (fallback), maybe show first 4
    if (productsToDisplay.length === 0) {
      productsToDisplay = products.slice(0, 4);
    }
  }

  grid.innerHTML = productsToDisplay
    .map(
      (prod) => `
        <a href="product-detail.html?id=${prod.id}" class="product-card">
            <img src="${prod.image}" alt="${prod.name}" loading="lazy">
            <div class="product-card-info">
                <h3>${prod.name.toUpperCase()}</h3>
                ${prod.desc ? `<p class="product-desc-preview">${prod.desc}</p>` : `<p>Premium quality ${prod.name.toLowerCase()}.</p>`}
            </div>
        </a>
    `,
    )
    .join("");
}

function renderNavbarDropdowns(categories, products) {
  const catDropdown = document.getElementById("cat-dropdown-header");
  // const prodDropdown = document.getElementById("prod-dropdown"); // Removed in new design

  if (catDropdown) {
    catDropdown.innerHTML = categories
      .map(
        (cat) =>
          `<li><a href="category-detail.html?id=${cat.id}">${toTitleCase(
            cat.name,
          )}</a></li>`,
      )
      .join("");
  }
}

function renderMobileCategories(categories) {
  const container = document.getElementById("mobile-category-list");
  if (!container) return;

  container.innerHTML = categories
    .map(
      (cat) =>
        `<li><a href="category-detail.html?id=${cat.id}">${toTitleCase(
          cat.name,
        )}</a></li>`,
    )
    .join("");
}

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function initHeroProductAnimation() {
  const imgEl = document.getElementById("hero-product-img");
  if (!imgEl) return;

  const images = ["hero_images/1.png", "hero_images/2.png"];

  let currentIdx = 0;

  setInterval(() => {
    // Add switching class for fade out/slide effect
    imgEl.classList.add("switching");

    setTimeout(() => {
      currentIdx = (currentIdx + 1) % images.length;
      imgEl.src = images[currentIdx];

      // Allow browser to register new src before removing class
      imgEl.onload = () => {
        imgEl.classList.remove("switching");
      };
      // Fallback if load is too fast or cached
      setTimeout(() => imgEl.classList.remove("switching"), 50);
    }, 500); // Wait for half transition (fade out)
  }, 4000); // Cycle every 4 seconds
}

// Locations spotlight removed in favor of grid layout

function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll(
    ".animate-on-scroll, .smooth-text-reveal, .slide-in-left, .slide-in-right",
  );
  animatedElements.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  initSearch();
});

function initSearch() {
  const searchInput = document.getElementById("header-search-input");
  const searchDropdown = document.getElementById("search-results-dropdown");

  let allProducts = [];

  // Try to populate from existing data if possible, or fetch
  async function loadDataForSearch() {
    if (typeof siteData !== "undefined") {
      allProducts = siteData.products;
      return;
    }

    try {
      const response = await fetch("data.json");
      const data = await response.json();
      allProducts = data.products;
    } catch (e) {
      console.error("Search data load failed", e);
    }
  }

  loadDataForSearch();

  if (searchInput && searchDropdown) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();

      if (query.length > 0) {
        const filtered = allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            (p.desc && p.desc.toLowerCase().includes(query)),
        );
        displaySearchResults(filtered, searchDropdown);
        searchDropdown.classList.add("active");
      } else {
        searchDropdown.classList.remove("active");
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !searchInput.contains(e.target) &&
        !searchDropdown.contains(e.target)
      ) {
        searchDropdown.classList.remove("active");
      }
    });

    // Show dropdown again if input has value and is focused
    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim().length > 0) {
        searchDropdown.classList.add("active");
      }
    });
  }
}

function displaySearchResults(products, container) {
  if (products.length === 0) {
    container.innerHTML =
      '<div class="no-results">No products found for your search.</div>';
    return;
  }

  container.innerHTML = products
    .map(
      (prod) => `
    <a href="product-detail.html?id=${prod.id}" class="search-result-item">
        <img src="${prod.image}" alt="${prod.name}">
        <div class="search-result-info">
            <h4>${prod.name.toUpperCase()}</h4>
            <p>${prod.desc ? prod.desc : "Premium quality Kerala food product."}</p>
        </div>
    </a>
  `,
    )
    .join("");
}

function initInquiryForm() {
  const form = document.querySelector(".inquiry-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const contactInput = form.querySelector('input[type="text"]');
    const messageInput = form.querySelector("textarea");

    const contact = contactInput ? contactInput.value.trim() : "";
    const message = messageInput ? messageInput.value.trim() : "";

    const recipient = "cyan.international@yahoo.com";
    const subject = encodeURIComponent("Website Inquiry");
    const body = encodeURIComponent(
      `Contact Info: ${contact}\n\nMessage:\n${message}`,
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  });
}

function renderTestimonials() {
  if (typeof siteData === "undefined" || !siteData.testimonials) return;
  const container = document.getElementById("testimonials-container");
  if (!container) return;

  container.innerHTML = siteData.testimonials
    .map(
      (t) => `
        <div class="testimonial-card">
            <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
            <p class="testimonial-text">"${t.text}"</p>
            <div class="testimonial-author">
                <h4>${t.name}</h4>
                <span>${t.role}</span>
            </div>
        </div>
    `,
    )
    .join("");
}

function renderPageContent() {
  if (typeof siteData === "undefined" || !siteData.pageContent) return;
  const pc = siteData.pageContent;

  // Home
  if (pc.home) {
    setText("home-heroTitle", pc.home.heroTitle);
    setText("home-heroSubtitle", pc.home.heroSubtitle);
    setText("home-welcomeTitle", pc.home.welcomeTitle);
    setText("home-welcomeText", pc.home.welcomeText);
  }

  // About
  if (pc.about) {
    setText("about-title", pc.about.title);
    setText("about-story", pc.about.story);
    setText("about-mission", pc.about.mission);
  }

  // Contact
  if (pc.contact) {
    setText("contact-email", pc.contact.email);
    setText("contact-phone", pc.contact.phone);
    setText("contact-address", pc.contact.address);
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.textContent = text;
}

function initActiveNavHighlight() {
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash;
  const navLinks = document.querySelectorAll(".desktop-menu.new-nav li a");

  navLinks.forEach((link) => {
    // Reset
    link.classList.remove("active");

    const href = link.getAttribute("href");
    let isActive = false;

    // Logic specific to this site

    // 1. Home
    if (href === "index.html" || href === "./" || href === "/") {
      if (
        (currentPath.endsWith("index.html") || currentPath.endsWith("/")) &&
        !currentHash
      ) {
        isActive = true;
      }
    }

    // 2. Products (including detail pages)
    if (href === "products.html") {
      if (
        currentPath.includes("products.html") ||
        currentPath.includes("product-detail.html") ||
        currentPath.includes("category-detail.html")
      ) {
        isActive = true;
      }
    }

    // 3. About
    if (href === "about.html" && currentPath.includes("about.html")) {
      isActive = true;
    }

    // 4. Contact
    if (href === "contact.html" && currentPath.includes("contact.html")) {
      isActive = true;
    }

    // 5. Categories
    if (href === "categories.html") {
      if (currentPath.includes("categories.html")) {
        isActive = true;
      }
    }

    if (isActive) {
      link.classList.add("active");
    }
  });
}
