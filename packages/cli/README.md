# Nexus CLI

The Nexus CLI is a powerful command-line tool for quickly scaffolding and managing Nexus React applications with a modern, opinionated stack.

## Features

- 🚀 Create production-ready React applications with a single command
- 🎨 Pre-configured with best practices and modern tooling
- ⚡ Built with Vite for lightning-fast development
- 🎯 TypeScript-first development
- 🎨 Tailwind CSS for styling
- 🔄 State management with Redux Toolkit & React Query
- 🛣️ React Router for routing
- 🛠️ ESLint and Prettier for code quality

## Quick Start

Create a new Nexus application:

```bash
# Using npm
npx @nexus/cli new my-app

# Using yarn
yarn create @nexus my-app

# Using pnpm
pnpm create @nexus my-app
```

Then follow the prompts to set up your project.

## Project Structure

```
my-app/
├── public/               # Static files
├── src/
│   ├── app/             # App-wide configurations and providers
│   ├── assets/           # Static assets (images, fonts, etc.)
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-based modules
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Third-party library configurations
│   ├── pages/            # Page components
│   ├── routes/           # Route configurations
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── .gitignore
├── components.json       # UI components configuration
├── eslint.config.js      # ESLint configuration
├── package.json
├── README.md
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Available Scripts

In the project directory, you can run:

### `npm run dev` or `yarn dev`

Runs the app in development mode. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will reload when you make changes.

### `npm run build` or `yarn build`

Builds the app for production to the `dist` folder.

It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run lint` or `yarn lint`

Runs ESLint to check for code quality issues.

### `npm run preview` or `yarn preview`

Previews the production build locally.

## Tech Stack

- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type checking
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [React Query](https://tanstack.com/query/latest) - Data fetching and caching
- [React Router](https://reactrouter.com/) - Routing
- [ESLint](https://eslint.org/) - Code linting
- [Prettier](https://prettier.io/) - Code formatting

## Customization

### Adding Environment Variables

1. Create a `.env` file in the root directory
2. Add environment variables starting with `VITE_` to make them available to your React app

Example:
```env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=My App
```

### Adding a New Page

1. Create a new file in `src/pages` (e.g., `About.tsx`)
2. Add a route in `src/routes/index.tsx`

### Adding a New Component

1. Create a new file in `src/components` (e.g., `Button.tsx`)
2. Import and use it in your pages or other components

## Deployment

### Building for Production

```bash
npm run build
```

This will create a `dist` directory with the production build of your app.

### Deploying to Vercel

[Vercel](https://vercel.com/) is the easiest way to deploy your Nexus app.

1. Push your code to a Git repository
2. Import the repository on Vercel
3. Vercel will automatically detect the project and deploy it

### Deploying to Netlify

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Build your project:
   ```bash
   npm run build
   ```
3. Deploy:
   ```bash
   netlify deploy --prod
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
