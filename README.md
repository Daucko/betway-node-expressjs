# Betwise Node.js Express Backend

Betwise is a backend API for a sports betting platform, built with Node.js, Express, and MongoDB. It provides secure user authentication, game and bet management, wallet operations, and email-based account verification. The API is designed for scalability, security, and easy integration with frontend or mobile applications.

## Features

- **User Registration & Login:** Secure authentication with JWT, email verification, and password reset via email.
- **Game Management:** Create, update, and retrieve sports games with results and odds.
- **Betting System:** Place, process, and settle bets on various outcomes, including match results, goals, and special bets.
- **Wallet Management:** Track user balances and transactions, update wallet on bet wins/losses.
- **Email Notifications:** Send welcome, verification, and password reset emails using Nodemailer and Gmail.
- **Role-based Access:** Middleware for admin and user verification.
- **RESTful API:** Well-structured endpoints for all core operations.

## Tech Stack

- Node.js
- Express.js
- MongoDB (with Mongoose)
- Nodemailer (Gmail SMTP)
- JWT for authentication
- bcryptjs for password hashing

## Getting Started

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file with your MongoDB URI, JWT secrets, Gmail credentials, and base URL.
4. **Run the server:**
   ```bash
   npm run dev
   ```
5. **API Documentation:**
   - See the full API docs: [Postman Documentation](https://documenter.getpostman.com/view/29258774/2sB2qcCgCN)

## Folder Structure

- `controllers/` — Business logic for authentication, games, bets, wallet, etc.
- `models/` — Mongoose schemas for User, Game, Bet.
- `routes/` — Express route definitions for all API endpoints.
- `middleware/` — Custom middleware for authentication, admin checks, and verification.
- `config/` — Database connection and email configuration.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the ISC License.
