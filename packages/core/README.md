# Nexus React Framework - Core

## Dependency Injection (DI) Container

The Nexus React Framework provides a powerful dependency injection container that helps manage dependencies and promote loose coupling in your application.

## Table of Contents
- [Overview](#overview)
- [Basic Usage](#basic-usage)
- [Decorators](#decorators)
  - [@Injectable](#injectable)
  - [@Inject](#inject)
  - [@Optional](#optional)
- [Scopes](#scopes)
- [Provider Types](#provider-types)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)

## Overview

The DI container is responsible for:
- Managing the lifecycle of services and components
- Resolving dependencies automatically
- Supporting different scopes (Singleton, Transient, Request)
- Enabling property and constructor injection
- Supporting circular dependencies

## Basic Usage

### 1. Define Injectable Services

```typescript
import { Injectable } from '@nexus/core';

@Injectable()
export class UserService {
  getUsers() {
    return ['Alice', 'Bob', 'Charlie'];
  }
}
```

### 2. Register Services

```typescript
import { Container } from '@nexus/core/di';
import { UserService } from './user.service';

// Register a service
Container.getInstance().register(UserService, { useClass: UserService });

// Or use the shorthand
Container.getInstance().register(UserService, UserService);
```

### 3. Resolve Dependencies

```typescript
// Get an instance of UserService
const userService = Container.getInstance().resolve(UserService);
const users = userService.getUsers();
```

## Decorators

### @Injectable

Marks a class as available to the DI container for injection.

```typescript
@Injectable({
  scope: 'SINGLETON', // or 'TRANSIENT', 'REQUEST'
  eager: false, // if true, instantiated when registered
  provide: MyService, // optional token to provide
  deps: [OtherService] // explicit dependencies
})
export class MyService {}
```

### @Inject

Specifies which token should be injected for a parameter or property.

```typescript
class MyService {
  constructor(
    @Inject('CONFIG') private config: any,
    @Inject(OtherService) private otherService: OtherService
  ) {}
}
```

### @Optional

Marks a dependency as optional. The container will inject `undefined` if the dependency is not found.

```typescript
class MyService {
  constructor(
    @Optional() private logger?: Logger
  ) {}
}
```

## Scopes

The container supports three scopes:

1. **Singleton** (default): A single instance is created and shared
2. **Transient**: A new instance is created each time
3. **Request**: A new instance is created for each request context

## Provider Types

### 1. Class Provider

```typescript
{
  provide: MyService,
  useClass: MyServiceImpl,
  scope: 'SINGLETON',
  deps: [OtherService]
}
```

### 2. Value Provider

```typescript
{
  provide: 'API_KEY',
  useValue: '12345-abcde'
}
```

### 3. Factory Provider

```typescript
{
  provide: 'CONFIG',
  useFactory: (http) => fetchConfig(http),
  deps: [HttpService]
}
```

## API Reference

### Container

- `getInstance()`: Get the singleton container instance
- `register<T>(token: Token<T>, provider: Provider<T> | Constructor<T>)`: Register a provider
- `resolve<T>(token: Token<T>): T`: Resolve a dependency (throws if not found)
- `tryResolve<T>(token: Token<T>): T | undefined`: Try to resolve a dependency
- `has(token: Token<any>): boolean`: Check if a token is registered
- `startRequestContext(requestId?: string): void`: Start a new request context
- `endRequestContext(requestId?: string): void`: End a request context

## Best Practices

1. **Prefer constructor injection** over property injection for required dependencies
2. **Use interfaces** for better testability and loose coupling
3. **Keep constructors simple** - they should only assign dependencies to properties
4. **Avoid service location** - prefer dependency injection over `Container.getInstance().resolve()`
5. **Use request scope** for request-specific data
6. **Be careful with circular dependencies** - they can be resolved but may indicate design issues
7. **Use @Optional()** for truly optional dependencies

## Example

```typescript
import { Injectable, Inject, Optional } from '@nexus/core';
import { Container } from '@nexus/core/di';

// Service with dependencies
@Injectable()
class Logger {
  log(message: string) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}

@Injectable()
class UserService {
  constructor(
    @Optional() private logger?: Logger
  ) {}

  getUsers() {
    this.logger?.log('Fetching users');
    return ['Alice', 'Bob'];
  }
}

// Register services
const container = Container.getInstance();
container.register(Logger, Logger);
container.register(UserService, UserService);

// Resolve and use
const userService = container.resolve(UserService);
console.log(userService.getUsers());
```

## License

MIT
