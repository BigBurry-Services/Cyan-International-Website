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

// Initial Categories (Migrated to Objects)
const initialCategories = [
  {
    name: "Frozen",
    img: "https://images.unsplash.com/photo-1626132646529-500637532537?q=80&w=1936",
  },
  {
    name: "Snacks",
    img: "https://www.angroos.com/wp-content/uploads/2023/03/second-image-scaled.jpg",
  },
  {
    name: "Traditional",
    img: "https://img.freepik.com/premium-photo/group-south-indian-food-like-masala-dosa-uttapam-idli-idly-wada-vada-sambar-appam-semolina-halwa-upma-served-banana-leaf-with-colourful-chutneys-selective-focus_466689-25679.jpg",
  },
];

let categories = JSON.parse(localStorage.getItem("ammachies_categories"));

// Data Migration Handler: Convert string array to object array if needed
if (
  !categories ||
  (categories.length > 0 && typeof categories[0] === "string")
) {
  console.log("Migrating categories to object structure...");
  if (!categories) {
    categories = initialCategories;
  } else {
    // Convert existing strings to objects with placeholder
    categories = categories.map((cat) => ({
      name: cat,
      img: "https://via.placeholder.com/300?text=" + cat,
    }));
  }
  localStorage.setItem("ammachies_categories", JSON.stringify(categories));
}

let products = JSON.parse(localStorage.getItem("ammachies_products"));

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
// Category Management Logic
const categoryTbody = document.getElementById("category-tbody");
const newCategoryInput = document.getElementById("new-category-input");
const newCategoryImg = document.getElementById("new-category-img"); // New Element
const addCategoryBtn = document.getElementById("add-category-btn"); // Get reference

let editingCategoryName = null;

function renderCategories() {
  categoryTbody.innerHTML = "";
  categories.forEach((cat) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td><img src="${cat.img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
            <td>${cat.name}</td>
            <td>
                <button class="btn btn-primary btn-small" onclick="editCategory('${cat.name}')">Edit</button>
                <button class="btn btn-accent btn-small" onclick="deleteCategory('${cat.name}')">Delete</button>
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
    option.value = cat.name;
    option.innerText = cat.name;
    select.appendChild(option);
  });
}

function saveCategories() {
  localStorage.setItem("ammachies_categories", JSON.stringify(categories));
  renderCategories();
}

window.deleteCategory = (catName) => {
  // Safety Check: Check if any product uses this category
  const productsInCat = products.filter((p) => p.category === catName);
  if (productsInCat.length > 0) {
    alert(
      `Cannot delete category "${catName}" because it contains ${productsInCat.length} product(s). Please delete these products first.`
    );
    return;
  }

  if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
    categories = categories.filter((c) => c.name !== catName);
    saveCategories();
    updateCategoryDropdown();
  }
};

window.editCategory = (catName) => {
  const cat = categories.find((c) => c.name === catName);
  if (cat) {
    newCategoryInput.value = cat.name;
    newCategoryImg.value = cat.img;
    editingCategoryName = cat.name;
    addCategoryBtn.innerText = "Update Category";
    // Optional: change button style
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
    // Reset form on close
    newCategoryInput.value = "";
    newCategoryImg.value = "";
    editingCategoryName = null;
    addCategoryBtn.innerText = "Add Category";
  });

document.getElementById("add-category-btn").addEventListener("click", () => {
  const name = newCategoryInput.value.trim();
  const img =
    newCategoryImg.value.trim() ||
    "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?q=80&w=1974"; // Default image if empty

  if (!name) {
    alert("Category name is required");
    return;
  }

  if (editingCategoryName) {
    // UPDATE EXISTING CATEGORY
    const existingCat = categories.find((c) => c.name === editingCategoryName);
    if (existingCat) {
      existingCat.name = name;
      existingCat.img = img;

      // Update linked products
      if (editingCategoryName !== name) {
        products.forEach((p) => {
          if (p.category === editingCategoryName) {
            p.category = name;
          }
        });
        saveProducts();
      }

      saveCategories();
      updateCategoryDropdown();

      // Reset UI
      newCategoryInput.value = "";
      newCategoryImg.value = "";
      editingCategoryName = null;
      addCategoryBtn.innerText = "Add Category";
      alert("Category updated successfully!");
    }
  } else {
    // ADD NEW CATEGORY
    if (!categories.some((c) => c.name === name)) {
      categories.push({ name, img });
      saveCategories();
      updateCategoryDropdown();
      newCategoryInput.value = "";
      newCategoryImg.value = "";
    } else {
      alert("Category already exists!");
    }
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
