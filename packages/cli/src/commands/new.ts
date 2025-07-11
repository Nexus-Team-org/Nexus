import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import { basename, join, resolve } from 'path';
import shell from 'shelljs';

export function NewCommand(): Command {
  const command = new Command('new')
    .description('Create a new Okami application')
    .argument('<name>', 'Name of the application')
    .action(async (name: string) => {
      // Display custom Okami logo
      console.log(
        chalk.cyanBright(`
 ██████╗ ██╗  ██╗ █████╗ ███╗   ███╗██╗
██╔═══██╗██║ ██╔╝██╔══██╗████╗ ████║██║
██║   ██║█████╔╝ ███████║██╔████╔██║██║
██║   ██║██╔═██╗ ██╔══██║██║╚██╔╝██║██║
╚██████╔╝██║  ██╗██║  ██║██║ ╚═╝ ██║██║
 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝TM
`)
      );

      console.log(chalk.green(`Creating new Okami application: ${name}\n`));

      // Determine the current directory of this file (ESM import.meta.url)
      const currentFile = new URL(import.meta.url).pathname;
      // Handle Windows paths (remove leading slash if present and convert forward slashes)
      const normalizedPath = process.platform === 'win32' 
        ? currentFile.replace(/^\/|\/$/g, '').replace(/\//g, '\\')
        : currentFile;
      const currentDir = resolve(normalizedPath, '..');

      // Get the global node_modules path
      const globalNodeModules = resolve(process.execPath, '../../node_modules');
      const localNodeModules = resolve(process.cwd(), 'node_modules');

      // List of potential template locations to try
      const possibleTemplatePaths = [
        // Development
        resolve(currentDir, '../../../template'),
        // Global install (Windows)
        resolve(process.execPath, '../../node_modules/@okami-team/cli/template'),
        // Global install (Windows alternative)
        resolve(process.env.APPDATA || '', 'npm/node_modules/@okami-team/cli/template'),
        // Local install
        resolve(process.cwd(), 'node_modules/@okami-team/cli/template'),
        // Global install (Unix-like)
        '/usr/local/lib/node_modules/@okami-team/cli/template',
        '/usr/lib/node_modules/@okami-team/cli/template',
        // For npm/yarn workspaces - use current file's location to find node_modules
        resolve(currentDir, '..', '..', '..', 'node_modules', '@okami-team', 'cli', 'template'),
        // Another common global location on Windows
        'C:\\Program Files\\nodejs\\node_modules\\@okami-team\\cli\\template',
        // Another common global location on Unix-like
        resolve(process.execPath, '..', '..', 'lib', 'node_modules', '@okami-team', 'cli', 'template')
      ].filter(Boolean);

      // Find the first existing template directory
      const templatePath = possibleTemplatePaths.find((path) => fs.existsSync(path));

      if (!templatePath) {
        console.error(chalk.red('Error: Could not find template directory. Tried these locations:'));
        possibleTemplatePaths.forEach((path) => console.error(chalk.red(`  - ${path}`)));
        process.exit(1);
      }

      // Resolve target directory path based on input name
      const targetPath = name === '.' ? process.cwd() : resolve(process.cwd(), name);

      // Check if target directory exists and handle errors
      if (fs.existsSync(targetPath)) {
        if (name === '.') {
          const files = fs.readdirSync(targetPath);
          if (files.length > 0) {
            console.error(chalk.red('Error: Current directory is not empty.'));
            process.exit(1);
          }
        } else {
          console.error(chalk.red(`Error: Directory "${name}" already exists.`));
          process.exit(1);
        }
      }

      console.log(chalk.blue('📁 Copying template files...'));

      try {
        fs.copySync(templatePath, targetPath, {
          overwrite: false,
          errorOnExist: true,
          preserveTimestamps: true,
        });

        // Update package.json with new project name
        const packageJsonPath = join(targetPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          packageJson.name = name === '.' ? basename(process.cwd()) : name;
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        }
      } catch (error) {
        console.error(chalk.red(`Error copying template files: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }

      // Change working directory to the new project folder
      process.chdir(targetPath);

      console.log(chalk.blue('📦 Installing dependencies (this may take a moment)...'));
      const installResult = shell.exec('npm install');

      if (installResult.code !== 0) {
        console.error(chalk.red('Error: Failed to install dependencies.'));
        process.exit(1);
      }

      console.log(chalk.green(`\n✅ Success! Created Okami app "${name}" at:`));
      console.log(chalk.yellow(`  ${targetPath}\n`));

      console.log('Next steps:');
      console.log(chalk.cyan(`  cd ${name === '.' ? '.' : name}`));
      console.log(chalk.cyan('  npm run dev\n'));
    });

  return command;
}
