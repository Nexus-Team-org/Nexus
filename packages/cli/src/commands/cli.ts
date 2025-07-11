import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import * as nodePath from 'path';
import * as nodeFs from 'fs';
import { basename, join, resolve } from 'path';

// Helper function to escape special regex characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
import shell from 'shelljs';

function findProjectRoot(currentPath: string): string | null {
  const path = nodePath;
  const fs = nodeFs;
  const root = path.parse(currentPath).root;
  let current = currentPath;

  while (current !== root) {
    // Case 1: we are at repo root – look for src/pages inside it
    const pagesInSrc = path.join(current, 'src', 'pages');
    if (fs.existsSync(pagesInSrc)) {
      return current;
    }

    // Case 2: we are inside the "src" directory – look for pages inside it
    // If so, the project root is the parent of the current directory
    if (path.basename(current) === 'src') {
      const pagesDirect = path.join(current, 'pages');
      if (fs.existsSync(pagesDirect)) {
        return path.dirname(current);
      }
    }

    current = path.dirname(current);
  }
  return null;
}

export function CreatePageCommand(): Command {
  const command = new Command('create-page')
    .description('Create a new page with associated files in existing directories')
    .option('--force', 'Force creation even if not in project root', false)
    .argument('<name>', 'Name of the page')
    .action(async (name: string, options: { force?: boolean }) => {
      // Display custom message
      console.log(chalk.cyanBright(`
      Creating a new page: ${name}
      `)
      );

      // Determine the current directory of this file (ESM import.meta.url)
      const currentFile = new URL(import.meta.url).pathname;
      // Handle Windows paths (remove leading slash if present and convert forward slashes)
      const normalizedPath = process.platform === 'win32' 
        ? currentFile.replace(/^\/|\/$/g, '').replace(/\//g, '\\')
        : currentFile;
      const currentDir = resolve(normalizedPath, '..');

      // List of potential template locations to try
      const packageRoot = resolve(currentDir, '..', '..'); // dist/commands -> dist -> package root

      const possibleTemplatePaths = [
        // 1. Inside dist folder when linked locally / compiled
        resolve(currentDir, '..', 'template'),            // dist/commands -> dist/template
        resolve(packageRoot, 'template'),                 // packageRoot/template (source copy)
        resolve(packageRoot, 'dist', 'template'),         // packageRoot/dist/template
        // 2. When installed globally via npm
        resolve(process.execPath, '../../node_modules/@okami-team/cli/dist/template'),
        resolve((process.env.APPDATA || ''), 'npm/node_modules/@okami-team/cli/dist/template'),
        resolve((process.env.APPDATA || ''), 'npm/node_modules/@okami-team/cli/template'),
        // 3. Local node_modules of the current project
        resolve(process.cwd(), 'node_modules/@okami-team/cli/dist/template'),
        resolve(process.cwd(), 'node_modules/@okami-team/cli/template'),
        // 4. Common global Unix paths
        '/usr/local/lib/node_modules/@okami-team/cli/dist/template',
        '/usr/lib/node_modules/@okami-team/cli/dist/template',
        // 5. Another common global location on Windows
        'C:\\Program Files\\nodejs\\node_modules\\@okami-team\\cli\\dist\\template'
      ].filter(Boolean);

      // Find the first existing template directory
      const templatePath = possibleTemplatePaths.find((path) => fs.existsSync(path));

      if (!templatePath) {
        console.error(chalk.red('Error: Could not find template directory. Tried these locations:'));
        possibleTemplatePaths.forEach((path) => console.error(chalk.red(`  - ${path}`)));
        process.exit(1);
      }

      // Check if we're in the project root or a subdirectory
      let projectRoot = findProjectRoot(process.cwd());

      // Fallback: if running inside "src" folder and pages exist, treat parent as project root
      if (!projectRoot) {
        const cwd = process.cwd();
        const path = nodePath;
        const fs = nodeFs;
        if (path.basename(cwd) === 'src') {
          const maybePages = path.join(cwd, 'pages');
          if (fs.existsSync(maybePages)) {
            projectRoot = path.dirname(cwd);
          }
        }
      }
      
      if (!projectRoot && !options.force) {
        console.error(chalk.red('❌ Error: Could not find project root directory.'));
        console.error(chalk.yellow('\nPlease run this command from your project root directory (where src/pages exists)'));
        console.error(chalk.yellow('or use --force to create the page in the current location.'));
        console.error(chalk.cyan('\nExample:'));
        console.error(chalk.cyan('  cd /path/to/your/project'));
        console.error(chalk.cyan('  nexus create-page my-page\n'));
        process.exit(1);
      }
      
      // Use the project root if found, otherwise use current directory with force flag
      const baseDir = projectRoot || process.cwd();
      
      // Resolve target directory path for the new page
      const pagesDir = resolve(baseDir, 'src', 'pages');
      const targetPath = join(pagesDir, name);

      // Check if target directory exists and handle errors
      if (fs.existsSync(targetPath)) {
        console.error(chalk.red(`Error: Page "${name}" already exists.`));
        process.exit(1);
      }

      console.log(chalk.blue(`📁 Creating new page "${name}"...`));

      try {
        // Create the new page directory
        fs.mkdirSync(targetPath);

        // Create associated files in existing directories
        const existingDirs = ['assets', 'components', 'features', 'hooks', 'lib', 'types'];
        existingDirs.forEach((dir) => {
          const dirPath = join(pagesDir, dir);
          if (fs.existsSync(dirPath)) {
            fs.mkdirSync(join(dirPath, name));
            const filePath = join(dirPath, name, 'index.tsx');
            fs.writeFileSync(filePath, `// ${name} file in ${dir}\n`, 'utf-8');
          }
        });

        // Create the main page file (index.tsx)
        const pageFilePath = join(targetPath, 'index.tsx');
        fs.writeFileSync(pageFilePath, `
import React from 'react';

const ${name}: React.FC = () => {
  return (
    <div>
      <h1>${name} Page</h1>
      <p>This is the ${name} page.</p>
    </div>
  );
};

export default ${name};
`, 'utf-8');

        // Update the routes file to include the new page
        const routesFilePath = resolve(baseDir, 'src', 'routes', 'index.tsx');
        if (fs.existsSync(routesFilePath)) {
          let routesContent = fs.readFileSync(routesFilePath, 'utf-8');
          
          // Check if the route already exists to avoid duplicates
          if (routesContent.includes(`path: "/${name.toLowerCase()}"`)) {
            console.log(chalk.yellow(`ℹ️  Route for "${name}" already exists`));
          } else {
            const newImport = `const ${name} = lazy(() => import("@/pages/${name}/index"));\n`;
            const newRoute = `  {
    path: "/${name.toLowerCase()}",
    component: ${name},
    isProtected: false,
  },\n`;

            // Add the new import if it doesn't exist
            if (!routesContent.includes(`const ${name} =`)) {
              // Add the import right after the existing imports
              const importsEnd = routesContent.indexOf('export const routes');
              if (importsEnd !== -1) {
                const beforeImports = routesContent.substring(0, importsEnd);
                const afterImports = routesContent.substring(importsEnd);
                routesContent = `${beforeImports}${newImport}${afterImports}`;
              } else {
                // Fallback: Add at the top of the file
                routesContent = `${newImport}\n${routesContent}`;
              }
            }

            // Find the routes array and get its content
            const routesArrayMatch = routesContent.match(/export const routes: routesTypes\[\] = \[(.*?)\];/s);
            
            if (routesArrayMatch) {
              const routesArrayContent = routesArrayMatch[1];
              const lastRouteMatch = routesArrayContent.match(/(\{[^}]*\})\s*(?:,|$)/gs)?.pop()?.trim();
              
              if (lastRouteMatch) {
                // Insert new route after the last route
                const newRoutesArrayContent = routesArrayContent.replace(
                  new RegExp(escapeRegExp(lastRouteMatch)),
                  `${lastRouteMatch}\n  ${newRoute.trim()}`
                );
                routesContent = routesContent.replace(
                  /(export const routes: routesTypes\[\] = \[)(.*?)(\];)/s,
                  `$1${newRoutesArrayContent}$3`
                );
              } else {
                // No routes found, add as first route
                routesContent = routesContent.replace(
                  /(export const routes: routesTypes\[\] = \[)\s*(\];)/,
                  `$1\n  ${newRoute.trim()}$2`
                );
              }
            } else {
              // Fallback if we can't find the routes array
              console.log(chalk.yellow('⚠️  Could not find routes array, adding at the end of file'));
              routesContent = routesContent.replace(
                /(\];?\s*$)/,
                `\n${newRoute}$1`
              );
            }

            fs.writeFileSync(routesFilePath, routesContent);
            console.log(chalk.green(`✅ Added route for "${name}"`));
          }
        }
      } catch (error) {
        console.error(chalk.red(`Error creating page: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }

      console.log(chalk.green(`✅ Success! Created page "${name}" at:`));
      console.log(chalk.yellow(`  ${targetPath}\n`));

      console.log('Next steps:');
      console.log(chalk.cyan(`  npm run dev\n`));
    });

  return command;
}