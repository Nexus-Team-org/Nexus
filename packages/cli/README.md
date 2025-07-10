# Nexus CLI

The official command-line interface for Nexus, a modern framework that brings Angular-like features to React. This CLI helps you quickly scaffold and manage your Nexus applications.

## Features

- **Project Generation**: Create new Nexus projects with a single command
- **Component Generation**: Quickly generate components with decorators
- **Service Generation**: Create injectable services with the DI container
- **Page Generation**: Generate page components with routing setup
- **Redux Integration**: Generate Redux slices with RTK Query support
- **TypeScript Ready**: Full TypeScript support out of the box

## Installation

### Global Installation (Recommended)

```bash
npm install -g @nexus-dev/cli
```

## Usage

### Create a New Project

```bash
nexus new my-app
cd my-app
npm run dev
```

### Generate a new page

```bash
nexus create-page PageName
```

### Generate a new Redux slice

```bash
# Basic Redux slice
nexus create-redux featureName

# With RTK Query API integration
nexus create-redux featureName --with-api
```

This will create the following structure:
```
src/
└── features/
    └── featureName/
        ├── featureNameSlice.ts  # Redux slice with actions & reducers
        ├── types.ts            # TypeScript type definitions
        ├── selectors.ts        # Selector functions
        ├── api.ts              # RTK Query API (if --with-api flag is used)
        └── index.ts            # Barrel file for clean exports
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
