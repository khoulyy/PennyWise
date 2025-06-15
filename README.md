# Pennywise

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/khoulyy/pennywise/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Pennywise is a modern personal finance tracker built with Angular and Firebase. Easily manage your expenses, track your balance, and visualize your spending trends with beautiful charts and a responsive UI.

---

## 📸 Demo

---

## Features

- 🔒 **Authentication**: Secure login and logout with Firebase Auth
- 💸 **Balance Tracking**: See your current balance at a glance
- 📊 **Expense Chart**: Visualize weekly expenses with a modern chart
- 📝 **Add Expenses**: Quickly add new expenses with a sleek modal form
- 🗂️ **Expense Categories**: Organize spending by category
- 🕒 **Recent Transactions**: View your latest expenses
- 🌈 **Responsive UI**: Built with Tailwind CSS for a clean, mobile-friendly experience

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:khoulyy/pennywise.git
   cd pennywise
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up your Firebase project:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore and Authentication (Email/Password)
   - Copy your Firebase config to `src/environments/environment.ts`
   - Example:
     ```ts
     export const environment = {
       production: false,
       firebase: {
         apiKey: "YOUR_API_KEY",
         authDomain: "YOUR_AUTH_DOMAIN",
         projectId: "YOUR_PROJECT_ID",
         storageBucket: "YOUR_STORAGE_BUCKET",
         messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
         appId: "YOUR_APP_ID",
       },
     };
     ```

### Running the App

Start the development server:

```bash
ng serve
```

Visit [http://localhost:4200](http://localhost:4200) in your browser.

## Project Structure

- `src/app/components/` - UI components (balance, expense chart, add expense, etc.)
- `src/app/pages/` - Main pages (home, login, register, profile, etc.)
- `src/app/services/` - Angular services for authentication and Firestore
- `src/app/models/` - TypeScript interfaces for data models

## Firestore Structure

- `users` collection: Each document represents a user, with fields:
  - `uId` (string): Firebase Auth user UID
  - `email` (string)
  - `name` (string)
  - `balance` (number)
- `expenses` collection: Each document represents an expense, with fields:
  - `amount` (number)
  - `category` (string)
  - `date` (string, ISO format)
  - `description` (string)
  - `uId` (string): Firebase Auth user UID

## Customization

- Update categories in the add expense modal as needed
- Tweak Tailwind CSS classes for your preferred look

## Development Scripts

- `ng serve` - Start the dev server
- `ng build` - Build the app for production
- `ng test` - Run unit tests

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any feature, bugfix, or suggestion.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

MIT

---

Made with ❤️ using Angular, Firebase, and Tailwind CSS.
