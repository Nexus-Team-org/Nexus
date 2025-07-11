import chalk from 'chalk';
import { Command } from 'commander';
import { toCamelCase, toPascalCase, toKebabCase } from '../utils/template.js';
import fs from 'fs-extra';
import path, { basename, join, resolve } from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find project root by looking for a src/components folder somewhere above CWD
function findProjectRoot(currentPath: string): string | null {
  const root = path.parse(currentPath).root;
  let current = currentPath;
  while (current !== root) {
    const componentsInSrc = path.join(current, 'src', 'components');
    if (fs.existsSync(componentsInSrc)) {
      return current;
    }
    // If we are inside "src" already, treat its parent as the root
    if (path.basename(current) === 'src') {
      const componentsDirect = path.join(current, 'components');
      if (fs.existsSync(componentsDirect)) {
        return path.dirname(current);
      }
    }
    current = path.dirname(current);
  }
  return null;
}

export function CreateComponentCommand(): Command {
  const command = new Command('create-component')
    .description('Scaffold a React component under src/components')
    .argument('<name>', 'Component name, e.g. button or Button')
    .action(async (name: string) => {
      const start = Date.now();
      const pascalName = toPascalCase(name);
      const kebabName = toKebabCase(name);

      console.log(chalk.cyanBright(`\nCreating component: ${pascalName}`));

      // Determine project root (or fallback to CWD)
      let projectRoot = findProjectRoot(process.cwd());
      if (!projectRoot) {
        console.log(chalk.yellow('⚠️  Could not locate project root (src/components). Using current directory.'));
        projectRoot = process.cwd();
      }

      const componentsDir = path.join(projectRoot, 'src', 'components');
      await fs.ensureDir(componentsDir);

      const targetDir = path.join(componentsDir, pascalName);
      if (await fs.pathExists(targetDir)) {
        console.error(chalk.red(`X Component directory already exists: ${targetDir}`));
        process.exit(1);
      }
      await fs.mkdirp(targetDir);

      // ===== generate files =====
      // Locate the templates directory (same logic as createRedux)
      const templatesDir = path.join(__dirname, '../../templates/components', kebabName);

      const files = [
        { template: 'index.tsx.ejs', output: `index.tsx` }
      ];

      const templateData = {
        name,
        camelCaseName: toCamelCase(name),
        pascalCaseName: pascalName,
        kebabCaseName: kebabName
      };

      for (const file of files) {
        const templatePath = path.join(templatesDir, file.template);
        const targetPath = path.join(targetDir, file.output);
        await createFileFromTemplate(templatePath, targetPath, templateData);
        console.log(chalk.green(`✓ Created ${basename(targetPath)}`));
      }

      const duration = ((Date.now() - start) / 1000).toFixed(2);
      console.log(chalk.green(`\n🎉 Component ${pascalName} ready in ${duration}s`));
      console.log('\nNext steps:');
      console.log(chalk.cyan(`  import { ${pascalName} } from '@/components/${pascalName}';`));
    });

  return command;
}

// Helper functions are imported from '../utils/template.js'


// Removed inline generation; now using external templates
/*
  return `import React from 'react';
import clsx from 'clsx';
import './${kebabName}.css';

export type ${pascalName}Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';

export interface ${pascalName}Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ${pascalName}Variant;
}

export const ${pascalName}: React.FC<${pascalName}Props> = ({
  variant = 'default',
  className,
  children,
  ...rest
}) => {
  return (
    <button
      {...rest}
      className={clsx('okami-btn', \`okami-btn--\${variant}\`, className)}
    >
      {children}
    </button>
  );
};

export default ${pascalName};
`;
}

*/

// ---------------- template helpers ----------------
async function createFileFromTemplate(templatePath: string, targetPath: string, data: any) {
  if (!await fs.pathExists(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  let content = await fs.readFile(templatePath, 'utf-8');
  content = processTemplate(content, data);
  await fs.writeFile(targetPath, content, 'utf-8');
}

function processTemplate(template: string, data: Record<string, any>): string {
  let result = template.replace(/<%=\s*(\w+)\s*%>/g, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : '';
  });

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

