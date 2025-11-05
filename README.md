# 🏢 Employee Attendance Management System

<p align="center">
  <img src="https://res.cloudinary.com/dusxlxlvm/image/upload/v1761295468/personal/Screenshot_2025-10-24_141228_coeqyb.webp" width="650" height="150" alt="Employee Attendance Logo">
</p>

A **multi-tenant MERN stack application** designed to record, monitor, and manage employee attendance across multiple organizations.  
The system integrates **role-based (RBAC)** and **attribute-based (ABAC)** access control models to enforce fine-grained, secure permissions for users at every level.  
It provides **real-time analytics, reports, and biometric sync support** for HR and management, ensuring efficient workforce oversight.

---

## 🚀 Live Demo
🔗 **[View Live Project](https://your-live-domain.com)**  
*(Hosted on AWS EC2 with Nginx reverse proxy and Cloudinary for media storage)*

---

## ⚙️ Tech Stack

**Frontend:** React.js, Redux, Material UI (MUI), Tailwind CSS  
**Backend:** Node.js, Express.js  
**Database:** MongoDB (Mongoose ORM)  
**Cloud & Infra:** AWS EC2, Nginx, Cloudinary  
**Authentication:** JWT (JSON Web Token)  
**Access Control:** Hybrid RBAC + ABAC  
**Others:** Axios, Toastify, Day.js  

---

## 🌟 Key Features

- 🔐 **Multi-Tenant Architecture** – Supports multiple organizations, each with isolated employee and admin data.
- 🧩 **Hybrid Role & Attribute-Based Access (RBAC + ABAC)** – Super Admins define granular access rules; restrict which Admins or Branch Managers can view or manage specific departments or users.
- 🕒 **Real-Time Attendance Tracking** – Integrates with biometric devices for automatic attendance synchronization.
- 👥 **Employee Management** – Modules for employee registration, department assignment, and attendance logs.
- 📆 **Leave & Advance Tracking** – Manage leave requests, approvals, and advance payments.
- 📊 **Interactive Dashboard** – Displays employee summaries, daily status, attendance statistics, and department analytics.
- ☁️ **Cloud-Optimized Deployment** – Hosted on AWS EC2 with Nginx serving the React build and Cloudinary for media uploads.
- 🔄 **Live Reports** – Generate and export attendance summaries, late arrivals, or absence reports instantly.

---

## 🧭 Getting Started

Follow the steps below to set up and run the project locally.

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/employee-attendance-management.git
cd employee-attendance-management
