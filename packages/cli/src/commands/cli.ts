import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import { basename, join, resolve } from 'path';

// Helper function to escape special regex characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
import shell from 'shelljs';

function findProjectRoot(currentPath: string): string | null {
  const root = require('path').parse(currentPath).root;
  let current = currentPath;
  
  while (current !== root) {
    const pagesPath = require('path').join(current, 'src', 'pages');
    if (require('fs').existsSync(pagesPath)) {
      return current;
    }
    current = require('path').dirname(current);
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
      const possibleTemplatePaths = [
        // Development
        resolve(currentDir, '../../../template'),
        // Global install (Windows)
        resolve(process.execPath, '../../node_modules/@nexus-dev/cli/template'),
        // Global install (Windows alternative)
        resolve(process.env.APPDATA || '', 'npm/node_modules/@nexus-dev/cli/template'),
        // Local install
        resolve(process.cwd(), 'node_modules/@nexus-dev/cli/template'),
        // Global install (Unix-like)
        '/usr/local/lib/node_modules/@nexus-dev/cli/template',
        '/usr/lib/node_modules/@nexus-dev/cli/template',
        // For npm/yarn workspaces - use current file's location to find node_modules
        resolve(currentDir, '..', '..', '..', 'node_modules', '@nexus-dev', 'cli', 'template'),
        // Another common global location on Windows
        'C:\\Program Files\\nodejs\\node_modules\\@nexus-dev\\cli\\template',
        // Fallback to the directory where the CLI is installed
        resolve(process.execPath, '..', '..', 'lib', 'node_modules', '@nexus-dev', 'cli', 'template')
      ].filter(Boolean);

      // Find the first existing template directory
      const templatePath = possibleTemplatePaths.find((path) => fs.existsSync(path));

      if (!templatePath) {
        console.error(chalk.red('Error: Could not find template directory. Tried these locations:'));
        possibleTemplatePaths.forEach((path) => console.error(chalk.red(`  - ${path}`)));
        process.exit(1);
      }

      // Check if we're in the project root or a subdirectory
      const projectRoot = findProjectRoot(process.cwd());
      
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