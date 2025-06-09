import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import { basename, join, resolve } from 'path';
import shell from 'shelljs';

export function NewCommand(): Command {
  const command = new Command('new')
    .description('Create a new Nexus application')
    .argument('<name>', 'Name of the application')
    .action((name: string) => {
      console.log(chalk.green(`Creating new Nexus application: ${name}`));

      // Resolve template and target paths
      const currentFile = new URL(import.meta.url).pathname;
      const currentDir = resolve(currentFile, '..');

      // Try multiple possible template locations
      const possibleTemplatePaths = [
        // For local development
        resolve(currentDir, '../../../template'),
        // For global installation
        resolve(currentDir, '../../../../lib/node_modules/@nexus-dev/cli/template'),
        // For global installation (alternative path)
        '/usr/local/lib/node_modules/@nexus-dev/cli/template',
        // For global installation (alternative path)
        '/usr/lib/node_modules/@nexus-dev/cli/template',
      ];

      // Find the first existing template path
      const templatePath = possibleTemplatePaths.find((path) => fs.existsSync(path));

      if (!templatePath) {
        console.error(chalk.red('Error: Could not find template directory. Tried:'));
        possibleTemplatePaths.forEach((path) => console.error(`  - ${path}`));
        process.exit(1);
      }

      const targetPath = name === '.' ? process.cwd() : resolve(process.cwd(), name);

      // Check if target directory exists and is empty
      if (fs.existsSync(targetPath)) {
        if (name === '.') {
          // For current directory, check if it's empty
          const files = fs.readdirSync(targetPath);
          if (files.length > 0) {
            console.error(chalk.red(`Error: Current directory is not empty`));
            process.exit(1);
          }
        } else {
          console.error(chalk.red(`Error: Directory ${name} already exists`));
          process.exit(1);
        }
      }

      console.log(chalk.blue('Copying template files...'));

      // Copy template files
      try {
        fs.copySync(templatePath, targetPath, {
          overwrite: false,
          errorOnExist: true,
          preserveTimestamps: true,
        });

        // Update package.json name
        const packageJsonPath = join(targetPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          packageJson.name = name === '.' ? basename(process.cwd()) : name;
          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        }
      } catch (error) {
        console.error(
          chalk.red(
            `Error copying template files: ${
              error instanceof Error ? error.message : String(error)
            }`
          )
        );
        process.exit(1);
      }

      // Change to the project directory
      process.chdir(targetPath);

      // Install dependencies
      console.log(chalk.blue('Installing dependencies...'));
      const installCmd = shell.exec('npm install');
      if (installCmd.code !== 0) {
        console.error(chalk.red('Error installing dependencies'));
        process.exit(1);
      }

      console.log(chalk.green(`\n✅ Success! Created ${name} at ${join(process.cwd(), name)}`));
      console.log('\nTo get started, run:');
      console.log(`  cd ${name}`);
      console.log('  npm start\n');
    });

  return command;
}
