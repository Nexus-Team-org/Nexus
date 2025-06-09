# Nexus

Nexus is a modern framework that brings Angular-like features to React, including decorators, dependency injection, and a powerful CLI, built with TypeScript and ES modules. It provides a structured way to build scalable React applications with a familiar Angular-like development experience.

## Features

- **Component Decorators**: Use `@Component` to define your React components with templates
- **Dependency Injection**: Built-in DI container with `@Injectable` decorator
- **Module System**: Organize your application with `@Module`
- **CLI Tools**: Generate components, services, and more with the Nexus CLI
- **TypeScript First**: Built with TypeScript for better developer experience
- **ES Modules**: Modern JavaScript modules for better tree-shaking and performance

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- TypeScript 5.0+
- Git (for version control)

## Getting Started

### Installation

#### Using npx (recommended)

```bash
npx @nexus-dev/cli new my-app
cd my-app
npm install
npm start
```

#### Local Development Setup

If you want to contribute to Nexus or use the latest development version:

```bash
# Clone the repository
git clone https://github.com/AnasEchoFanani/Nexus.git
cd Nexus

# Install dependencies
npm install

# Build all packages
npm run build

# Create a new application using the local CLI
node packages/cli/dist/index.js new my-app
cd my-app
npm install
npm start
```

### Project Structure

When you create a new Nexus application, you'll get the following structure:

```bash
my-app/
├── public/                  # Static files
│   └── index.html           # Main HTML template
├── src/
│   ├── components/         # Shared components
│   ├── pages/               # Page components
│   ├── services/            # Services with @Injectable
│   ├── styles/              # Global styles
│   ├── App.tsx              # Root component
│   └── index.tsx            # Application entry point
├── .gitignore
├── package.json
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Example Application Structure

Here's an example of how you might structure a typical Nexus application. This shows the internal structure of the `src` directory:

```bash
my-app/
├── src/
│   ├── app/
│   │   ├── app.module.ts      # Root module
│   │   └── app.routes.ts      # Application routes
│   ├── components/           # Shared components
│   ├── pages/                # Page components
│   ├── services/             # Services with @Injectable
│   └── styles/              # Global styles
├── public/                  # Static files
├── package.json
└── tsconfig.json
```

## Core Concepts

### Components

```typescript
import React from 'react';
import { Component } from '@nexus/core';

@Component({
  selector: 'app-user-profile',
  template: `
    <div>
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
    </div>
  `
})
export class UserProfile extends React.Component {
  user = {
    name: 'John Doe',
    email: 'john@example.com'
  };

  render() {
    return null; // Template is handled by the decorator
  }
}
```

### Services

```typescript
import { Injectable } from '@nexus/core';

@Injectable()
export class UserService {
  private users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
  ];

  getUsers() {
    return this.users;
  }

  getUser(id: number) {
    return this.users.find(user => user.id === id);
  }
}
```

### Modules

```typescript
import { Module } from '@nexus/core';
import { UserProfile } from './user-profile.component';
import { UserService } from './user.service';

@Module({
  declarations: [UserProfile],
  providers: [UserService]
})
export class UserModule {}
```

## CLI Commands

Generate different parts of your application:

```bash
# Generate a component
nexus generate component UserProfile

# Generate a service
nexus generate service UserService

# Generate a module
nexus generate module User

# Generate a view with routing
nexus generate view Dashboard --route=/dashboard
```

## Development

### Project Structure

```bash
nexus/
├── packages/            # Source code packages
│   ├── cli/            # Nexus CLI tool
│   └── core/           # Core framework
├── template/           # Project template for 'nexus new'
├── examples/           # Example applications
├── .eslintrc.json     # ESLint configuration
├── .prettierrc        # Prettier configuration
└── tsconfig.json      # TypeScript configuration
```

### Available Scripts

- `npm run build` - Build all packages
- `npm run dev` - Watch for changes and rebuild
- `npm test` - Run tests
- `npm run lint` - Lint the codebase
- `npm run format` - Format the code

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## Local Development

If you want to contribute to the framework itself:

```bash
# Clone the repository
git clone https://github.com/your-username/nexus.git
cd nexus

# Install dependencies
npm install

# Build all packages
npm run build

# Link the CLI for local development
cd packages/cli
npm link
```

Now you can use the locally linked CLI to test your changes:

```bash
# Create a test app
nexus new test-app
cd test-app
npm install
npm start
```

## Publishing to npm

If you're a maintainer, follow these steps to publish a new version:

1. Update the version in `package.json`
2. Update the changelog
3. Commit changes with `git commit -am "chore: release vX.Y.Z"`
4. Create a git tag: `git tag vX.Y.Z`
5. Push changes: `git push && git push --tags`
6. Publish to npm: `npm publish --access public`

## Documentation

For detailed documentation, please visit [Nexus Documentation](https://nexusjs.org/docs).

## Support

For support, please open an issue in our [GitHub repository](https://github.com/your-username/nexus).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
