document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  initHeroSlider();
});

async function fetchData() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();

    renderCategories(data.categories);
    renderProducts(data.products);
    renderNavbarDropdowns(data.categories, data.products);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function renderCategories(categories) {
  const grid = document.getElementById("category-grid");
  if (!grid) return;

  grid.innerHTML = categories
    .map(
      (cat, index) => `
        <a href="category-detail.html?id=${cat.id}" class="category-item-link">
            <div class="category-item">
                <div class="category-image">
                    <img src="${cat.image}" alt="${cat.name}" loading="lazy">
                </div>
                <h3>${index + 1}. ${cat.name}</h3>
                <ul class="product-list-small">
                    ${cat.items
                      .slice(0, 4)
                      .map((item) => `<li>${item}</li>`)
                      .join("")}
                </ul>
            </div>
        </a>
    `
    )
    .join("");
}

function renderProducts(products) {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  grid.innerHTML = products
    .map(
      (prod) => `
        <a href="product-detail.html?id=${prod.id}" class="product-card">
            <img src="${prod.image}" alt="${prod.name}" loading="lazy">
            <div class="product-card-info">
                <h3>${prod.name.toUpperCase()}</h3>
                <p>Premium quality ${prod.name.toLowerCase()}.</p>
            </div>
        </a>
    `
    )
    .join("");
}

function renderNavbarDropdowns(categories, products) {
  const catDropdown = document.getElementById("cat-dropdown");
  const prodDropdown = document.getElementById("prod-dropdown");

  if (catDropdown) {
    catDropdown.innerHTML = categories
      .map(
        (cat) =>
          `<li><a href="category-detail.html?id=${cat.id}">${toTitleCase(
            cat.name
          )}</a></li>`
      )
      .join("");
  }

  if (prodDropdown) {
    // Show first 30 products to avoid huge list, given there are 200+
    // Or render all? The user asked for "all available products".
    // 200 items in a 3-col grid is a lot (66 rows), but feasible for a mega menu.
    // Let's render all but keep an eye on performance/usability.
    // Maybe sort them alphabetically
    const sortedProducts = products.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    prodDropdown.innerHTML = sortedProducts
      .map(
        (prod) =>
          `<li><a href="product-detail.html?id=${prod.id}">${toTitleCase(
            prod.name
          )}</a></li>`
      )
      .join("");

    // Use CSS class for specific dropdown if it gets too long
    if (products.length > 30) {
      prodDropdown.classList.add("mega-menu");
    }
  }
}

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function initHeroSlider() {
  const hero = document.querySelector(".hero");
  const heroText = document.querySelector("h1.reveal-text");
  if (!hero || !heroText) return;

  const slides = [
    { text: "AMMACHIES", bg: "banner.jpg" },
    { text: "TASTE OF TRADITION", bg: "banner1.jpg" },
    { text: "FLAVORS OF KERALA", bg: "banner2.png" },
  ];
  let currentIdx = 0;

  function rotateHero() {
    // Start text fade and background zoom
    heroText.classList.add("fade-out");
    hero.style.filter = "brightness(0.8)";

    setTimeout(() => {
      currentIdx = (currentIdx + 1) % slides.length;

      // Update content
      heroText.textContent = slides[currentIdx].text;

      // Update background only on Desktop
      if (window.innerWidth > 768) {
        hero.style.background = `linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 40%), url('${slides[currentIdx].bg}')`;
        hero.style.backgroundSize = "cover";
        hero.style.backgroundPosition = "center";
        hero.style.backgroundAttachment = "fixed";
      } else {
        hero.style.background = "#001a40"; // Keep solid on mobile
      }

      // Finish animations
      setTimeout(() => {
        heroText.classList.remove("fade-out");
        hero.style.filter = "brightness(1)";
      }, 50);
    }, 600);
  }

  setInterval(rotateHero, 4000);
}
