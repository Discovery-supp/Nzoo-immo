#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { generateCompletions } = require('./completion-generator.cjs');

/**
 * Detect if we should install completions
 * Skip in CI, Docker, or non-interactive environments
 */
function shouldInstallCompletion() {
	// Skip in CI environments
	if (process.env.CI || process.env.CONTINUOUS_INTEGRATION) {
		return false;
	}

	// Skip if no TTY (non-interactive)
	if (!process.stdout.isTTY) {
		return false;
	}

	// Skip in Docker containers
	if (fs.existsSync('/.dockerenv')) {
		return false;
	}

	// Skip if user explicitly opts out
	if (process.env.SKIP_COMPLETION || process.env.SKIP_AUTOCOMPLETE) {
		return false;
	}

	return true;
}

/**
 * Detect the user's shell
 */
function detectShell() {
	const shell = process.env.SHELL || '';

	if (shell.includes('zsh')) {
		return 'zsh';
	}
	if (shell.includes('bash')) {
		return 'bash';
	}
	if (os.platform() === 'win32') {
		return 'powershell';
	}

	// Default to bash on Unix systems
	return 'bash';
}


/**
 * Try to install completion script to appropriate location
 */
async function installCompletion(shell, completionScript) {
	const homeDir = os.homedir();
	
	// Define standard completion paths for each shell
	const standardPaths = {
		bash: [
			path.join(homeDir, '.local/share/bash-completion/completions'),
			'/usr/local/etc/bash_completion.d',
			'/etc/bash_completion.d',
		],
		zsh: [
			path.join(homeDir, '.oh-my-zsh/custom/completions'),
			path.join(homeDir, '.zsh/completions'),
			path.join(homeDir, '.zsh/completion'),
			'/usr/local/share/zsh/site-functions',
			'/usr/share/zsh/site-functions',
		],
		powershell: [
			path.join(homeDir, 'Documents/WindowsPowerShell'),
			path.join(homeDir, 'Documents/PowerShell'),
		]
	};

	const fileName = shell === 'bash' ? 'resend' : 
	                shell === 'zsh' ? '_resend' : 
	                'resend-completion.ps1';

	// Try each standard path
	for (const completionDir of standardPaths[shell] || []) {
		try {
			// Check if directory exists or can be created
			if (!fs.existsSync(completionDir)) {
				// Only try to create user directories (not system ones)
				if (completionDir.startsWith(homeDir)) {
					fs.mkdirSync(completionDir, { recursive: true });
				} else {
					continue; // Skip system directories we can't create
				}
			}

			const filePath = path.join(completionDir, fileName);
			fs.writeFileSync(filePath, completionScript);

			console.log(`✅ ${shell} completion installed to: ${filePath}`);
			return true;
		} catch (_error) {
			// Continue to next path
			continue;
		}
	}

	// Fallback to shell rc file
	try {
		const rcFile = shell === 'bash' ? path.join(homeDir, '.bashrc') :
		               shell === 'zsh' ? path.join(homeDir, '.zshrc') :
		               path.join(homeDir, 'Documents/WindowsPowerShell/Microsoft.PowerShell_profile.ps1');
		
		const completionLine = `\n# resend-cli completion\n${completionScript}\n`;
		fs.appendFileSync(rcFile, completionLine);
		console.log(`✅ ${shell} completion added to: ${rcFile}`);
		return true;
	} catch (_error) {
		return false;
	}
}

/**
 * Show manual installation instructions
 */
function showManualInstructions(completions) {
	console.log(`
📋 Manual completion setup:

For Bash:
  Add to ~/.bashrc:
${completions.bash
	.split('\n')
	.map((line) => `  ${line}`)
	.join('\n')}

For Zsh:
  Add to ~/.zshrc:
${completions.zsh
	.split('\n')
	.map((line) => `  ${line}`)
	.join('\n')}

For PowerShell:
  Add to your PowerShell profile:
${completions.powershell
	.split('\n')
	.map((line) => `  ${line}`)
	.join('\n')}
  `);
}

/**
 * Main installation function
 */
async function main() {
	try {
		// Check if we should install
		if (!shouldInstallCompletion()) {
			console.log('ℹ️  Skipping completion installation (non-interactive environment)');
			return;
		}

		// Generate completions for all shells
		const completions = await generateCompletions();

		// Detect user's shell
		const primaryShell = detectShell();

		// Try to install for primary shell
		const installed = await installCompletion(primaryShell, completions[primaryShell]);

		if (installed) {
			console.log(`\n🎉 resend-cli completion installed for ${primaryShell}!`);
			console.log(`💡 Restart your terminal or run: source ~/.${primaryShell}rc`);
		} else {
			console.log('ℹ️  Could not auto-install completion, here are manual instructions:');
			showManualInstructions(completions);
		}
	} catch (error) {
		// Silent fail - don't break npm install
		console.log('ℹ️  Completion setup skipped due to error');
		if (process.env.DEBUG) {
			console.error('Debug:', error);
		}
	}
}

// Only run if called directly (not required as module)
if (require.main === module) {
	main();
}

module.exports = { main, shouldInstallCompletion, detectShell };
