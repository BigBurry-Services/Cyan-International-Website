// Basic password check
function checkLogin() {
  const pass = document.getElementById("admin-password").value;
  if (pass === "admin123") {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("admin-dashboard").style.display = "block";
    initDashboard();
  } else {
    document.getElementById("login-error").textContent = "Invalid Password!";
  }
}

function logout() {
  location.reload();
}

let products = [];
let categories = [];
let pageContent = {};

function initDashboard() {
  if (typeof siteData !== "undefined") {
    products = siteData.products || [];
    categories = siteData.categories || [];
    pageContent = siteData.pageContent || {};

    renderTable(products);
    populateCategorySelect();

    // Load initial page content into forms
    loadPageContent();

    // Load Testimonials
    renderTestimonialsTable(siteData.testimonials || []);
  } else {
    alert("Error: Data not loaded properly.");
  }
}

// Navigation Logic
function showSection(sectionId) {
  // Nav active state
  document
    .querySelectorAll(".nav-links li")
    .forEach((li) => li.classList.remove("active"));
  event.currentTarget.classList.add("active");

  // Section visibility
  document
    .querySelectorAll(".content-section")
    .forEach((sec) => (sec.style.display = "none"));

  // Show target section
  const target = document.getElementById("section-" + sectionId);
  if (target) target.style.display = "block";
}

function loadPageContent() {
  if (!pageContent) return;

  // Home
  if (pageContent.home) {
    setVal("home-heroTitle", pageContent.home.heroTitle);
    setVal("home-heroSubtitle", pageContent.home.heroSubtitle);
    setVal("home-welcomeTitle", pageContent.home.welcomeTitle);
    setVal("home-welcomeText", pageContent.home.welcomeText);
  }

  // About
  if (pageContent.about) {
    setVal("about-title", pageContent.about.title);
    setVal("about-story", pageContent.about.story);
    setVal("about-mission", pageContent.about.mission);
  }

  // Contact
  if (pageContent.contact) {
    setVal("contact-phone", pageContent.contact.phone);
    setVal("contact-email", pageContent.contact.email);
    setVal("contact-address", pageContent.contact.address);
  }
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || "";
}

function savePageContent(page) {
  if (!pageContent[page]) pageContent[page] = {};

  if (page === "home") {
    pageContent.home.heroTitle =
      document.getElementById("home-heroTitle").value;
    pageContent.home.heroSubtitle =
      document.getElementById("home-heroSubtitle").value;
    pageContent.home.welcomeTitle =
      document.getElementById("home-welcomeTitle").value;
    pageContent.home.welcomeText =
      document.getElementById("home-welcomeText").value;
  } else if (page === "about") {
    pageContent.about.title = document.getElementById("about-title").value;
    pageContent.about.story = document.getElementById("about-story").value;
    pageContent.about.mission = document.getElementById("about-mission").value;
  } else if (page === "contact") {
    pageContent.contact.phone = document.getElementById("contact-phone").value;
    pageContent.contact.email = document.getElementById("contact-email").value;
    pageContent.contact.address =
      document.getElementById("contact-address").value;
  }

  // Update global
  siteData.pageContent = pageContent;
  alert(
    page.charAt(0).toUpperCase() +
      page.slice(1) +
      " content updated! Remember to download.",
  );
}

function renderTable(data) {
  const tbody = document.querySelector("#products-table tbody");
  tbody.innerHTML = "";

  data.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td><img src="${p.image}" alt="${p.name}" onerror="this.src='placeholder.jpg'"></td>
            <td>${p.id || "No ID"}</td>
            <td>${p.name}</td>
            <td>${truncate(p.desc, 50)}</td>
            <td>${p.featured ? '<i class="fas fa-check-circle" style="color:var(--success)"></i>' : "-"}</td>
            <td>
                <button onclick="editProduct('${p.id}')" class="btn-action btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteProduct('${p.id}')" class="btn-action btn-delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

function truncate(str, n) {
  return str && str.length > n ? str.substr(0, n - 1) + "..." : str;
}

function filterProducts() {
  const term = document.getElementById("product-search").value.toLowerCase();
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      (p.id && p.id.toLowerCase().includes(term)),
  );
  renderTable(filtered);
}

function openModal(mode, productId = null) {
  const modal = document.getElementById("product-modal");
  modal.style.display = "flex";

  if (mode === "add") {
    document.getElementById("modal-title").textContent = "Add New Product";
    document.getElementById("product-form").reset();
    document.getElementById("edit-product-id").value = "";
  } else {
    document.getElementById("modal-title").textContent = "Edit Product";
    const product = products.find((p) => p.id === productId);
    if (product) {
      document.getElementById("edit-product-id").value = product.id;
      document.getElementById("p-name").value = product.name;
      document.getElementById("p-image").value = product.image;
      document.getElementById("p-desc").value = product.desc || "";
      document.getElementById("p-featured").checked = !!product.featured;
      document.getElementById("p-category").value =
        getProductCategory(product.id) || "";
    }
  }
}

// Helper to find category of a product
function getProductCategory(prodId) {
  for (const cat of categories) {
    if (cat.products && cat.products.some((p) => p.id === prodId)) {
      return cat.id;
    }
  }
  return "";
}

function closeModal() {
  document.getElementById("product-modal").style.display = "none";
}

function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("edit-product-id").value;
  const name = document.getElementById("p-name").value;
  const image = document.getElementById("p-image").value;
  const desc = document.getElementById("p-desc").value;
  const featured = document.getElementById("p-featured").checked;
  const catId = document.getElementById("p-category").value;

  let product;

  if (id) {
    // Edit existing in master list
    product = products.find((p) => p.id === id);
    if (product) {
      product.name = name;
      product.image = image;
      product.desc = desc;
      product.featured = featured;
    }
  } else {
    // Add new
    const newId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newProduct = {
      id: newId,
      name: name,
      image: image,
      desc: desc,
      featured: featured,
    };
    products.push(newProduct);
    product = newProduct;
  }

  // Update in category structure as well
  if (catId) {
    // Remove from old category if editing? For simplicity, we just ensure it's in the selected one
    // Ideally we'd remove it from others, but that's complex without full relational mapping.
    // We will just add/update in target.
    const cat = categories.find((c) => c.id === catId);
    if (cat && cat.products) {
      const existingInCat = cat.products.find((p) => p.id === product.id);
      if (existingInCat) {
        Object.assign(existingInCat, product);
      } else {
        cat.products.push(product);
      }
    }
  }

  // Sync global
  siteData.products = products;

  closeModal();
  renderTable(products);
  alert("Product Saved! Remember to Download Data.");
}

// --- Testimonials Logic ---

function renderTestimonialsTable(data) {
  const tbody = document.querySelector("#testimonials-table tbody");
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align:center;">No testimonials found.</td></tr>';
    return;
  }

  data.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${t.name}</td>
            <td>${t.role}</td>
            <td>${truncate(t.text, 50)}</td>
            <td>
                <button onclick="editTestimonial('${t.id}')" class="btn-action btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteTestimonial('${t.id}')" class="btn-action btn-delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

function openTestimonialModal(mode, id = null) {
  let modal = document.getElementById("testimonial-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "testimonial-modal";
    modal.className = "modal";
    modal.class = "modal";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeTestimonialModal()">&times;</span>
            <h2 id="t-modal-title">Add Testimonial</h2>
            <form id="t-form" onsubmit="handleTestimonialSubmit(event)">
                <input type="hidden" id="t-id">
                <div class="form-group">
                    <label>Client Name</label>
                    <input type="text" id="t-name" required>
                </div>
                <div class="form-group">
                    <label>Role / Location</label>
                    <input type="text" id="t-role" required>
                </div>
                <div class="form-group">
                    <label>Feedback</label>
                    <textarea id="t-text" rows="4" required></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeTestimonialModal()" class="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-save">Save</button>
                </div>
            </form>
        </div>`;
    document.body.appendChild(modal);
  }

  modal.style.display = "flex";

  if (mode === "add") {
    document.getElementById("t-modal-title").textContent = "Add Testimonial";
    document.getElementById("t-form").reset();
    document.getElementById("t-id").value = "";
  } else {
    document.getElementById("t-modal-title").textContent = "Edit Testimonial";
    const t = (siteData.testimonials || []).find((x) => x.id === id);
    if (t) {
      document.getElementById("t-id").value = t.id;
      document.getElementById("t-name").value = t.name;
      document.getElementById("t-role").value = t.role;
      document.getElementById("t-text").value = t.text;
    }
  }
}

function closeTestimonialModal() {
  const modal = document.getElementById("testimonial-modal");
  if (modal) modal.style.display = "none";
}

function handleTestimonialSubmit(e) {
  e.preventDefault();
  const id = document.getElementById("t-id").value;
  const name = document.getElementById("t-name").value;
  const role = document.getElementById("t-role").value;
  const text = document.getElementById("t-text").value;

  let testimonials = siteData.testimonials || [];

  if (id) {
    const t = testimonials.find((x) => x.id === id);
    if (t) {
      t.name = name;
      t.role = role;
      t.text = text;
    }
  } else {
    const newId = "t" + Date.now();
    testimonials.push({ id: newId, name, role, text });
  }

  siteData.testimonials = testimonials;
  renderTestimonialsTable(testimonials);
  closeTestimonialModal();
  alert("Testimonial Saved!");
}

function editTestimonial(id) {
  openTestimonialModal("edit", id);
}

function deleteTestimonial(id) {
  if (confirm("Delete this testimonial?")) {
    siteData.testimonials = (siteData.testimonials || []).filter(
      (t) => t.id !== id,
    );
    renderTestimonialsTable(siteData.testimonials);
  }
}

function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    products = products.filter((p) => p.id !== id);
    siteData.products = products;

    // Remove from categories
    categories.forEach((cat) => {
      if (cat.products) {
        cat.products = cat.products.filter((p) => p.id !== id);
      }
    });

    renderTable(products);
  }
}

function downloadData() {
  const dataStr = "const siteData = " + JSON.stringify(siteData, null, 2) + ";";
  const blob = new Blob([dataStr], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "products-data.js";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert(
    'File downloaded! Please replace "products-data.js" in your project folder with this new file.',
  );
}

function editProduct(id) {
  openModal("edit", id);
}

function populateCategorySelect() {
  const select = document.getElementById("p-category");
  select.innerHTML = "";
  categories.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
}
