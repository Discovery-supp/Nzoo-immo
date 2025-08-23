#!/usr/bin/env node

/**
 * Auto-generate documentation from CLI help output
 * This ensures docs stay in sync with actual CLI functionality
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// CLI command to run (relative to project root)
const CLI_COMMAND = 'node dist/src/cli.js';

/**
 * Execute CLI command and capture output
 */
function runCLI(args = '', options = {}) {
	try {
		const result = execSync(`${CLI_COMMAND} ${args}`, {
			cwd: rootDir,
			encoding: 'utf8',
			stderr: 'pipe',
			...options,
		});
		return { stdout: result, stderr: '', success: true };
	} catch (error) {
		return {
			stdout: error.stdout || '',
			stderr: error.stderr || '',
			success: false,
			code: error.status,
		};
	}
}

/**
 * Generate help documentation for a command
 */
function generateHelpDocs(command = '') {
	const helpArgs = command ? `${command} --help` : '--help';
	const result = runCLI(helpArgs);

	if (!result.success) {
		console.warn(`Warning: Could not generate help for "${command}": ${result.stderr}`);
		return `\`\`\`bash\n# Help not available for: ${command}\n\`\`\``;
	}

	return `\`\`\`bash\n$ resend-cli ${helpArgs}\n${result.stdout}\n\`\`\``;
}

/**
 * Generate usage examples
 */
function generateExamples() {
	const examples = [
		{
			title: 'Send a simple email',
			command:
				'email send --from="Acme <onboarding@resend.dev>" --to="delivered@resend.dev" --subject="Hello" --text="Hello World"',
			description: 'Send a basic text email',
		},
		{
			title: 'Send HTML email',
			command:
				'email send --from="Acme <onboarding@resend.dev>" --to="delivered@resend.dev" --subject="Welcome" --html="<h1>Welcome!</h1>"',
			description: 'Send an HTML email with formatted sender',
		},
		{
			title: 'Get JSON output',
			command:
				'email send --output json --from="Acme <onboarding@resend.dev>" --to="delivered@resend.dev" --subject="Test" --text="Hello" | jq ".data.id"',
			description: 'Send email and extract ID using jq for automation',
		},
	];

	let output = '';
	for (const example of examples) {
		output += `### ${example.title}\n\n`;
		output += `${example.description}\n\n`;
		output += `\`\`\`bash\n$ resend-cli ${example.command}\n\`\`\`\n\n`;
	}

	return output;
}

/**
 * Generate CLI commands section with brief descriptions
 */
function generateCLICommands() {
	let output = '';

	// Get main help to see all modules
	const mainHelp = runCLI('--help');
	if (mainHelp.success) {
		// Parse modules from main help
		const lines = mainHelp.stdout.split('\n');
		let inCommands = false;
		const modules = [];

		for (const line of lines) {
			if (line.includes('Commands:')) {
				inCommands = true;
				continue;
			}
			if (inCommands && line.trim() && !line.includes('help [command]')) {
				const match = line.match(/^\s*(\w+)\s+(.+)$/);
				if (match) {
					modules.push({
						name: match[1],
						description: match[2],
					});
				}
			}
		}

		// Command descriptions mapping
		const commandDescriptions = {
			email: 'Send and manage emails',
			apiKeys: 'Manage API keys',
			audiences: 'Manage audiences for newsletters and broadcasts',
			contacts: 'Manage contacts in your audiences',
			domains: 'Manage domains and DNS configuration',
			broadcasts: 'Manage newsletter broadcasts',
		};

		// Generate section for each module
		for (const module of modules) {
			output += `### ${module.name}\n\n`;
			output += `${commandDescriptions[module.name] || module.description}\n\n`;
			output += `${generateHelpDocs(module.name)}\n`;

			// For email module, add the send subcommand
			if (module.name === 'email') {
				output += `#### ${module.name} send\n\n`;
				output += `${generateHelpDocs(`${module.name} send`)}\n`;
			}
		}
	}

	return output;
}

/**
 * Generate README.md from template
 */
function generateReadme() {
	const templatePath = join(rootDir, 'templates', 'README.template.md');
	const readmePath = join(rootDir, 'README.md');

	try {
		const template = readFileSync(templatePath, 'utf8');
		const generatedContent = generateFromTemplate(template);
		writeFileSync(readmePath, generatedContent);
		console.log('✅ README.md generated from template with latest CLI help output');
	} catch (error) {
		console.error('❌ Error generating README.md:', error.message);
		process.exit(1);
	}
}

/**
 * Generate content from template with replacements
 */
function generateFromTemplate(template) {
	const replacements = {
		'{{CLI_HELP_MAIN}}': generateHelpDocs(),
		'{{CLI_COMMANDS}}': generateCLICommands(),
		'{{GENERATED_DATE}}': new Date().toISOString().split('T')[0],
	};

	let content = template;
	for (const [placeholder, replacement] of Object.entries(replacements)) {
		content = content.replace(new RegExp(placeholder, 'g'), replacement);
	}

	return content;
}

/**
 * Main execution
 */
function main() {
	console.log('🔄 Generating documentation from CLI help output...');

	// Ensure dist exists
	try {
		execSync('npm run build', { cwd: rootDir, stdio: 'pipe' });
	} catch {
		console.error('❌ Failed to build CLI before generating docs');
		process.exit(1);
	}

	generateReadme();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export { generateHelpDocs, generateExamples, generateCLICommands, generateFromTemplate };
