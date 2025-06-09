import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'handlebars';
import * as changeCase from 'change-case';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Register helpers
handlebars.registerHelper('camelCase', (str: string) => changeCase.camelCase(str));
handlebars.registerHelper('kebabCase', (str: string) => changeCase.paramCase(str));
handlebars.registerHelper('pascalCase', (str: string) => changeCase.pascalCase(str));
handlebars.registerHelper('properCase', (str: string) => 
  str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
);

export async function generateFromTemplate(
  templateName: string,
  outputPath: string,
  data: Record<string, any> = {}
): Promise<void> {
  const templatePath = join(__dirname, '../../templates', `${templateName}.hbs`);
  const templateContent = readFileSync(templatePath, 'utf-8');
  const template = handlebars.compile(templateContent);
  const result = template({ ...data, name: data.name });
  
  // Ensure directory exists
  const dir = dirname(outputPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  
  writeFileSync(outputPath, result, 'utf-8');
}

export function toCamelCase(str: string): string {
  return changeCase.camelCase(str);
}

export function toPascalCase(str: string): string {
  return changeCase.pascalCase(str);
}

export function toKebabCase(str: string): string {
  return changeCase.paramCase(str);
}
