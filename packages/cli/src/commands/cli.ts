import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import { basename, join, resolve } from 'path';
import shell from 'shelljs';

export function CreatePageCommand(): Command {
  const command = new Command('create-page')
    .description('Create a new page with associated files in existing directories')
    .argument('<name>', 'Name of the page')
    .action(async (name: string) => {
      // Display custom message
      console.log(chalk.cyanBright(`
Creating a new page: ${name}
`)
      );

      // Determine the current directory of this file (ESM import.meta.url)
      const currentFile = new URL(import.meta.url).pathname;
      const currentDir = resolve(currentFile, '..');

      // List of potential template locations to try
      const possibleTemplatePaths = [
        resolve(currentDir, '../../../template'),
        resolve(currentDir, '../../../../lib/node_modules/@nexus-dev/cli/template'),
        '/usr/local/lib/node_modules/@nexus-dev/cli/template',
        '/usr/lib/node_modules/@nexus-dev/cli/template',
      ];

      // Find the first existing template directory
      const templatePath = possibleTemplatePaths.find((path) => fs.existsSync(path));

      if (!templatePath) {
        console.error(chalk.red('Error: Could not find template directory. Tried these locations:'));
        possibleTemplatePaths.forEach((path) => console.error(chalk.red(`  - ${path}`)));
        process.exit(1);
      }

      // Resolve target directory path for the new page
      const pagesDir = resolve(process.cwd(), 'src', 'pages');
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
            const filePath = join(dirPath, name, `${name}.tsx`);
            fs.writeFileSync(filePath, `// ${name} file in ${dir}\n`, 'utf-8');
          }
        });

        // Create the main page file
        const pageFilePath = join(targetPath, `${name}.tsx`);
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
        const routesFilePath = resolve(process.cwd(), 'src', 'routes', 'index.tsx');
        if (fs.existsSync(routesFilePath)) {
          const routesContent = fs.readFileSync(routesFilePath, 'utf-8');
          const newImport = `import ${name} from '@/pages/${name}/${name}';\n`;
          const newRoute = `
  {
    path: "/${name.toLowerCase()}",
    component: ${name},
    isProtected: false,
  },`;

          const updatedContent = routesContent.replace(
            /export const routes: routesTypes\[\] = \[\n/,
            `export const routes: routesTypes[] = [\n${newImport}${newRoute}`
          );

          fs.writeFileSync(routesFilePath, updatedContent);
        }
      } catch (error) {
        console.error(chalk.red(`Error creating page: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }

      console.log(chalk.green(`✅ Success! Created page "${name}" at:`));
      console.log(chalk.yellow(`  ${targetPath}\n`));

      console.log('Next steps:');
      console.log(chalk.cyan(`  npm start\n`));
    });

  return command;
}