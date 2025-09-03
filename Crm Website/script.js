let customers = JSON.parse(localStorage.getItem("customers")) || [];

const customerForm = document.getElementById("customerForm");
const customerList = document.getElementById("customerList");
const search = document.getElementById("search");
const filterStatus = document.getElementById("filterStatus");
const exportBtn = document.getElementById("exportBtn");

let editingCustomerId = null;

// Handle form submission
customerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const status = document.getElementById("status").value;
  const technician = document.getElementById("technician").value;
  const note = document.getElementById("note").value.trim();

  // Phone validation (must be exactly 10 digits)
  if (!/^\d{10}$/.test(phone)) {
    alert("Phone number must be exactly 10 digits.");
    return;
  }

  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Technician validation
  if (!technician) {
    alert("Please assign a technician.");
    return;
  }

  if (editingCustomerId) {
    const index = customers.findIndex(c => c.id === editingCustomerId);
    customers[index] = { ...customers[index], name, email, phone, status, technician, note };
    editingCustomerId = null;
  } else {
    const customer = {
      id: Date.now(),
      name,
      email,
      phone,
      status,
      technician,
      note,
      createdAt: new Date().toLocaleString(),
    };
    customers.push(customer);
  }

  localStorage.setItem("customers", JSON.stringify(customers));
  customerForm.reset();
  displayCustomers();
  updateChart();
});

// Display customers
function displayCustomers() {
  customerList.innerHTML = "";
  const keyword = search.value.toLowerCase();
  const filter = filterStatus.value;

  const filtered = customers.filter(c => {
    return (
      c.name.toLowerCase().includes(keyword) &&
      (filter === "all" || c.status === filter)
    );
  });

  if (filtered.length === 0) {
    customerList.innerHTML = "<p>No customers found.</p>";
    return;
  }

  filtered.forEach((c) => {
    const div = document.createElement("div");
    div.className = "customer";
    div.innerHTML = `
      <h3>${c.name}</h3>
      <p><strong>Email:</strong> ${c.email}</p>
      <p><strong>Phone:</strong> ${c.phone}</p>
      <p><strong>Status:</strong> ${c.status}</p>
      <p><strong>Technician:</strong> ${c.technician}</p>
      <p><strong>Note:</strong> ${c.note}</p>
      <p><small><strong>Created:</strong> ${c.createdAt || "--"}</small></p>
      <button class="delete-btn" onclick="deleteCustomer(${c.id})">Delete</button>
      <button class="edit-btn" onclick="editCustomer(${c.id})">Edit</button>
    `;
    customerList.appendChild(div);
  });
}

function deleteCustomer(id) {
  customers = customers.filter(c => c.id !== id);
  localStorage.setItem("customers", JSON.stringify(customers));
  displayCustomers();
  updateChart();
}

function editCustomer(id) {
  const c = customers.find(c => c.id === id);
  document.getElementById("name").value = c.name;
  document.getElementById("email").value = c.email;
  document.getElementById("phone").value = c.phone;
  document.getElementById("status").value = c.status;
  document.getElementById("technician").value = c.technician;
  document.getElementById("note").value = c.note;
  editingCustomerId = id;
}

function updateChart() {
  const leadCount = customers.filter(c => c.status === "lead").length;
  const clientCount = customers.filter(c => c.status === "client").length;

  const ctx = document.getElementById("statusChart").getContext("2d");
  if (window.statusChart) window.statusChart.destroy();
  window.statusChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Leads", "Clients"],
      datasets: [
        {
          data: [leadCount, clientCount],
          backgroundColor: ["#ffc107", "#28a745"],
        },
      ],
    },
  });
}

function exportToCSV() {
  let csv = "Name,Email,Phone,Status,Technician,Note,Created At\n";
  customers.forEach(c => {
    csv += `${c.name},${c.email},${c.phone},${c.status},${c.technician},"${c.note}",${c.createdAt || ""}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customers.csv";
  a.click();
  window.URL.revokeObjectURL(url);
}

exportBtn.addEventListener("click", exportToCSV);
search.addEventListener("input", displayCustomers);
filterStatus.addEventListener("change", displayCustomers);

// Initialize
displayCustomers();
updateChart();
