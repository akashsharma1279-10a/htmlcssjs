// Master demo accounts
const DEFAULT_USERS = [
  { username: 'admin', password: 'admin123' },
  { username: 'akas11', password: 'password123' },
  { username: 'akas11', password: 'akas11' }
];

const DEFAULT_EMPLOYEES = [
  { id: '1700000000001', name: 'Rahul Sharma', email: 'rahul@example.com', department: 'Engineering', position: 'Senior Developer', salary: 1200000 },
  { id: '1700000000002', name: 'Priya Patel', email: 'priya@example.com', department: 'Human Resources', position: 'HR Manager', salary: 850000 },
  { id: '1700000000003', name: 'Amit Verma', email: 'amit@example.com', department: 'Marketing', position: 'Marketing Lead', salary: 950000 }
];

// ---------- Storage helpers ----------
function getUsers() {
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem('ems_users')) || [];
  } catch (e) {
    users = [];
  }

  // Ensure default demo users always exist
  DEFAULT_USERS.forEach(defUser => {
    if (!users.some(u => u.username.toLowerCase() === defUser.username.toLowerCase())) {
      users.push(defUser);
    }
  });
  saveUsers(users);
  return users;
}

function saveUsers(users) {
  localStorage.setItem('ems_users', JSON.stringify(users));
}

function getEmployees() {
  let employees = [];
  try {
    employees = JSON.parse(localStorage.getItem('ems_employees')) || [];
  } catch (e) {
    employees = [];
  }

  if (employees.length === 0) {
    employees = [...DEFAULT_EMPLOYEES];
    saveEmployees(employees);
  }
  return employees;
}

function saveEmployees(employees) {
  localStorage.setItem('ems_employees', JSON.stringify(employees));
}

function getCurrentUser() {
  return sessionStorage.getItem('ems_current_user');
}
function setCurrentUser(username) {
  sessionStorage.setItem('ems_current_user', username);
}
function clearCurrentUser() {
  sessionStorage.removeItem('ems_current_user');
}

// Initialize on page load
getUsers();
getEmployees();

// ---------- Page elements ----------
const loginPage = document.getElementById('loginPage');
const registerPage = document.getElementById('registerPage');
const dashboardPage = document.getElementById('dashboardPage');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const fillDemoBtn = document.getElementById('fillDemoBtn');

if (fillDemoBtn) {
  fillDemoBtn.addEventListener('click', () => {
    document.getElementById('loginUsername').value = 'admin';
    document.getElementById('loginPassword').value = 'admin123';
    loginError.textContent = '';
  });
}

document.getElementById('goToRegister').addEventListener('click', (e) => {
  e.preventDefault();
  loginPage.classList.add('hidden');
  registerPage.classList.remove('hidden');
});

document.getElementById('goToLogin').addEventListener('click', (e) => {
  e.preventDefault();
  registerPage.classList.add('hidden');
  loginPage.classList.remove('hidden');
});

// ---------- Register ----------
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  registerError.textContent = '';

  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;

  if (password !== confirmPassword) {
    registerError.textContent = 'Passwords do not match.';
    return;
  }

  const users = getUsers();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    registerError.textContent = 'Username already exists.';
    return;
  }

  users.push({ username, password });
  saveUsers(users);

  registerForm.reset();
  registerPage.classList.add('hidden');
  loginPage.classList.remove('hidden');
});

// ---------- Login ----------
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loginError.textContent = '';

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    loginError.textContent = 'Please enter both username and password.';
    return;
  }

  let users = getUsers();
  let match = users.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  // If no match found
  if (!match) {
    // Check if account already exists with different password
    const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      loginError.textContent = 'Invalid password for this account. Or use Demo: admin / admin123';
      return;
    }

    // Auto-create account if brand new username entered on login
    users.push({ username, password });
    saveUsers(users);
    match = { username, password };
  }

  setCurrentUser(match.username);
  loginForm.reset();
  showDashboard();
});

// ---------- Logout ----------
document.getElementById('logoutBtn').addEventListener('click', () => {
  clearCurrentUser();
  dashboardPage.classList.add('hidden');
  loginPage.classList.remove('hidden');
});

// ---------- Show dashboard ----------
function showDashboard() {
  loginPage.classList.add('hidden');
  registerPage.classList.add('hidden');
  dashboardPage.classList.remove('hidden');
  document.getElementById('welcomeUser').textContent = 'Hi, ' + getCurrentUser();
  renderEmployees();
}

// If already logged in this session, skip login screen
if (getCurrentUser()) {
  showDashboard();
}

// ==========================================================
// Employee CRUD
// ==========================================================
const employeeForm = document.getElementById('employeeForm');
const employeeTableBody = document.getElementById('employeeTableBody');
const emptyState = document.getElementById('emptyState');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const searchInput = document.getElementById('searchInput');

let editingId = null;

// ---------- Render table ----------
function renderEmployees(filter = '') {
  const employees = getEmployees();
  const term = filter.trim().toLowerCase();

  const filtered = term
    ? employees.filter(emp =>
        emp.name.toLowerCase().includes(term) ||
        emp.department.toLowerCase().includes(term)
      )
    : employees;

  employeeTableBody.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  filtered.forEach(emp => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td data-label="Name">${escapeHtml(emp.name)}</td>
      <td data-label="Email">${escapeHtml(emp.email)}</td>
      <td data-label="Department">${escapeHtml(emp.department)}</td>
      <td data-label="Position">${escapeHtml(emp.position)}</td>
      <td data-label="Salary">₹${Number(emp.salary).toLocaleString('en-IN')}</td>
      <td data-label="Actions">
        <div class="action-buttons">
          <button class="btn btn-outline btn-small" onclick="editEmployee('${emp.id}')">Edit</button>
          <button class="btn btn-danger btn-small" onclick="deleteEmployee('${emp.id}')">Delete</button>
        </div>
      </td>
    `;
    employeeTableBody.appendChild(row);
  });
}

// simple escape to avoid breaking table markup with special characters
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Add / Update ----------
employeeForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const employee = {
    name: document.getElementById('empName').value.trim(),
    email: document.getElementById('empEmail').value.trim(),
    department: document.getElementById('empDept').value.trim(),
    position: document.getElementById('empPosition').value.trim(),
    salary: document.getElementById('empSalary').value
  };

  const employees = getEmployees();

  if (editingId) {
    // Update existing
    const index = employees.findIndex(emp => emp.id === editingId);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...employee };
    }
  } else {
    // Add new
    employee.id = Date.now().toString();
    employees.push(employee);
  }

  saveEmployees(employees);
  resetForm();
  renderEmployees(searchInput.value);
});

// ---------- Edit ----------
function editEmployee(id) {
  const employees = getEmployees();
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  editingId = id;
  document.getElementById('empName').value = emp.name;
  document.getElementById('empEmail').value = emp.email;
  document.getElementById('empDept').value = emp.department;
  document.getElementById('empPosition').value = emp.position;
  document.getElementById('empSalary').value = emp.salary;

  formTitle.textContent = 'Edit Employee';
  submitBtn.textContent = 'Update Employee';
  cancelEditBtn.classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Delete ----------
function deleteEmployee(id) {
  if (!confirm('Delete this employee?')) return;
  const employees = getEmployees().filter(e => e.id !== id);
  saveEmployees(employees);
  renderEmployees(searchInput.value);
}

// ---------- Cancel edit ----------
cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
  employeeForm.reset();
  editingId = null;
  formTitle.textContent = 'Add Employee';
  submitBtn.textContent = 'Add Employee';
  cancelEditBtn.classList.add('hidden');
}

// ---------- Search ----------
searchInput.addEventListener('input', () => {
  renderEmployees(searchInput.value);
});

// expose functions used via inline onclick
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
