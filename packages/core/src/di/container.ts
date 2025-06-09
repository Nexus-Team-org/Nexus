import { 
  isInjectable, 
  getInjectableOptions, 
  InjectScope, 
  getDependencies,
  isOptional,
  InjectableOptions
} from '../decorators/service';

type Constructor<T = any> = new (...args: any[]) => T;
type Token<T = any> = Constructor<T> | string | symbol;

interface Provider<T = any> {
  useClass?: Constructor<T>;
  useValue?: T;
  useFactory?: (...args: any[]) => T;
  deps?: any[];
  scope?: InjectScope;
  eager?: boolean;
}

interface InstanceWrapper<T = any> {
  instance: T | null;
  scope: InjectScope;
  isResolved: boolean;
  isEager: boolean;
  resolve: () => T;
}

export class Container {
  private static instance: Container;
  private instances = new Map<Token, any>();
  private providers = new Map<Token, Provider>();
  private requestScopedInstances = new Map<string, Map<Token, any>>();
  private requestId: string | null = null;

  private constructor() {}

  /**
   * Get the singleton instance of the container
   */
  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Register a provider in the container
   */
  public register<T>(token: Token<T>, provider: Provider<T> | Constructor<T>): void {
    if (typeof provider === 'function') {
      this.providers.set(token, { useClass: provider });
    } else {
      this.providers.set(token, provider);
    }
    
    // If the provider is marked as eager, resolve it immediately
    const options = this.getProviderOptions(token);
    if (options?.eager) {
      this.resolve(token);
    }
  }

  /**
   * Resolve a token from the container
   */
  /**
   * Resolve a token from the container
   * @throws Error if the token cannot be resolved
   */
  public resolve<T>(token: Token<T>): T {
    const provider = this.getProvider(token);
    if (!provider) {
      throw new Error(`No provider found for ${String(token)}`);
    }
    
    const result = this.tryResolve<T>(token);
    if (result === undefined) {
      throw new Error(`Cannot resolve ${String(token)}`);
    }
    
    return result;
  }

  /**
   * Try to resolve a token, returning undefined if not found
   */
  public tryResolve<T>(token: Token<T>): T | undefined {
    try {
      // Check if we have a request context
      const requestId = this.requestId || 'default';
      
      // Initialize request scope if needed
      if (!this.requestScopedInstances.has(requestId)) {
        this.requestScopedInstances.set(requestId, new Map());
      }
      
      const requestInstances = this.requestScopedInstances.get(requestId)!;
      
      // Check if we already have an instance for this token in the current scope
      if (requestInstances.has(token)) {
        return requestInstances.get(token) as T;
      }
      
      // Check if we have a singleton instance
      if (this.instances.has(token)) {
        return this.instances.get(token) as T;
      }
      
      // Get the provider configuration
      const provider = this.getProvider(token);
      
      // If no provider is found, return undefined
      if (!provider) {
        return undefined;
      }
      
      // At this point, we know provider is not undefined due to the previous check
      // but TypeScript needs a little help with the type narrowing
      const safeProvider = provider as NonNullable<typeof provider>;
      
      // Resolve based on provider type
      let instance: T;
      
      if ('useValue' in safeProvider) {
        instance = safeProvider.useValue as T;
      } else if ('useFactory' in safeProvider && safeProvider.useFactory) {
        const deps = safeProvider.deps?.map(dep => this.resolve(dep)) || [];
        instance = safeProvider.useFactory(...deps) as T;
      } else {
        // useClass or direct class
        const ctor = ('useClass' in safeProvider ? safeProvider.useClass : safeProvider) as Constructor<T>;
        
        // Check if the class is injectable
        if (!isInjectable(ctor)) {
          throw new Error(`Cannot resolve ${ctor.name}: Not marked as @Injectable()`);
        }
        
        // Get the injectable options
        const options = getInjectableOptions(ctor) || {};
        const scope = options.scope || InjectScope.Singleton;
        
        // Get dependencies
        const paramTypes = getDependencies(ctor) || [];
        const optionalParams = Reflect.getMetadata('nexus:optional', ctor) || [];
        
        // Resolve all dependencies first
        const args: any[] = [];
        for (let i = 0; i < paramTypes.length; i++) {
          const param = paramTypes[i];
          const isOptional = optionalParams[i];
          
          try {
            const resolved = this.resolve(param);
            args[i] = resolved;
          } catch (error) {
            if (!isOptional) {
              throw error;
            }
            args[i] = undefined;
          }
        }
        
        // Create the instance with resolved dependencies
        instance = new ctor(...args);
        
        // Handle property injection
        const properties: Array<{key: string, token: any}> = Reflect.getMetadata('nexus:properties', ctor) || [];
        for (const { key, token: propToken } of properties) {
          const isPropOptional = isOptional(ctor, key);
          
          try {
            const resolved = this.tryResolve(propToken);
            if (resolved === undefined) {
              if (!isPropOptional) {
                throw new Error(`Cannot resolve property ${String(key)} of ${ctor.name}`);
              }
            } else {
              (instance as any)[key] = resolved;
            }
          } catch (error) {
            if (!isPropOptional) {
              throw error;
            }
          }
        }
        
        // Store the instance based on scope
        if (scope === InjectScope.Singleton) {
          this.instances.set(token, instance);
        } else if (scope === InjectScope.Request) {
          requestInstances.set(token, instance);
        }
        // Transient scoped instances are not cached
      }
      
      // Store the instance in the appropriate scope
      if (provider) {
        const providerScope = 'scope' in provider ? provider.scope : undefined;
        if (providerScope !== InjectScope.Transient) {
          requestInstances.set(token, instance);
        }
      }
      
      return instance;
    } catch (error) {
      console.error(`Error resolving ${String(token)}:`, error);
      return undefined;
    }
  }

  /**
   * Get a value from the container (alias for resolve)
   */
  public get<T>(token: Token<T>): T | undefined {
    return this.tryResolve(token);
  }
  
  public has(token: Token): boolean {
    try {
      const result = this.tryResolve(token);
      return result !== undefined;
    } catch {
      return false;
    }
  }

  /**
   * Start a new request context
   */
  public startRequestContext(requestId: string): void {
    this.requestId = requestId;
  }

  /**
   * End the current request context and clean up
   */
  public endRequestContext(): void {
    if (this.requestId) {
      this.requestScopedInstances.delete(this.requestId);
      this.requestId = null;
    }
  }

  /**
   * Clear all instances and providers from the container
   */
  public clear(): void {
    this.instances.clear();
    this.providers.clear();
    this.requestScopedInstances.clear();
    this.requestId = null;
  }

  private getProvider<T>(token: Token<T>): Provider<T> | undefined {
    // First check for exact match
    if (this.providers.has(token)) {
      return this.providers.get(token);
    }
    
    // If token is a string or symbol, try to find a class with that name
    if (typeof token === 'string' || typeof token === 'symbol') {
      for (const [key, provider] of this.providers.entries()) {
        if (typeof key === 'function' && key.name === token) {
          return provider;
        }
      }
    }
    
    return undefined;
  }

  private getProviderOptions(token: Token): InjectableOptions | undefined {
    const provider = this.getProvider(token);
    if (!provider) return undefined;
    
    if ('useClass' in provider) {
      return getInjectableOptions(provider.useClass!);
    }
    
    return undefined;
  }
}
