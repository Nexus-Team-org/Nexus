# Nexus Application

This project was generated with [Nexus CLI](https://github.com/your-org/nexus).

## Features

- 🚀 Built with React 18 and TypeScript
- ⚡ Vite for fast development and building
- 🎨 Styled Components for styling
- 🗃️ Redux Toolkit for state management
- 🛣️ React Router for routing
- 🔄 React Query for server state
- 🧪 Testing with Jest and React Testing Library
- 🎯 TypeScript-first development

## Prerequisites

- Node.js 18+
- npm 9+ or yarn 1.22+
- Git

## Getting Started

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Available Scripts

- `dev` - Start the development server
- `build` - Build the app for production
- `preview` - Preview the production build locally
- `test` - Run tests
- `test:watch` - Run tests in watch mode
- `test:coverage` - Generate test coverage report
- `lint` - Run ESLint
- `format` - Format code with Prettier

## Project Structure

```
src/
├── app/                  # App configuration and store
├── assets/               # Static assets
├── components/           # Shared components
├── features/             # Feature modules
│   └── [feature]/        # Feature folder
│       ├── api/          # API definitions (RTK Query)
│       ├── components/   # Feature components
│       ├── hooks/        # Custom hooks
│       ├── types/        # TypeScript types
│       └── index.ts      # Public API
├── hooks/                # Global hooks
├── layouts/              # Layout components
├── pages/                # Page components
├── services/             # API services
├── styles/               # Global styles
├── types/                # Global TypeScript types
├── utils/                # Utility functions
├── App.tsx               # Root component
└── main.tsx              # Application entry point
```

## State Management

This project uses Redux Toolkit for state management. Features should follow the "feature folder" pattern with:

- `featureSlice.ts` - Redux slice
- `featureApi.ts` - RTK Query API (if needed)
- `featureSelectors.ts` - Selector functions
- `featureTypes.ts` - TypeScript types

## Styling

This project uses Styled Components for styling. Global styles can be found in `src/styles/`.

## Testing

Run the test suite:

```bash
npm test
```

## Building for Production

1. Create a production build:

```bash
npm run build
```

2. Preview the production build:

```bash
npm run preview
```

## Deployment

This project is configured to be deployed to Vercel, Netlify, or any static hosting service.

## Learn More

- [Nexus Documentation](https://nexus-docs.example.com)
- [React Documentation](https://reactjs.org/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)
