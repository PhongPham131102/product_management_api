# Product Management API
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/PhongPham131102/product_management_api)

This repository contains the backend API for a Product Management system, built with Node.js, Express, and TypeScript. It features a robust role-based access control (RBAC) system and is designed to be scalable and maintainable.

## Features

-   **RESTful API:** A well-structured API for managing users, roles, and permissions.
-   **Role-Based Access Control (RBAC):** Granular control over user permissions with distinct roles and actions (create, read, update, delete, manage).
-   **Database Integration:** Uses Mongoose for elegant MongoDB object modeling.
-   **Secure by Default:** Implements Helmet for securing HTTP headers and bcryptjs for password hashing.
-e   **Structured Logging:** Utilizes Winston for comprehensive and context-aware application logging.
-   **TypeScript:** Type safety for a more robust and developer-friendly codebase.
-   **Environment Configuration:** Uses `dotenv` for easy management of environment-specific variables.

## Tech Stack

-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB
-   **ODM:** Mongoose
-   **Language:** TypeScript
-   **Authentication:** JSON Web Token (JWT)
-   **Security:** Helmet, bcryptjs
-   **Logging:** Winston, Morgan
-   **Development Tools:** ESLint, Nodemon, ts-node-dev

## Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later recommended)
-   [MongoDB](https://www.mongodb.com/)
-   [npm](https://www.npmjs.com/) or another package manager

## Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/phongpham131102/product_management_api.git
    cd product_management_api
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory by copying the example file:
    ```sh
    cp .env.example .env
    ```
    Update the `.env` file with your configuration, especially your MongoDB connection string:
    ```
    # Server Configuration
    PORT=3000

    # Database Configuration
    MONGO_URI=mongodb://localhost:27017/product_management

    # JWT Configuration
    JWT_SECRET=your-super-secret-key
    JWT_EXPIRES_IN=24h
    ```

## Running the Application

-   **Development Mode:**
    To run the server with hot-reloading using Nodemon:
    ```sh
    npm run start:dev
    ```

-   **Production Mode:**
    First, build the TypeScript code into JavaScript:
    ```sh
    npm run build
    ```
    Then, start the production server:
    ```sh
    npm run start
    ```

-   **Linting:**
    To check for code style and potential errors:
    ```sh
    npm run lint
    ```
    To automatically fix linting issues:
    ```sh
    npm run lint:fix
    ```

## Core Concepts

The API is structured around a Role-Based Access Control (RBAC) model consisting of three main entities: Users, Roles, and Permissions.

### Data Models

-   **User:** Represents a user of the system. Each user is assigned a single role. The model includes fields like `username`, `password`, `name`, `email`, and `role`.
-   **Role:** Defines a collection of permissions. Upon initialization, a `Supper Admin` role is created with full access.
-   **Permission:** Links a `Role` to a specific `action` (e.g., `create`, `read`, `update`) on a `subject` (e.g., `user`, `role`, `all`). This determines what a user with a given role is allowed to do.

### Initialization

On the first run, the application automatically seeds the database with:
-   A default `Supper Admin` role.
-   A permission granting the `Supper Admin` role full (`manage`) access to all (`all`) subjects.
-   A default `admin` user with the `Supper Admin` role.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.