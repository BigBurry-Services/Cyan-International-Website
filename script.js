document.addEventListener("DOMContentLoaded", () => {
  // Navbar Scroll Effect
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Parallax Blobs
  document.addEventListener("mousemove", (e) => {
    const x = (window.innerWidth - e.pageX * 2) / 100;
    const y = (window.innerHeight - e.pageY * 2) / 100;
    const blob1 = document.querySelector(".blob-1");
    const blob2 = document.querySelector(".blob-2");
    if (blob1) blob1.style.transform = `translateX(${x}px) translateY(${y}px)`;
    if (blob2)
      blob2.style.transform = `translateX(${-x}px) translateY(${-y}px)`;
  });

  // Reveal Animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal").forEach((el) => {
    revealObserver.observe(el);
  });

  // Smooth Scroll for Navigation
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });

  // Mobile Menu Toggle (Simplified)
  const mobileMenu = document.getElementById("mobile-menu");
  const navLinks = document.getElementById("nav-links");

  if (mobileMenu) {
    mobileMenu.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      mobileMenu.classList.toggle("open");
    });
  }

  // Dynamic Product Rendering
  const productGrid = document.querySelector(".product-grid");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const productsRaw = localStorage.getItem("ammachies_products");
  const products = productsRaw ? JSON.parse(productsRaw) : [];

  function renderProducts(filter = "all") {
    if (!productGrid) return;

    productGrid.innerHTML = "";

    const filteredProducts =
      filter === "all"
        ? products
        : products.filter((p) => p.category === filter);

    if (filteredProducts.length === 0) {
      productGrid.innerHTML = `
        <div class="empty-state">
          <h3>No ${filter === "all" ? "" : filter} treasures found!</h3>
          <p>We are currently updating this category. Please check back shortly.</p>
        </div>
      `;
    } else {
      filteredProducts.forEach((p) => {
        const card = document.createElement("div");
        card.className = "product-card reveal";
        card.innerHTML = `
                  <div class="product-img">
                      <img src="${
                        p.img ||
                        "https://images.unsplash.com/photo-1590541576391-defc4331032b?q=80&w=1974"
                      }" alt="${p.name}">
                      <span class="category">${
                        p.category || "Traditional"
                      }</span>
                  </div>
                  <div class="product-info">
                      <h3>${p.name}</h3>
                      <p>${
                        p.desc ||
                        "Authentic Kerala delicacy crafted with tradition."
                      }</p>
                      <span class="weight">${p.weight || "Standard Size"}</span>
                  </div>
              `;
        productGrid.appendChild(card);
        // Re-observe for reveal animation
        setTimeout(() => {
          revealObserver.observe(card);
          card.classList.add("active");
        }, 100);
      });
    }
  }

  // Filter Event Listeners
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Toggle active class
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.getAttribute("data-category");
      renderProducts(category);
    });
  });

  // Initial render
  if (productGrid) {
    renderProducts("all");
  }

  // Particle System
  const canvas = document.getElementById("particles-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particlesArray;

  // Get mouse position
  let mouse = {
    x: null,
    y: null,
    radius: (canvas.height / 80) * (canvas.width / 80),
  };

  window.addEventListener("mousemove", function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
  });

  // Create Particle Class
  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
    }

    // Method to draw individual particle
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = "#1a6fd1"; // Primary color
      ctx.globalAlpha = 0.2; // Semi-transparent
      ctx.fill();
    }

    // Check particle position, check mouse position, move the particle, draw the particle
    update() {
      // Check if particle is still within canvas
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
      }

      // Check collision detection - mouse position / particle position
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius + this.size) {
        if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
          this.x += 10;
        }
        if (mouse.x > this.x && this.x > this.size * 10) {
          this.x -= 10;
        }
        if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
          this.y += 10;
        }
        if (mouse.y > this.y && this.y > this.size * 10) {
          this.y -= 10;
        }
      }

      // Move particle
      this.x += this.directionX;
      this.y += this.directionY;

      // Draw particle
      this.draw();
    }
  }

  // Create particle array
  function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
      let size = Math.random() * 5 + 1;
      let x = Math.random() * (innerWidth - size * 2 - size * 2) + size * 2;
      let y = Math.random() * (innerHeight - size * 2 - size * 2) + size * 2;
      let directionX = Math.random() * 5 - 2.5;
      let directionY = Math.random() * 5 - 2.5;
      let color = "#1a6fd1";

      particlesArray.push(
        new Particle(x, y, directionX, directionY, size, color)
      );
    }
  }

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }
  }

  init();
  animate(); // Start animation loop

  // Resize event
  window.addEventListener("resize", function () {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    mouse.radius = (canvas.height / 80) * (canvas.height / 80);
    init();
  });
  // Catch the Vada Game
  const vada = document.getElementById("vada-game");
  if (vada) {
    vada.addEventListener("mouseover", () => {
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;
      const newX = Math.random() * maxX;
      const newY = Math.random() * maxY;

      vada.style.left = newX + "px";
      vada.style.top = newY + "px";

      // Reset transform because initial CSS centers it
      vada.style.transform = "none";
    });
  }

  // Hero Parallax Effect (Removed in favor of CSS ambient animation)
  /* 
  const heroSection = document.querySelector(".hero-section");
  const heroBg = document.querySelector(".hero-bg-parallax");

  if (heroSection && heroBg) {
    heroSection.addEventListener("mousemove", (e) => {
       // Logic removed to allow CSS animation to take precedence
    });
  }
  */

  // Mobile Menu Toggle
  const mobileBtn = document.querySelector(".mobile-menu-btn");
  const navUl = document.querySelector("nav ul");

  if (mobileBtn && navUl) {
    mobileBtn.addEventListener("click", () => {
      navUl.classList.toggle("active");
      // Optional: Toggle icon between bars and times
      const icon = mobileBtn.querySelector("i");
      if (icon) {
        if (navUl.classList.contains("active")) {
          icon.classList.remove("fa-bars");
          icon.classList.add("fa-times");
          icon.style.color = "var(--text-dark)"; // Ensure visibility on white menu
        } else {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
          // Reset color based on scroll state handled by CSS usually,
          // or let inline style persist. Ideally rely on CSS classes.
          icon.style.color = "";
        }
      }
    });
  }
});
