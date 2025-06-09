import 'reflect-metadata';

export const COMPONENT_METADATA_KEY = 'nexus:component';

export interface ComponentMetadata {
  /** CSS selector that identifies this component */
  selector: string;
  
  /** Inline template string */
  template?: string;
  
  /** Path to an external template file */
  templateUrl?: string;
  
  /** Array of styles (CSS) */
  styles?: string[];
  
  /** Paths to external style files */
  styleUrls?: string[];
  
  /** Whether the component should be standalone (not part of a module) */
  standalone?: boolean;
  
  /** Change detection strategy */
  changeDetection?: 'Default' | 'OnPush';
  
  /** Component encapsulation strategy */
  encapsulation?: 'Emulated' | 'Native' | 'None';
  
  /** Component animations */
  animations?: any[];
  
  /** Component view providers */
  viewProviders?: any[];
}

/**
 * Marks a class as a Nexus component and provides metadata about the component.
 * 
 * @example
 * ```typescript
 * @Component({
 *   selector: 'app-root',
 *   template: '<h1>Hello World</h1>'
 * })
 * export class AppComponent {}
 * ```
 */
export function Component(metadata: ComponentMetadata): ClassDecorator {
  return (target: Function) => {
    // Validate required metadata
    if (!metadata.selector) {
      throw new Error('Component decorator requires a selector');
    }
    
    // Ensure either template or templateUrl is provided
    if (!metadata.template && !metadata.templateUrl) {
      throw new Error('Component must have either template or templateUrl');
    }
    
    // Add default values
    const defaultMetadata: Partial<ComponentMetadata> = {
      standalone: false,
      changeDetection: 'Default',
      encapsulation: 'Emulated',
      styles: [],
      styleUrls: [],
      animations: [],
      viewProviders: []
    };
    
    // Merge with defaults
    const finalMetadata = { ...defaultMetadata, ...metadata };
    
    // Store the metadata
    Reflect.defineMetadata(COMPONENT_METADATA_KEY, finalMetadata, target);
  };
}

/**
 * Retrieves component metadata from a target class
 */
export function getComponentMetadata(target: any): ComponentMetadata | undefined {
  return Reflect.getMetadata(COMPONENT_METADATA_KEY, target);
}

/**
 * Checks if a target is a Nexus component
 */
export function isComponent(target: any): boolean {
  return Reflect.hasMetadata(COMPONENT_METADATA_KEY, target);
}
