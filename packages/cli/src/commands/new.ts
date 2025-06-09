import { Command } from 'commander';
import chalk from 'chalk';
import shell from 'shelljs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function NewCommand(): Command {
  const command = new Command('new')
    .description('Create a new Nexus application')
    .argument('<name>', 'Name of the application')
    .action((name: string) => {
      console.log(chalk.green(`Creating new Nexus application: ${name}`));
      
      // Create project directory
      if (shell.test('-d', name)) {
        console.error(chalk.red(`Error: Directory ${name} already exists`));
        process.exit(1);
      }

      shell.mkdir('-p', name);
      
      // Initialize package.json
      shell.cd(name);
      shell.exec('npm init -y');
      
      // Install dependencies
      console.log(chalk.blue('Installing dependencies...'));
      shell.exec('npm install react react-dom typescript @types/react @types/react-dom @nexus/core --save');
      shell.exec('npm install @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint typescript --save-dev');
      
      // Create basic project structure
      shell.mkdir('-p', 'src/{components,pages,services,styles}');
      
      // Create tsconfig.json
      const tsconfig = {
        compilerOptions: {
          target: 'es5',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          noFallthroughCasesInSwitch: true,
          module: 'esnext',
          moduleResolution: 'node',
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          experimentalDecorators: true,
          emitDecoratorMetadata: true
        },
        include: ['src']
      };
      
      shell.ShellString(JSON.stringify(tsconfig, null, 2)).to('tsconfig.json');
      
      // Create basic files
      shell.ShellString('<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <title>Nexus App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>').to('public/index.html');
      
      shell.ShellString('import React from "react";\nimport ReactDOM from "react-dom";\nimport { App } from "./App";\n\nReactDOM.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n  document.getElementById("root")\n);').to('src/index.tsx');
      
      shell.ShellString('import React from "react";\nimport { Component } from "@nexus/core";\n\n@Component({\n  selector: "app-root",\n  template: `\n    <div>\n      <h1>Welcome to Nexus</h1>\n      <p>Start editing to see some magic happen!</p>\n    </div>\n  `\n})\nexport class App extends React.Component {\n  render() {\n    return null; // Template is handled by the decorator\n  }\n}').to('src/App.tsx');
      
      console.log(chalk.green(`\n✅ Success! Created ${name} at ${join(process.cwd(), name)}`));
      console.log('\nTo get started, run:');
      console.log(`  cd ${name}`);
      console.log('  npm start\n');
    });
  
  return command;
}
