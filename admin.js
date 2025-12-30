// Check authentication
if (localStorage.getItem("ammachies_auth") !== "true") {
  window.location.href = "login.html";
}

// Initial Data if empty
const initialProducts = [
  {
    id: 1,
    name: "Malabar Porotta",
    category: "Frozen",
    weight: "454g",
    desc: "Flaky, multi-layered flatbread from the heart of Malabar.",
    img: "https://images.unsplash.com/photo-1626132646529-500637532537?q=80&w=1936",
  },
  {
    id: 2,
    name: "Banana Chips",
    category: "Snacks",
    weight: "200g",
    desc: "Crispy, golden chips made from premium Nendran bananas.",
    img: "https://www.angroos.com/wp-content/uploads/2023/03/second-image-scaled.jpg",
  },
];

if (!localStorage.getItem("ammachies_products")) {
  localStorage.setItem("ammachies_products", JSON.stringify(initialProducts));
}

// Initial Categories
const initialCategories = ["Frozen", "Snacks", "Traditional"];
if (!localStorage.getItem("ammachies_categories")) {
  localStorage.setItem(
    "ammachies_categories",
    JSON.stringify(initialCategories)
  );
}

let products = JSON.parse(localStorage.getItem("ammachies_products"));
let categories = JSON.parse(localStorage.getItem("ammachies_categories"));

const tbody = document.getElementById("product-tbody");
const modal = document.getElementById("product-modal");
const categoryModal = document.getElementById("category-modal");
const form = document.getElementById("product-form");
const filterBtns = document.querySelectorAll(".filter-btn");

let currentFilter = "all";

function renderProducts(filter = "all") {
  currentFilter = filter;
  tbody.innerHTML = "";

  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  filteredProducts.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td>${p.weight}</td>
            <td class="action-btns">
                <button class="btn btn-primary btn-small" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn btn-accent btn-small" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

function saveProducts() {
  localStorage.setItem("ammachies_products", JSON.stringify(products));
  renderProducts(currentFilter);
}

window.deleteProduct = (id) => {
  if (confirm("Are you sure you want to delete this product?")) {
    products = products.filter((p) => p.id !== id);
    saveProducts();
  }
};

window.editProduct = (id) => {
  const p = products.find((p) => p.id === id);
  document.getElementById("product-id").value = p.id;
  document.getElementById("p-name").value = p.name;
  document.getElementById("p-category").value = p.category;
  document.getElementById("p-weight").value = p.weight;
  document.getElementById("p-desc").value = p.desc;
  document.getElementById("p-img").value = p.img;

  document.getElementById("modal-title").innerText = "Edit Product";
  updateCategoryDropdown(); // Ensure dropdown is up to date
  document.getElementById("p-category").value = p.category;
  modal.style.display = "flex";
};

document.getElementById("add-product-btn").addEventListener("click", () => {
  form.reset();
  updateCategoryDropdown(); // Ensure dropdown is up to date
  document.getElementById("product-id").value = "";
  document.getElementById("modal-title").innerText = "Add New Product";
  modal.style.display = "flex";
});

// Category Management Logic
const categoryTbody = document.getElementById("category-tbody");
const newCategoryInput = document.getElementById("new-category-input");

function renderCategories() {
  categoryTbody.innerHTML = "";
  categories.forEach((cat) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${cat}</td>
            <td>
                <button class="btn btn-accent btn-small" onclick="deleteCategory('${cat}')">Delete</button>
            </td>
        `;
    categoryTbody.appendChild(tr);
  });
}

function updateCategoryDropdown() {
  const select = document.getElementById("p-category");
  select.innerHTML = "";
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.innerText = cat;
    select.appendChild(option);
  });
}

function saveCategories() {
  localStorage.setItem("ammachies_categories", JSON.stringify(categories));
  renderCategories();
  // Also update filter buttons if needed (reloading logic might be needed for full dynamic filters)
}

window.deleteCategory = (cat) => {
  // Safety Check: Check if any product uses this category
  const productsInCat = products.filter((p) => p.category === cat);
  if (productsInCat.length > 0) {
    alert(
      `Cannot delete category "${cat}" because it contains ${productsInCat.length} product(s). Please delete these products first.`
    );
    return;
  }

  if (confirm(`Are you sure you want to delete category "${cat}"?`)) {
    categories = categories.filter((c) => c !== cat);
    saveCategories();
  }
};

document
  .getElementById("manage-categories-btn")
  .addEventListener("click", () => {
    renderCategories();
    categoryModal.style.display = "flex";
  });

document
  .getElementById("close-category-modal")
  .addEventListener("click", () => {
    categoryModal.style.display = "none";
  });

document.getElementById("add-category-btn").addEventListener("click", () => {
  const newCat = newCategoryInput.value.trim();
  if (newCat && !categories.includes(newCat)) {
    categories.push(newCat);
    saveCategories();
    newCategoryInput.value = "";
  } else if (categories.includes(newCat)) {
    alert("Category already exists!");
  }
});

document.getElementById("close-modal").addEventListener("click", () => {
  modal.style.display = "none";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("product-id").value;
  const name = document.getElementById("p-name").value;
  const img = document.getElementById("p-img").value;

  // Basic Validation
  if (!name) {
    alert("Product name is required.");
    return;
  }

  const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i;
  const unsplashPattern = /^https?:\/\/images\.unsplash\.com\/.*$/i;

  if (img && !urlPattern.test(img) && !unsplashPattern.test(img)) {
    if (!confirm("The image URL might not be valid. Save anyway?")) {
      return;
    }
  }

  const newP = {
    id: id ? parseInt(id) : Date.now(),
    name: name,
    category: document.getElementById("p-category").value || "Traditional",
    weight: document.getElementById("p-weight").value || "Standard",
    desc: document.getElementById("p-desc").value,
    img: img,
  };

  if (id) {
    products = products.map((p) => (p.id === parseInt(id) ? newP : p));
    console.log("Product updated:", name);
  } else {
    products.push(newP);
    console.log("Product added:", name);
  }

  saveProducts();
  modal.style.display = "none";
  alert(`Product ${id ? "updated" : "added"} successfully!`);
});

// Category Filter Listeners
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.getAttribute("data-category"));
  });
});

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("ammachies_auth");
  window.location.href = "login.html";
});

renderProducts("all");
