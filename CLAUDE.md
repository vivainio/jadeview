# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JadeView is a Visual Studio Code extension that converts HTML documents to Pug format for easier reading and analysis. It's designed to help developers understand complex HTML structures without being distracted by verbose tag soup.

## Key Commands

### Development Commands
- `npm run compile` - Compile TypeScript to JavaScript
- `npm run compile:watch` - Compile TypeScript in watch mode
- `npm run lint` - Run ESLint on the source code
- `npm run test` - Run tests (requires compilation and linting first)
- `npm run pretest` - Automatically runs compile and lint before tests
- `npm run vscode:prepublish` - Prepare extension for publishing (runs compile)

### Testing
- Use `npm run test` to run the full test suite
- Tests are located in `test/extension.test.ts`
- Uses Mocha test framework with VS Code test runner
- Tests verify extension presence, activation, and command availability

## Architecture

### Core Components

**Main Extension (`src/extension.ts`)**
- Entry point with `activate()` and `deactivate()` functions
- Registers two commands: `extension.jadeView` and `extension.unxml`
- Uses temporary file management for displaying converted content

**Key Dependencies**
- `html2jade` - Converts HTML to Pug format
- `tmp` - Creates temporary files for output display
- `vscode` - VS Code extension API

### Extension Structure

1. **Command Registration**: Two commands are registered in the activate function
   - `extension.jadeView` - Main HTML to Pug conversion
   - `extension.unxml` - External unxml tool integration

2. **Text Processing**: 
   - Supports both full document and selected text conversion
   - If text is selected, only selection is converted; otherwise entire document

3. **Output Display**:
   - Creates temporary `.pug` files for display
   - Uses VS Code's document opening API to show results in new editor tabs

### HTML to Pug Conversion Options

The extension uses these default options for html2jade:
- `noemptypipe: true` - Avoids empty pipe characters
- `bodyless: true` - Removes body wrapper
- `nspaces: 2` - Uses 2 spaces for indentation
- `noattrcomma: true` - No commas in attribute lists

### External Tool Integration

The `extension.unxml` command integrates with an external `unxml` application:
- Spawns child process to execute `unxml`
- Passes HTML content via stdin
- Displays formatted output in temporary file

## File Structure

```
src/
├── extension.ts          # Main extension logic
└── types/
    └── html2pug.d.ts     # Type definitions for html2jade module

test/
├── extension.test.ts     # Main test suite
├── index.ts             # Test index
└── suite/
    └── index.ts         # Test suite configuration
```

## Development Notes

- Target VS Code version: ^1.74.0
- Node.js version: >=18.0.0
- TypeScript compilation target: ES2020
- Uses CommonJS modules
- ESLint configuration includes TypeScript-specific rules

## Extension Manifest

The extension contributes:
- One command: "Jade View" (`extension.jadeView`) - converts HTML to Pug
- Activation on command execution
- No additional UI elements or settings

## Testing Strategy

Tests verify:
1. Extension presence in VS Code
2. Successful extension activation
3. Command availability in command palette

The test suite uses VS Code's built-in test framework with Mocha for assertions.