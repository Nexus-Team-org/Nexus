import { Command } from 'commander';
import chalk from 'chalk';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { generateFromTemplate } from '../utils/template.js';

// Use Command type from Commander
type ICommand = Command;

interface GenerateOptions {
  path?: string;
  flat?: boolean;
  module?: string;
  route?: string;
  style?: 'css' | 'scss' | 'none';
}

function GenerateCommand(): ICommand {
  const command = new Command('generate')
    .description('Generate Nexus components, services, etc.')
    .alias('g');

  // Component command
  command
    .command('component <name>')
    .description('Generate a new component')
    .option('--path <path>', 'Path where the component should be created')
    .option('--flat', 'Create the component without a dedicated directory')
    .option('--module <module>', 'Add component to a module')
    .option('--style <style>', 'Style format (css, scss, none)', 'css')
    .action(async (name: string, options: GenerateOptions) => {
      await generateComponent(name, options);
    });

  // Service command
  command
    .command('service <name>')
    .description('Generate a new service')
    .option('--path <path>', 'Path where the service should be created')
    .option('--module <module>', 'Add service to a module')
    .action(async (name: string, options: GenerateOptions) => {
      await generateService(name, options);
    });

  // Module command
  command
    .command('module <name>')
    .description('Generate a new module')
    .option('--path <path>', 'Path where the module should be created')
    .option('--routing', 'Generate a routing module')
    .action(async (name: string, options: GenerateOptions) => {
      await generateModule(name, options);
    });

  // Page/View command
  command
    .command('view <name>')
    .description('Generate a new page/view component')
    .option('--path <path>', 'Path where the view should be created')
    .option('--route <route>', 'Route path for the view')
    .option('--module <module>', 'Add view to a module')
    .option('--style <style>', 'Style format (css, scss, none)', 'css')
    .action(async (name: string, options: GenerateOptions) => {
      await generateView(name, options);
    });

  // Generate command (alias for component)
  command
    .command('g <type> <name>')
    .description('Alias for generate command')
    .option('--path <path>', 'Path where the file should be created')
    .option('--flat', 'Create without a dedicated directory')
    .option('--module <module>', 'Add to a module')
    .option('--route <route>', 'Route path (for views)')
    .option('--style <style>', 'Style format (css, scss, none)', 'css')
    .action(async (type: string, name: string, options: GenerateOptions) => {
      switch (type.toLowerCase()) {
        case 'c':
        case 'component':
          await generateComponent(name, options);
          break;
        case 's':
        case 'service':
          await generateService(name, options);
          break;
        case 'm':
        case 'module':
          await generateModule(name, options);
          break;
        case 'v':
        case 'view':
          await generateView(name, options);
          break;
        default:
          console.error(chalk.red(`Unknown type: ${type}`));
          process.exit(1);
      }
    });

  return command;
}

async function generateComponent(name: string, options: GenerateOptions) {
  const basePath = options.path || 'src/app';
  const componentName = name.endsWith('Component') ? name : `${name}Component`;
  const componentDir = options.flat ? basePath : join(basePath, 'components', componentName);

  if (!existsSync(componentDir)) {
    mkdirSync(componentDir, { recursive: true });
  }

  const componentFile = join(componentDir, `${componentName}.tsx`);
  await generateFromTemplate('component', componentFile, {
    name: name.replace(/Component$/, ''),
    style: options.style || 'css',
  });

  // Generate styles if not 'none'
  if (options.style !== 'none') {
    const styleExt = options.style === 'scss' ? 'scss' : 'css';
    const styleFile = join(componentDir, `${componentName}.${styleExt}`);
    writeFileSync(styleFile, `/* ${componentName} styles */\n`, 'utf-8');
  }

  console.log(chalk.green(`✓ Created component: ${componentFile}`));

  // Add to module if specified
  if (options.module) {
    await addToModule(options.module, {
      type: 'declarations',
      name: componentName,
      importPath: `./components/${componentName}/${componentName}`,
    });
  }
}

async function generateService(name: string, options: GenerateOptions) {
  const basePath = options.path || 'src/app';
  const serviceName = name.endsWith('Service') ? name : `${name}Service`;
  const serviceDir = join(basePath, 'services');
  const serviceFile = join(serviceDir, `${serviceName}.ts`);

  if (!existsSync(serviceDir)) {
    mkdirSync(serviceDir, { recursive: true });
  }

  await generateFromTemplate('service', serviceFile, {
    name: name.replace(/Service$/, ''),
  });

  console.log(chalk.green(`✓ Created service: ${serviceFile}`));

  // Add to module if specified
  if (options.module) {
    await addToModule(options.module, {
      type: 'providers',
      name: serviceName,
      importPath: `./services/${serviceName}`,
    });
  }
}

async function generateModule(name: string, options: GenerateOptions) {
  const basePath = options.path || 'src/app';
  const moduleName = name.endsWith('Module') ? name : `${name}Module`;
  const moduleDir = join(basePath, 'features', moduleName);
  const moduleFile = join(moduleDir, `${moduleName}.ts`);

  if (!existsSync(moduleDir)) {
    mkdirSync(moduleDir, { recursive: true });
  }

  await generateFromTemplate('module', moduleFile, {
    name: name.replace(/Module$/, ''),
  });

  console.log(chalk.green(`✓ Created module: ${moduleFile}`));

  // Add to app module if this is a feature module
  if (name !== 'App') {
    await addToModule('App', {
      type: 'imports',
      name: moduleName,
      importPath: `./features/${moduleName}/${moduleName}`,
    });
  }
}

async function generateView(name: string, options: GenerateOptions) {
  const basePath = options.path || 'src/app';
  const viewName = name.endsWith('Page') ? name : `${name}Page`;
  const viewDir = options.flat ? basePath : join(basePath, 'pages', viewName);

  if (!existsSync(viewDir)) {
    mkdirSync(viewDir, { recursive: true });
  }

  const viewFile = join(viewDir, `${viewName}.tsx`);
  await generateFromTemplate('page', viewFile, {
    name: name.replace(/Page$/, ''),
    style: options.style || 'css',
  });

  // Generate styles if not 'none'
  if (options.style !== 'none') {
    const styleExt = options.style === 'scss' ? 'scss' : 'css';
    const styleFile = join(viewDir, `${viewName}.${styleExt}`);
    writeFileSync(styleFile, `/* ${viewName} styles */\n`, 'utf-8');
  }

  console.log(chalk.green(`✓ Created view: ${viewFile}`));

  // Add to module if specified
  if (options.module) {
    await addToModule(options.module, {
      type: 'declarations',
      name: viewName,
      importPath: `./pages/${viewName}/${viewName}`,
    });
  }

  // Add route if specified
  if (options.route) {
    if (!options.module) {
      console.log(
        chalk.yellow('Warning: Module name is required to add a route. Skipping route addition.')
      );
      return;
    }
    await addRoute({
      path: options.route,
      component: viewName,
      module: options.module,
    });
  }
}

async function addToModule(
  moduleName: string,
  item: { type: 'declarations' | 'providers' | 'imports'; name: string; importPath: string }
): Promise<void> {
  const modulePath = `src/app/${moduleName.endsWith('.ts') ? moduleName : `${moduleName}.module.ts`}`;

  if (!existsSync(modulePath)) {
    console.log(chalk.yellow(`Module file not found: ${modulePath}`));
    return;
  }

  // Parse the module file to update
  const moduleContent = readFileSync(modulePath, 'utf-8');

  // Simple regex to find the module decorator
  const moduleMatch = moduleContent.match(/@Module\(([\s\S]*?)\)/);
  if (!moduleMatch) {
    console.error(chalk.red(`Error: Could not find @Module decorator in ${modulePath}`));
    return;
  }

  // Parse the imports
  const importsMatch = moduleContent.match(/imports:\s*\[([\s\S]*?)\]/);
  const declarationsMatch = moduleContent.match(/declarations:\s*\[([\s\S]*?)\]/);
  const providersMatch = moduleContent.match(/providers:\s*\[([\s\S]*?)\]/);

  // Add the new import
  const importStatement = `import { ${item.name} } from '${item.importPath}'`;
  let updatedContent = moduleContent;

  if (!updatedContent.includes(importStatement)) {
    updatedContent = importStatement + '\n' + updatedContent;
  }

  // Add to the appropriate array based on item.type
  let arrayMatch: RegExpMatchArray | null = null;
  if (item.type === 'imports') {
    arrayMatch = importsMatch;
  } else if (item.type === 'declarations') {
    arrayMatch = declarationsMatch;
  } else if (item.type === 'providers') {
    arrayMatch = providersMatch;
  }

  if (!arrayMatch || !arrayMatch[1]) {
    console.error(chalk.red(`Error: Could not find ${item.type} array in module`));
    return;
  }

  const arrayContent = arrayMatch[1] ? arrayMatch[1].trim() : '';
  const newArrayContent = arrayContent
    ? `${arrayContent},
    ${item.name}`
    : `
    ${item.name}
  `;

  updatedContent = updatedContent.replace(
    arrayMatch[0],
    arrayMatch[0].replace(arrayMatch[1], newArrayContent)
  );

  writeFileSync(modulePath, updatedContent, 'utf-8');
  console.log(chalk.blue(`✓ Added ${item.name} to ${moduleName} ${item.type}`));
}

async function addRoute(route: { path: string; component: string; module: string }): Promise<void> {
  const routesFile = 'src/app/app.routes.ts';

  if (!existsSync(routesFile)) {
    console.log(chalk.yellow('Routes file not found. Creating a new one...'));
    // Create a basic routes file
    writeFileSync(
      routesFile,
      `import { RouteObject } from 'react-router-dom';

export const routes: RouteObject[] = [
  // Add your routes here
];\n`,
      'utf-8'
    );
  }

  let content = readFileSync(routesFile, 'utf-8');

  // Add import if not exists
  const importStatement = `import { ${route.component} } from './pages/${route.component}/${route.component}';\n`;
  if (!content.includes(importStatement)) {
    const lastImportIndex = content.lastIndexOf('import');
    const nextNewLine = content.indexOf('\n', lastImportIndex) + 1;
    content = content.slice(0, nextNewLine) + importStatement + content.slice(nextNewLine);
  }

  // Add route
  const routeConfig = `  {\n    path: '${route.path}',\n    element: <${route.component} />\n  },\n  // Add your routes here`;

  content = content.replace('// Add your routes here', routeConfig);
  writeFileSync(routesFile, content, 'utf-8');

  console.log(chalk.blue(`✓ Added route '${route.path}' for ${route.component}`));
}

// Export all the functions
export {
  GenerateCommand,
  generateComponent,
  generateService,
  generateModule,
  addToModule,
  addRoute,
  generateView,
};
