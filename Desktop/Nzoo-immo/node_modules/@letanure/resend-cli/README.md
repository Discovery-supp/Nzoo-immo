# Resend CLI

A command-line interface for the [Resend](https://resend.com) email API. Send emails, manage domains, and more via CLI commands or an interactive TUI.

> **Disclaimer**: This is an **unofficial** CLI tool built on top of the [Resend Node.js SDK](https://github.com/resendlabs/resend-node). It is not affiliated with or endorsed by Resend.

> **Warning**: Currently in active development. Some features may be incomplete or subject to change.

## TLDR

Get your API key at [resend.com/api-keys](https://resend.com/api-keys), export it, and run:

**CLI Mode:**
```bash
export RESEND_API_KEY="re_your_api_key_here"
npx @letanure/resend-cli email send \
  --from="Acme <onboarding@resend.dev>" \
  --to="delivered@resend.dev" \
  --subject="Hello from CLI" \
  --text="This email was sent from the command line!"
```

**TUI Mode:**
```bash
npx @letanure/resend-cli
```

## Requirements

Node.js 18+ and a Resend API key

## Get Your API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to [API Keys](https://resend.com/api-keys) 
3. Create a new API key
4. Copy the key (starts with `re_`)


## Table of Contents

- [Requirements](#requirements)
- [Get Your API Key](#get-your-api-key)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Commands](#commands)
- [TUI Mode](#tui-mode)
- [Output Formats](#output-formats)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [License](#license)
- [Contributing](#contributing)

## Installation

**Recommended:** Use with npx (no installation required)
```bash
npx @letanure/resend-cli --help
```

**For frequent use:** Install globally
```bash
npm install -g @letanure/resend-cli
resend-cli --help
```

**In projects:** Install locally
```bash
npm install @letanure/resend-cli
npx resend-cli --help
```

## Configuration

### Environment Variables

The CLI requires your Resend API key to be available as an environment variable.

#### Setup Methods

**Temporary (current session only):**
```bash
export RESEND_API_KEY="re_xxxxxxxxxxxx"
```

**Permanent (recommended):**
```bash
# Add to your shell profile
echo 'export RESEND_API_KEY="re_xxxxxxxxxxxx"' >> ~/.bashrc
source ~/.bashrc

# Or for zsh users
echo 'export RESEND_API_KEY="re_xxxxxxxxxxxx"' >> ~/.zshrc
source ~/.zshrc
```

**One-time usage:**
```bash
RESEND_API_KEY="re_xxxxxxxxxxxx" resend-cli email send --from="..." --to="..."
```

#### Getting Your API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to [API Keys](https://resend.com/api-keys)
3. Create a new API key
4. Copy the key (starts with `re_`)

## Usage

```bash
$ resend-cli --help
Usage: resend-cli [options] [command]

Resend CLI - Send emails, manage domains, and more

API Key: Set RESEND_API_KEY environment variable or use --api-key option

Options:
  -V, --version    output the version number
  -v               output the version number
  --dry-run        Enable dry-run mode for all operations (default: false)
  --api-key <key>  Resend API key (overrides RESEND_API_KEY environment
                   variable)
  -h, --help       display help for command

Commands:
  apikeys          Manage API keys
  audiences        Audience operations
  broadcasts       Broadcast operations
  contacts         Manage contacts in your audiences
  domains          Domain operations
  email            Email operations
  help [command]   display help for command

```

## Commands

### apikeys

Manage API keys

```bash
$ resend-cli apikeys --help
Usage: resend-cli apikeys [options] [command]

Manage API keys

Options:
  -h, --help        display help for command

Commands:
  create [options]  Create a new API key in Resend
  delete [options]  Delete an existing API key from Resend
  list [options]    List all API keys in Resend

```
### audiences

Manage audiences for newsletters and broadcasts

```bash
$ resend-cli audiences --help
Usage: resend-cli audiences [options] [command]

Audience operations

Options:
  -h, --help          display help for command

Commands:
  create [options]    Create a new audience via Resend API
  retrieve [options]  Retrieve an audience by ID from Resend API
  delete [options]    Delete an audience by ID from Resend API
  list [options]      List all audiences from Resend API

```
### broadcasts

Manage newsletter broadcasts

```bash
$ resend-cli broadcasts --help
Usage: resend-cli broadcasts [options] [command]

Broadcast operations

Options:
  -h, --help          display help for command

Commands:
  create|c [options]  Create a new broadcast to send to your audience
  delete|d [options]  Delete a broadcast (only draft or scheduled broadcasts)
  list|l              List all broadcasts
  retrieve [options]  Retrieve a broadcast by ID from Resend API
  send|s [options]    Send a broadcast to your audience
  update|u [options]  Update a broadcast to send to your audience

```
### contacts

Manage contacts in your audiences

```bash
$ resend-cli contacts --help
Usage: resend-cli contacts [options] [command]

Manage contacts in your audiences

Options:
  -h, --help          display help for command

Commands:
  create [options]    Create a contact in an audience via Resend API
  delete [options]    Delete a contact by ID or email from an audience in Resend
                      API
  list [options]      List all contacts in an audience
  retrieve [options]  Retrieve a contact by ID or email from an audience
  update|u [options]  Update an existing contact

```
### domains

Manage domains and DNS configuration

```bash
$ resend-cli domains --help
Usage: resend-cli domains [options] [command]

Domain operations

Options:
  -h, --help          display help for command

Commands:
  create [options]    Create a domain through the Resend Email API
  retrieve [options]  Retrieve a domain by ID from Resend API
  verify [options]    Verify a domain by ID using Resend API
  update [options]    Update a domain configuration using Resend API
  delete [options]    Delete a domain by ID using Resend API
  list [options]      List all domains from Resend API

```
### email

Send and manage emails

```bash
$ resend-cli email --help
Usage: resend-cli email [options] [command]

Email operations

Options:
  -h, --help          display help for command

Commands:
  send [options]      Send an email via Resend API
  retrieve [options]  Retrieve an email by ID from Resend API
  update [options]    Update a scheduled email via Resend API
  cancel [options]    Cancel a scheduled email via Resend API

```
#### email send

```bash
$ resend-cli email send --help
Usage: email send [OPTIONS]

Send an email via Resend API

OPTIONS:
  --from, -f <value>          Sender email address with optional name
  --to, -t <value>            Recipient email(s) - comma separated for multiple (max 50)
  --subject, -s <value>       Email subject line
  --bcc, -b <value>           Blind carbon copy recipients - comma separated
  --cc, -c <value>            Carbon copy recipients - comma separated for multiple
  --scheduled-at, -a <value>  Natural language (in 1 min) or ISO 8601 format
  --reply-to, -r <value>      Reply-to address(es) - comma separated
  --html, -h <value>          HTML version of the message
  --text, -x <value>          Plain text version
  --output <value>            Output format (text, json)
  --dry-run                   Validate and preview without sending
  --api-key <value>           Resend API key (overrides RESEND_API_KEY environment variable)

EXAMPLES:
  $ resend-cli email send --from="Acme <onboarding@resend.dev>" --to="user@example.com" --subject="Hello World" --html="<h1>it works!</h1>"
  $ resend-cli email send -f onboarding@resend.dev -t user@example.com -s "Hello World" --text="it works!"
  $ resend-cli email send --output json --from="..." --to="..." --subject="..." --html="..." | jq '.'
  $ EMAIL_ID=$(resend-cli email send --output json ... | jq -r '.data.id')
  $ RESEND_API_KEY="re_xxxxx" resend-cli email send --from="..." --to="..." --subject="..." --html="..."
  $ resend-cli email send --api-key="re_xxxxx" --from="..." --to="..." --subject="..." --html="..."

```


## TUI Mode

Launch the interactive interface for a guided experience:

```bash
$ resend-cli
```

**Features:**
- Interactive navigation with arrow keys and Enter
- Form-based input with validation
- Module organization by functionality
- Rich display with colors and layout

**Available Modules:**
- Email Operations - Send, retrieve, update, cancel emails
- Domain Management - List and manage domains
- Audience Management - Create, list, retrieve, delete audiences
- API Key Management - Create, list, delete API keys
- Contact Management - Create, list, update, delete contacts
- Broadcast Operations - List and manage broadcasts

**Navigation:**
- Arrow Keys / Enter: Navigate and select options
- Escape: Go back | Ctrl+C: Exit

**Dry-Run Mode:**
Both CLI and TUI modes support dry-run validation without sending:
- CLI: Add `--dry-run` flag to any command
- TUI: Start with `npx @letanure/resend-cli --dry-run`
- Warning banner appears when dry-run mode is active

## Output Formats

The CLI supports both human-readable and machine-readable output:

**Default (Human-readable):**
Rich formatted output with colors and layout

**JSON Output (for automation):**
Add `--output json` flag to any command for structured data:
```bash
$ resend-cli email send --output json --from="..." --to="..." --subject="..." --text="..."
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "to": "delivered@resend.dev",
    "from": "Acme <onboarding@resend.dev>",
    "subject": "Hello"
  }
}
```

## CI/CD Integration

Perfect for automated workflows:

```bash
# Extract email ID for further processing
EMAIL_ID=$(resend-cli email send --output json \
  --from="Acme <onboarding@resend.dev>" \
  --to="delivered@resend.dev" \
  --subject="Welcome to our app" \
  --html="<h1>Welcome!</h1>" | jq -r '.data.id')

echo "Sent email with ID: $EMAIL_ID"
```

## Troubleshooting

### Common Issues

**Missing API Key:**
```
✗ Configuration Error
  Missing required environment variable: RESEND_API_KEY
  Get your API key at https://resend.com/api-keys
```

**Input Validation:** All inputs are validated - invalid emails, missing required fields, etc. will show clear error messages

**Unknown Options:** Unknown command options will trigger helpful error messages with suggestions

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for development setup, architecture details, and contributing guidelines.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development setup.


![visitors](https://visitor-badge.laobi.icu/badge?page_id=letanure/resend-cli)
---

*README is auto-generated based on CLI commands and modules*
