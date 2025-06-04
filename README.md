# International Payment System - Customer Portal & API

## Overview

This project is an internal international payment system developed for an international bank. It provides a secure customer portal and accompanying backend API to facilitate international payments. The system allows customers to register, authenticate, and initiate payments, while bank employees can verify and submit payments via an internal portal.

---

## Features

### Customer Portal

- **User Registration:** Customers register with full name, ID number, account number, and password.
- **Secure Login:** Customers authenticate using username, account number, and password.
- **Payment Initiation:** Customers enter payment amount, select currency and payment provider (e.g., SWIFT).
- **Payment Details:** Input recipient account information and SWIFT code.
- **Submit Payment:** Finalize payment request securely.

### Backend API

- Securely handles registration, login, payment creation, and transaction storage.
- Passwords are hashed and salted using bcrypt.
- Input validation via strict regex whitelisting.
- Enforces HTTPS for all traffic.
- Protects against common web vulnerabilities (XSS, CSRF, SQL injection, brute force attacks).

### Bank Employee Portal (Overview)

- Bank staff can log in (pre-registered) to review payments.
- Verify recipient account info and SWIFT codes.
- Approve and submit payments to SWIFT network.

---

## Security Considerations

- **Password Security:** Passwords hashed and salted with bcrypt.
- **Input Validation:** All user input is validated and sanitized using regex whitelists.
- **HTTPS Only:** Enforced on frontend and backend.
- **Web Security:** Protection against XSS, CSRF, SQL/NoSQL injection, brute force attacks.
- **Rate Limiting:** Applied on API endpoints to prevent abuse.

---

## Technologies Used

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT 
- **Password Hashing:** bcrypt
- **Security Middleware:** Helmet, rate-limiter-flexible, csurf
- **API calls:** Axios
- **CSS:** Styling

## Setup & Installation

### Prerequisites

- Node.js >= 16.x
- npm or yarn
- MongoDB
- SSL Certificate for HTTPS (e.g., Let's Encrypt)

## Logging in details
- **For Customer:**
  username: mphocustomer
  accountNumber: 024689753
  password: Customer101

- **For Employee:**
  username: hlakoaneemployee
  employeeId: HLKNMP0001
  password: Employee101


### Backend Setup

1. Clone the repository:
   https://github.com/Mpho-Hlakoane/Customer-Portal 
