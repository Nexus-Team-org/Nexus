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

#### Option 1: Global Installation (Recommended)

Install the Nexus CLI globally to use it from anywhere:

```bash
npm install -g @nexus-dev/cli

# Verify installation
nexus --version

# Create a new application
nexus new my-app
cd my-app
npm install
npm run dev
```

#### Option 2: Using npx (No Installation)

If you prefer not to install globally, you can use npx:

```bash
# Create a new application without global installation
npx @nexus-dev/cli new my-app
cd my-app
npm install
npm run dev
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
  `,
})
export class UserProfile extends React.Component {
  user = {
    name: 'John Doe',
    email: 'john@example.com',
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
    { id: 2, name: 'Jane Smith' },
  ];

  getUsers() {
    return this.users;
  }

  getUser(id: number) {
    return this.users.find((user) => user.id === id);
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
  providers: [UserService],
})
export class UserModule {}
```

## CLI Commands

Generate different parts of your application:

```bash
# Generate a component
nexus g component UserProfile

# Generate a service
nexus g service UserService

# Generate a module
nexus g module User

# Generate a view with routing
nexus g view Dashboard --route=/dashboard

# Alternative full command
nexus generate view Dashboard --route=/dashboard
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
