# Employee Management System (HTML, CSS, JS)

A simple Employee Management System with **Login/Register** and full **CRUD** (Create, Read, Update, Delete) for employees — built with plain HTML, CSS, and JavaScript. No backend, no frameworks. Data is stored in the browser using `localStorage`.

## Features

- **Register** a new user account (username + password)
- **Login** with saved credentials
- **Session handling** — stays logged in until logout (using `sessionStorage`)
- **Add Employee** — name, email, department, position, salary
- **View Employees** — table list, updates live
- **Edit Employee** — click Edit, form pre-fills, click Update
- **Delete Employee** — with confirm prompt
- **Search / Filter** — by name or department
- **Responsive** — table turns into stacked cards on mobile

## How it works (no backend)

- `localStorage` stores two things permanently in the browser:
  - `ems_users` → array of registered users
  - `ems_employees` → array of employee records
- `sessionStorage` stores who's currently logged in (`ems_current_user`) — cleared on logout or when the browser tab closes.
- All CRUD operations read the array from `localStorage`, modify it in JavaScript, then save it back.

## How to run

1. Download the folder
2. Open `index.html` in any browser
3. Register a new account → login → start adding employees

## Files

```
ems-project/
├── index.html   → login, register, and dashboard markup
├── style.css    → all styling
├── app.js       → auth logic + employee CRUD logic
└── README.md
```

## Talking points for interview

- **Why localStorage instead of a database?** — This is a frontend-only project to demonstrate DOM manipulation, form handling, and CRUD logic without needing a backend. It could be swapped for a real API (e.g. Node/Express + MongoDB) later without changing the UI much.
- **How CRUD maps to functions:**
  - Create → `employeeForm` submit handler (when `editingId` is null)
  - Read → `renderEmployees()`
  - Update → `employeeForm` submit handler (when `editingId` is set) via `editEmployee()`
  - Delete → `deleteEmployee()`
- **Why sessionStorage for login state?** — Keeps the user logged in while the tab is open, but clears on close — simple way to simulate a session without a server.
- **Security note (good to mention proactively):** passwords are stored in plain text in localStorage here for simplicity — in a real app, this would go through a backend with hashed passwords (e.g. bcrypt) and never be stored client-side.
