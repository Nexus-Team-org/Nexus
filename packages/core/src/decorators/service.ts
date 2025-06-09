import 'reflect-metadata';

export const INJECTABLE_METADATA_KEY = 'nexus:injectable';

export enum InjectScope {
  /** A new instance is created for each dependency */
  Transient = 'TRANSIENT',
  
  /** A single instance is created and shared across all dependencies (default) */
  Singleton = 'SINGLETON',
  
  /** A new instance is created for each request (e.g., HTTP request) */
  Request = 'REQUEST'
}

export interface InjectableOptions {
  /** The scope of the injectable (default: Singleton) */
  scope?: InjectScope;
  
  /** Whether to eagerly instantiate this injectable */
  eager?: boolean;
  
  /** Optional token to use when injecting this service */
  provide?: any;
  
  /** Dependencies that should be injected */
  deps?: any[];
}

/**
 * Marks a class as injectable, allowing it to be provided and injected.
 * 
 * @example
 * ```typescript
 * @Injectable()
 * class MyService {}
 * 
 * // With custom options
 * @Injectable({
 *   scope: InjectScope.Request,
 *   eager: true
 * })
 * class RequestScopedService {}
 * ```
 */
export function Injectable(options: InjectableOptions = {}): ClassDecorator {
  return (target: Function) => {
    const defaultOptions: InjectableOptions = {
      scope: InjectScope.Singleton,
      eager: false,
      provide: target,
      deps: []
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    // Store the metadata
    Reflect.defineMetadata(INJECTABLE_METADATA_KEY, finalOptions, target);
    
    // Store parameter types for injection
    const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
    if (paramTypes.length > 0) {
      Reflect.defineMetadata('nexus:deps', paramTypes, target);
    }
  };
}

/**
 * Retrieves the injectable options from a target class
 */
export function getInjectableOptions(target: any): InjectableOptions | undefined {
  return Reflect.getMetadata(INJECTABLE_METADATA_KEY, target);
}

/**
 * Checks if a target is marked as @Injectable
 */
export function isInjectable(target: any): boolean {
  return Reflect.hasMetadata(INJECTABLE_METADATA_KEY, target);
}

/**
 * Gets the dependencies for an injectable target
 */
export function getDependencies(target: any): any[] {
  return Reflect.getMetadata('nexus:deps', target) || [];
}

/**
 * Decorator to inject a specific token
 */
export function Inject(token: any): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    if (propertyKey === undefined) {
      // Constructor injection
      const existingDeps = Reflect.getMetadata('nexus:paramtypes', target) || [];
      existingDeps[parameterIndex] = token;
      Reflect.defineMetadata('nexus:paramtypes', existingDeps, target);
    } else {
      // Property injection
      const existingProperties = Reflect.getMetadata('nexus:properties', target.constructor) || [];
      existingProperties.push({
        key: propertyKey,
        token
      });
      Reflect.defineMetadata('nexus:properties', existingProperties, target.constructor);
    }
  };
}

/**
 * Decorator for optional dependencies
 */
export function Optional(): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingOptional = Reflect.getMetadata('nexus:optional', target) || [];
    existingOptional[parameterIndex] = true;
    Reflect.defineMetadata('nexus:optional', existingOptional, target);
  };
}

/**
 * Checks if a parameter or property is marked as optional
 * @param target The target class or instance
 * @param key The parameter index (for constructor params) or property key (for properties)
 */
export function isOptional(target: any, key: string | number): boolean {
  const optionalParams = Reflect.getMetadata('nexus:optional', target) || [];
  return !!optionalParams[key];
}
