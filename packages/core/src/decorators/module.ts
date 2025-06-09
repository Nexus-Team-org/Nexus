import 'reflect-metadata';
import { isComponent } from './component';
import { isInjectable } from './service';

export const MODULE_METADATA_KEY = 'nexus:module';

export interface ModuleMetadata {
  /** Other modules whose exported components/pipes/directives are available to this module */
  imports?: any[];
  
  /** Components, directives, and pipes that belong to this module */
  declarations?: any[];
  
  /** Services that will be available for injection in this module */
  providers?: any[];
  
  /** Components/directives/pipes that should be accessible to other modules */
  exports?: any[];
  
  /** Bootstrap component that should be bootstrapped when this module is bootstrapped */
  bootstrap?: any;
  
  /** Whether this module is a singleton (only one instance will be created) */
  singleton?: boolean;
  
  /** Whether this module should be eagerly loaded */
  eager?: boolean;
}

/**
 * Marks a class as a Nexus module and provides metadata about the module.
 * 
 * @example
 * ```typescript
 * @Module({
 *   declarations: [MyComponent],
 *   providers: [MyService],
 *   imports: [OtherModule],
 *   exports: [MyComponent]
 * })
 * export class MyModule {}
 * ```
 */
export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target: Function) => {
    // Validate metadata
    if (!metadata) {
      throw new Error('Module decorator requires metadata');
    }
    
    // Set default values
    const defaultMetadata: Partial<ModuleMetadata> = {
      imports: [],
      declarations: [],
      providers: [],
      exports: [],
      singleton: false,
      eager: false
    };
    
    // Merge with defaults
    const finalMetadata = { ...defaultMetadata, ...metadata };
    
    // Validate declarations
    if (finalMetadata.declarations) {
      finalMetadata.declarations.forEach(declaration => {
        if (!isComponent(declaration) && !isDirective(declaration) && !isPipe(declaration)) {
          console.warn(`Declaration ${declaration.name} is not a component, directive, or pipe`);
        }
      });
    }
    
    // Store the metadata
    Reflect.defineMetadata(MODULE_METADATA_KEY, finalMetadata, target);
  };
}

/**
 * Retrieves module metadata from a target class
 */
export function getModuleMetadata(target: any): ModuleMetadata | undefined {
  return Reflect.getMetadata(MODULE_METADATA_KEY, target);
}

/**
 * Checks if a target is a Nexus module
 */
export function isModule(target: any): boolean {
  return Reflect.hasMetadata(MODULE_METADATA_KEY, target);
}

// Stub implementations - these would be defined in their respective files
function isDirective(target: any): boolean {
  // Implementation would check for @Directive decorator
  return false;
}

function isPipe(target: any): boolean {
  // Implementation would check for @Pipe decorator
  return false;
}
