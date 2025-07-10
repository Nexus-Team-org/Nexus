import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import { dirname as pathDirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

interface CreateReduxOptions {
  withApi: boolean;
  verbose?: boolean;
}

interface TemplateData {
  name: string;
  camelCaseName: string;
  pascalCaseName: string;
  kebabCaseName: string;
  withApi: boolean;
}

const logger = {
  info: (message: string) => console.log(chalk.cyanBright(`ℹ ${message}`)),
  success: (message: string) => console.log(chalk.green(`✓ ${message}`)),
  warn: (message: string) => console.warn(chalk.yellow(`⚠ ${message}`)),
  error: (message: string) => console.error(chalk.red(`✗ ${message}`)),
  debug: (message: string, data?: any) => {
    if (process.env.DEBUG) {
      console.log(chalk.gray(`[DEBUG] ${message}`), data ? JSON.stringify(data, null, 2) : '');
    }
  }
};

class ReduxGeneratorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReduxGeneratorError';
  }
}

async function createReduxSlice(name: string, options: CreateReduxOptions) {
  const startTime = Date.now();
  
  try {
    logger.info(`Creating new Redux slice: ${chalk.bold(name)}`);
    
    // Validate name
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
      throw new ReduxGeneratorError('Slice name must be alphanumeric and start with a letter');
    }
    
    const templateData: TemplateData = {
      name,
      camelCaseName: toCamelCase(name),
      pascalCaseName: toPascalCase(name),
      kebabCaseName: toKebabCase(name),
      withApi: options.withApi
    };
    
    logger.debug('Template data:', templateData);
    
    // Get the current working directory
    const cwd = process.cwd();
    logger.debug('Current working directory:', cwd);
    
    // Find source directory
    const sourceDir = await findSourceDirectory(cwd);
    logger.debug('Using source directory:', sourceDir);
    
    // Setup paths
    const featuresDir = join(cwd, sourceDir, 'features');
    const targetDir = join(featuresDir, templateData.kebabCaseName);
    
    // Ensure features directory exists
    await fs.ensureDir(featuresDir);
    
    // Check if target directory already exists
    if (await fs.pathExists(targetDir)) {
      throw new ReduxGeneratorError(`Directory ${targetDir} already exists`);
    }
    
    // Get template directory
    const templatesDir = await findTemplatesDirectory();
    logger.debug('Using templates directory:', templatesDir);
    
    // Create target directory
    await fs.mkdir(targetDir, { recursive: true });
    logger.success(`Created directory: ${targetDir}`);
    
    // Define files to create
    const files = [
      { template: 'slice.ts.ejs', output: `${templateData.pascalCaseName}Slice.ts` },
      { template: 'types.ts.ejs', output: 'types.ts' },
      { template: 'selectors.ts.ejs', output: 'selectors.ts' },
      { template: 'index.ts.ejs', output: 'index.ts' },
      ...(options.withApi ? [{ template: 'api.ts.ejs', output: 'api.ts' }] : [])
    ];
    
    // Create files
    for (const file of files) {
      await createFileFromTemplate(
        join(templatesDir, file.template),
        join(targetDir, file.output),
        templateData
      );
      logger.success(`Created ${file.output}`);
    }
    
    // Update store configuration
    await updateStoreConfig(cwd, sourceDir, templateData);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.success(`\n🎉 Successfully created Redux slice in ${duration}s`);
    
    // Show next steps
    console.log('\n' + chalk.bold('Next steps:'));
    console.log(`1. Your Redux slice is ready in: ${targetDir}`);
    
    if (options.withApi) {
      console.log(chalk.yellow('2. Make sure to configure your API base URL in the generated api.ts file'));
    }
    
  } catch (error: any) {
    logger.error(`Failed to create Redux slice: ${error.message}`);
    if (error instanceof ReduxGeneratorError) {
      process.exit(1);
    }
    throw error;
  }
}

export function CreateReduxCommand(): Command {
  return new Command('create-redux')
    .description('Create a new Redux slice with associated files')
    .argument('<name>', 'Name of the Redux slice (e.g., user, auth, products)')
    .option('--with-api', 'Include API integration with RTK Query', false)
    .option('--verbose', 'Enable verbose logging', false)
    .action(async (name: string, options: CreateReduxOptions) => {
      try {
        if (options.verbose) {
          process.env.DEBUG = 'true';
        }
        
        await createReduxSlice(name, options);
      } catch (error: any) {
        logger.error(error.message);
        if (options.verbose) {
          logger.error('\nStack trace:');
          console.error(error.stack);
        }
        process.exit(1);
      }
    });
}

async function createFileFromTemplate(templatePath: string, targetPath: string, data: any) {
  if (!await fs.pathExists(templatePath)) {
    throw new ReduxGeneratorError(`Template not found: ${templatePath}`);
  }
  
  try {
    let content = await fs.readFile(templatePath, 'utf-8');
    
    // Process template variables
    content = processTemplate(content, data);
    
    // Write the file
    await fs.writeFile(targetPath, content);
    logger.debug(`Created file: ${targetPath}`);
  } catch (error: any) {
    throw new ReduxGeneratorError(`Failed to create file ${targetPath}: ${error.message}`);
  }
}

function processTemplate(template: string, data: Record<string, any>): string {
  // Replace simple variables: <%= name %>
  let result = template.replace(/<%=\s*(\w+)\s*%>/g, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : '';
  });
  
  // Handle helper functions: <%= camelCase(name) %>
  result = result.replace(/<%=\s*(\w+)\(([^)]+)\)\s*%>/g, (_, fn, arg) => {
    const key = arg.trim();
    const value = data[key];
    
    if (value === undefined) return '';
    
    switch (fn) {
      case 'camelCase':
        return toCamelCase(String(value));
      case 'pascalCase':
        return toPascalCase(String(value));
      case 'kebabCase':
        return toKebabCase(String(value));
      default:
        return '';
    }
  });
  
  return result;
}

async function findSourceDirectory(cwd: string): Promise<string> {
  const possibleDirs = ['src', 'app', 'source'];
  
  for (const dir of possibleDirs) {
    if (await fs.pathExists(join(cwd, dir))) {
      return dir;
    }
  }
  
  // Default to 'src' if no common directory is found
  return 'src';
}

async function findTemplatesDirectory(): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = pathDirname(__filename);
  
  const possibleDirs = [
    // Development
    join(__dirname, '../../templates/redux'),
    join(__dirname, '../templates/redux'),
    // Installed
    join(__dirname, '../node_modules/@nexus-dev/cli/dist/templates/redux'),
    join(process.cwd(), 'node_modules/@nexus-dev/cli/dist/templates/redux')
  ];
  
  for (const dir of possibleDirs) {
    if (await fs.pathExists(dir)) {
      return dir;
    }
  }
  
  throw new ReduxGeneratorError(
    'Could not find templates directory. Tried:\n' + possibleDirs.join('\n')
  );
}

async function updateStoreConfig(cwd: string, sourceDir: string, data: TemplateData): Promise<void> {
  const possibleStoreFiles = [
    join(cwd, sourceDir, 'app', 'store.ts'),
    join(cwd, sourceDir, 'store', 'index.ts'),
    join(cwd, sourceDir, 'store.ts'),
    join(cwd, sourceDir, 'redux', 'store.ts'),
  ];
  
  for (const storeFile of possibleStoreFiles) {
    if (await fs.pathExists(storeFile)) {
      try {
        let content = await fs.readFile(storeFile, 'utf-8');
        let updated = false;
        
        // Add import if not exists
        const importPath = `../features/${data.kebabCaseName}/${data.pascalCaseName}Slice`;
        const importRegex = new RegExp(`import.*from\s*['"]${importPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
        
        if (!importRegex.test(content)) {
          const importStatement = `import ${data.camelCaseName}Reducer from '${importPath}';`;
          content = content.replace(
            /(import\s+.*\s+from\s+['"].*['"];?\n)/,
            `$1${importStatement}\n`
          );
          updated = true;
        }
        
        // Add to reducer object
        const reducerPattern = /reducer:\s*\{([^}]*)\}/s;
        const reducerMatch = content.match(reducerPattern);
        
        if (reducerMatch) {
          const [fullMatch, reducers] = reducerMatch;
          const reducerName = data.camelCaseName;
          
          if (!new RegExp(`${reducerName}:`).test(reducers)) {
            const updatedReducers = reducers.trim() 
              ? `${reducers.trim()}\n    ${reducerName}: ${reducerName}Reducer,`
              : `\n    ${reducerName}: ${reducerName}Reducer,`;
            
            content = content.replace(
              reducerPattern,
              `reducer: {${updatedReducers}\n  }`
            );
            updated = true;
          }
        }
        
        // Update RootState type
        if (content.includes('type RootState')) {
          const rootStateMatch = content.match(/type\s+RootState\s*=\s*([^;]+);/);
          
          if (rootStateMatch) {
            const rootStateType = rootStateMatch[1].trim();
            const stateType = `${data.pascalCaseName}State`;
            
            if (!rootStateType.includes(stateType)) {
              const updatedRootState = rootStateType.startsWith('ReturnType')
                ? `ReturnType<typeof store.getState> & { ${data.camelCaseName}: ${stateType} }`
                : rootStateType.replace(/\}$/, `\n  ${data.camelCaseName}: ${stateType};\n}`);
              
              content = content.replace(rootStateMatch[0], `type RootState = ${updatedRootState};`);
              
              // Add import for the state type
              const stateTypeImport = `import type { ${stateType} } from './features/${data.kebabCaseName}/types';`;
              content = content.replace(
                /(import\s+.*\s+from\s+['"].*['"];?\n)/,
                `$1${stateTypeImport}\n`
              );
              
              updated = true;
            }
          }
        }
        
        if (updated) {
          await fs.writeFile(storeFile, content);
          logger.success(`Updated store configuration in ${basename(storeFile)}`);
        }
        
        return;
      } catch (error) {
        logger.warn(`Failed to update store configuration: ${error.message}`);
      }
    }
  }
  
  logger.warn('Could not find store configuration to update. Please add the reducer manually.');
}

function toCamelCase(str: string): string {
  return str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toLowerCase());
}

function toPascalCase(str: string): string {
  return str.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}
