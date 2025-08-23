#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

/**
 * Extract command structure from your CLI modules
 */
function extractCommandStructure() {
	// Import module configs from shared config file
	const { moduleConfigs } = require('../dist/src/config/modules.js');

	const modules = {};
	const modulesPath = path.join(__dirname, '../src/modules');

	for (const config of moduleConfigs) {
		const modulePath = path.join(modulesPath, config.folder);
		
		modules[config.name] = {
			description: config.description,
			commands: extractModuleCommands(modulePath),
		};
	}

	return modules;
}


/**
 * Extract commands from a module
 */
function extractModuleCommands(modulePath) {
	const commands = {};

	// Look for command directories (send, retrieve, etc.)
	const entries = fs.readdirSync(modulePath, { withFileTypes: true }).filter((dirent) => dirent.isDirectory());

	for (const entry of entries) {
		const commandPath = path.join(modulePath, entry.name);
		const fieldsPath = path.join(commandPath, 'fields.ts');

		if (fs.existsSync(fieldsPath)) {
			commands[entry.name] = {
				description: getCommandDescription(commandPath),
				options: extractCommandOptions(fieldsPath),
			};
		}
	}

	return commands;
}

/**
 * Get command description from CLI file
 */
function getCommandDescription(commandPath) {
	try {
		const cliPath = path.join(commandPath, 'cli.ts');
		const content = fs.readFileSync(cliPath, 'utf8');

		// Extract description from .description() call
		const match = content.match(/\.description\(['"]([^'"]+)['"]/);
		return match ? match[1] : '';
	} catch {
		return '';
	}
}

/**
 * Extract command options from fields.ts
 */
function extractCommandOptions(fieldsPath) {
	try {
		const content = fs.readFileSync(fieldsPath, 'utf8');
		const options = [];

		// Extract field names from sendFieldNames or similar arrays
		const fieldNamesMatch = content.match(/const\s+\w+FieldNames\s*=\s*\[([^\]]+)\]/);
		if (fieldNamesMatch) {
			const fieldNames = fieldNamesMatch[1]
				.split(',')
				.map((name) => name.trim().replace(/['"]/g, ''))
				.filter((name) => name);

			// For each field name, we'll create basic options
			for (const fieldName of fieldNames) {
				options.push({
					name: fieldName,
					flag: `--${fieldName.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
					description: `${fieldName} option`,
				});
			}
		}

		return options;
	} catch {
		return [];
	}
}

/**
 * Generate bash completion script
 */
function generateBashCompletion(commands) {
	const commandList = Object.keys(commands).join(' ');

	let script = `#!/bin/bash

# resend-cli completion
_resend_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    
    # Root command completions
    if [[ \${COMP_CWORD} -eq 1 ]]; then
        opts="${commandList} --help --version --dry-run"
        COMPREPLY=( \$(compgen -W "\${opts}" -- \${cur}) )
        return 0
    fi
    
    # Module-specific completions
    local module="\${COMP_WORDS[1]}"
    case \${module} in
`;

	for (const [moduleName, moduleData] of Object.entries(commands)) {
		script += `        ${moduleName})\n`;
		script += `            if [[ \${COMP_CWORD} -eq 2 ]]; then\n`;
		script += `                opts="${Object.keys(moduleData.commands).join(' ')}"\n`;
		script += `                COMPREPLY=( \$(compgen -W "\${opts}" -- \${cur}) )\n`;
		script += `            else\n`;
		script += `                # Command-specific options\n`;
		script += `                local command="\${COMP_WORDS[2]}"\n`;
		script += `                case \${command} in\n`;

		for (const [commandName, commandData] of Object.entries(moduleData.commands)) {
			const flags = commandData.options.map((opt) => opt.flag).join(' ');
			script += `                    ${commandName})\n`;
			script += `                        opts="${flags}"\n`;
			script += `                        COMPREPLY=( \$(compgen -W "\${opts}" -- \${cur}) )\n`;
			script += `                        ;;\n`;
		}

		script += `                esac\n`;
		script += `            fi\n`;
		script += `            ;;\n`;
	}

	script += `    esac
}

complete -F _resend_completion resend-cli
complete -F _resend_completion resend
`;

	return script;
}

/**
 * Generate zsh completion script
 */
function generateZshCompletion(commands) {
	let script = `#compdef resend-cli resend

# resend-cli completion
_resend_completion() {
    local context state line
    
    _arguments -C \\
        '(--help -h)'{--help,-h}'[Show help]' \\
        '(--version -V)'{--version,-V}'[Show version]' \\
        '--dry-run[Enable dry-run mode]' \\
        '1: :_resend_modules' \\
        '2: :_resend_commands' \\
        '*: :_resend_options'
}

_resend_modules() {
    local -a modules
    modules=(
`;

	for (const [moduleName, moduleData] of Object.entries(commands)) {
		script += `        '${moduleName}:${moduleData.description}'\n`;
	}

	script += `    )
    _describe 'modules' modules
}

_resend_commands() {
    local module=\${words[2]}
    local -a commands
    
    case \${module} in
`;

	for (const [moduleName, moduleData] of Object.entries(commands)) {
		script += `        ${moduleName})\n`;
		script += `            commands=(\n`;
		for (const [commandName, commandData] of Object.entries(moduleData.commands)) {
			script += `                '${commandName}:${commandData.description}'\n`;
		}
		script += `            )\n`;
		script += `            ;;\n`;
	}

	script += `    esac
    
    _describe 'commands' commands
}

_resend_options() {
    local module=\${words[2]}
    local command=\${words[3]}
    local -a options
    
    case \${module} in
`;

	for (const [moduleName, moduleData] of Object.entries(commands)) {
		script += `        ${moduleName})\n`;
		script += `            case \${command} in\n`;
		for (const [commandName, commandData] of Object.entries(moduleData.commands)) {
			script += `                ${commandName})\n`;
			script += `                    options=(\n`;
			for (const option of commandData.options) {
				script += `                        '${option.flag}[${option.description}]'\n`;
			}
			script += `                    )\n`;
			script += `                    ;;\n`;
		}
		script += `            esac\n`;
		script += `            ;;\n`;
	}

	script += `    esac
    
    _arguments \${options}
}

_resend_completion
`;

	return script;
}

/**
 * Generate PowerShell completion script
 */
function generatePowerShellCompletion(commands) {
	let script = `# resend-cli completion
Register-ArgumentCompleter -Native -CommandName resend-cli -ScriptBlock {
    param($commandName, $wordToComplete, $cursorPosition)
    
    $command = $wordToComplete.Split(' ')
    $commandCount = $command.Length
    
    # Root command completions
    if ($commandCount -eq 1) {
        $completions = @(
            @{ CompletionText = '--help'; ToolTip = 'Show help' }
            @{ CompletionText = '--version'; ToolTip = 'Show version' }
            @{ CompletionText = '--dry-run'; ToolTip = 'Enable dry-run mode' }
`;

	for (const [moduleName, moduleData] of Object.entries(commands)) {
		script += `            @{ CompletionText = '${moduleName}'; ToolTip = '${moduleData.description}' }\n`;
	}

	script += `        )
        return $completions | Where-Object { $_.CompletionText -like "$wordToComplete*" }
    }
    
    # Module-specific completions
    $module = $command[0]
    switch ($module) {
`;

	for (const [moduleName, moduleData] of Object.entries(commands)) {
		script += `        '${moduleName}' {\n`;
		script += `            if ($commandCount -eq 2) {\n`;
		script += `                $completions = @(\n`;
		for (const [commandName, commandData] of Object.entries(moduleData.commands)) {
			script += `                    @{ CompletionText = '${commandName}'; ToolTip = '${commandData.description}' }\n`;
		}
		script += `                )\n`;
		script += `                return $completions | Where-Object { $_.CompletionText -like "$wordToComplete*" }\n`;
		script += `            } else {\n`;
		script += `                $subCommand = $command[1]\n`;
		script += `                switch ($subCommand) {\n`;

		for (const [commandName, commandData] of Object.entries(moduleData.commands)) {
			script += `                    '${commandName}' {\n`;
			script += `                        $completions = @(\n`;
			for (const option of commandData.options) {
				script += `                            @{ CompletionText = '${option.flag}'; ToolTip = '${option.description}' }\n`;
			}
			script += `                        )\n`;
			script += `                        return $completions | Where-Object { $_.CompletionText -like "$wordToComplete*" }\n`;
			script += `                    }\n`;
		}

		script += `                }\n`;
		script += `            }\n`;
		script += `        }\n`;
	}

	script += `    }
}

# Also register for 'resend' alias
Register-ArgumentCompleter -Native -CommandName resend -ScriptBlock {
    param($commandName, $wordToComplete, $cursorPosition)
    
    # Call the same completion logic
    & $MyInvocation.MyCommand.ScriptBlock 'resend-cli' $wordToComplete $cursorPosition
}
`;

	return script;
}

/**
 * Main function to generate all completion scripts
 */
async function generateCompletions() {
	const commands = extractCommandStructure();

	return {
		bash: generateBashCompletion(commands),
		zsh: generateZshCompletion(commands),
		powershell: generatePowerShellCompletion(commands),
	};
}

module.exports = { generateCompletions, extractCommandStructure };
