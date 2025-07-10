<div align="center">
  <h1>Nexus</h1>
  <p>A modern framework for building scalable React applications with TypeScript, Redux Toolkit, and Vite.</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![npm version](https://img.shields.io/npm/v/@nexus-dev/cli.svg)](https://www.npmjs.com/package/@nexus-dev/cli)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white" alt="Redux" />
  <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</div>

## ✨ Features

- ⚡ **Blazing Fast** - Built on Vite for lightning-fast development and builds
- 🎨 **Modern Styling** - Styled Components and CSS Modules support
- 🧩 **Modular Architecture** - Feature-based folder structure
- 🗃️ **State Management** - Redux Toolkit with RTK Query
- 🛣️ **Routing** - React Router with code-splitting
- 🧪 **Testing** - Jest and React Testing Library
- 🎯 **TypeScript First** - Full TypeScript support
- 🔌 **Plugin System** - Extensible architecture
- 📱 **Responsive** - Mobile-first approach

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+ or yarn 1.22+
- Git

### Create a New Project

```bash
# Using npx
npx @nexus-dev/cli new my-app

# Or install globally
npm install -g @nexus-dev/cli
nexus new my-app

# Navigate to project
cd my-app

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📂 Project Structure

```
my-app/
├── public/                # Static files
├── src/
│   ├── app/               # App configuration and store
│   ├── assets/            # Static assets (images, fonts, etc.)
│   ├── components/        # Shared components
│   ├── features/          # Feature modules
│   │   └── [feature]/     # Feature folder
│   │       ├── api/       # API definitions (RTK Query)
│   │       ├── components/# Feature-specific components
│   │       ├── hooks/     # Custom hooks
│   │       ├── store/     # Redux slice and actions
│   │       ├── types/     # TypeScript types
│   │       └── index.ts   # Public API
│   ├── hooks/             # Global hooks
│   ├── layouts/           # Layout components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── styles/            # Global styles
│   ├── types/             # Global TypeScript types
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Root component
│   └── main.tsx           # Application entry point
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## 🛠️ CLI Commands

### Create a New Project

```bash
nexus new my-app
```

### Generate Components

```bash
# Generate a component
nexus generate component Button
# or shorthand:
nexus g c Button
```

### Generate Services

```bash
# Generate a service
nexus generate service ApiService
# or shorthand:
nexus g s ApiService
```

### Generate Pages

```bash
# Generate a page with routing
nexus create-page Dashboard
```

### Generate Redux Slices

```bash
# Basic Redux slice
nexus create-redux auth

# With RTK Query API integration
nexus create-redux products --with-api
```

## 🧪 Testing

Run tests:

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## 🚀 Deployment

Build for production:

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

Deploy to your favorite platform:

- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [GitHub Pages](https://pages.github.com/)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Learn More

- [Nexus Documentation](https://nexus-docs.example.com)
- [React Documentation](https://reactjs.org/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
