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
- Tests are located in `src/test/extension.test.ts` (compiled to `out/test/`)
- Uses Mocha via `@vscode/test-cli` (config in `.vscode-test.mjs`)
- Tests verify extension presence, activation, and command availability

## Architecture

### Core Components

**Main Extension (`src/extension.ts`)**
- Entry point with `activate()` and `deactivate()` functions
- Registers four commands: `extension.jadeView`, `extension.unxml`,
  `extension.unxmlSelect`, and `extension.unxmlSpecial`
- Uses temporary file management for displaying converted content

**Key Dependencies**
- `html2pug` - Converts HTML to Pug format (modern replacement for html2jade)
- `tmp` - Creates temporary files for output display
- `vscode` - VS Code extension API

### Extension Structure

1. **Command Registration**: Four commands are registered in the activate function
   - `extension.jadeView` - Main HTML to Pug conversion (html2pug)
   - `extension.unxml` - Render via `unxml --auto`
   - `extension.unxmlSelect` - Render selected tag via `unxml --auto --select`
   - `extension.unxmlSpecial` - Render via `unxml --special`

2. **Text Processing**: 
   - Supports both full document and selected text conversion
   - If text is selected, only selection is converted; otherwise entire document

3. **Output Display**:
   - html2pug output goes to a temporary `.pug` file; unxml output to a
     temporary `.unxml` file (highlighted by the bundled grammar). One reusable
     temp file per extension, so repeated runs replace the same tab.
   - Uses VS Code's document opening API to show results in new editor tabs

### Bundled `.unxml` Language

The extension bundles syntax highlighting for unxml's Pug-like output, so no
separate language extension is needed:

- `syntaxes/unxml.tmLanguage.json` — TextMate grammar (scope `source.unxml`)
- `unxml-language-configuration.json` — comments/brackets config for the
  `unxml` language (`.unxml` files)

These are copied from `unxml-rs/editor/vscode/`; keep them in sync if the
grammar changes upstream.

### HTML to Pug Conversion Options

The extension uses these default options for html2pug:
- `tabs: false` - Uses spaces instead of tabs for indentation
- `fragment: true` - Treats input as HTML fragment (no html/head/body wrapper)

### External Tool Integration (unxml)

Three commands shell out to the external `unxml` application via a shared
`runUnxml(text, ext, args)` helper:

- `extension.unxml` ("Unxml: Render") — runs `unxml --auto`. `--auto` selects
  the formatter (plain XML / XSLT / XSD / Schematron) from the file extension and
  hides well-known namespaces (e.g. UBL `cbc:`/`cac:`).
- `extension.unxmlSelect` ("Unxml: Select Tag…") — prompts for a tag name and
  runs `unxml --auto --select <tag>`, rendering only the matching subtrees. A
  bare name matches the local name (prefix-insensitive); a prefixed name like
  `cac:InvoiceLine` matches the full name.
- `extension.unxmlSpecial` ("Unxml: Render (Special)") — runs `unxml --special`
  for the proprietary business-element transformation rules.

Key detail: the temp input file mirrors the **source document's extension**
(via `sourceExtension()`), so `--auto` mode detection works. Unsaved buffers map
their `languageId` to an extension, defaulting to `.xml`.

The `unxml` binary is always assumed to be on PATH.

Settings (`jadeview.*`):
- `unxmlExtraArgs` — extra args appended to every invocation, e.g.
  `["--hide-ns", "cbc,cac"]`.

## File Structure

```
src/
├── extension.ts          # Main extension logic
├── test/
│   └── extension.test.ts # Main test suite (run via @vscode/test-cli)
└── types/
    └── html2pug.d.ts     # Type definitions for html2pug module

syntaxes/
└── unxml.tmLanguage.json # Bundled grammar for the .unxml output language

unxml-language-configuration.json  # Language config for .unxml
.vscode-test.mjs                   # @vscode/test-cli config (test discovery)
eslint.config.mjs                  # ESLint flat config (ESLint 9)
```

## Development Notes

- Target VS Code version: ^1.74.0
- Node.js version: >=18.0.0
- TypeScript compilation target: ES2020
- Uses CommonJS modules
- ESLint configuration includes TypeScript-specific rules

## Extension Manifest

The extension contributes:
- Four commands: "Jade View", "Unxml: Render", "Unxml: Select Tag…", and
  "Unxml: Render (Special)"
- Activation is inferred from contributed commands (no explicit
  `activationEvents` — the deprecated `onCommand:` entries were removed)
- The `unxml` language + grammar for `.unxml` files
- Settings under `jadeview.*`: `unxmlExtraArgs`

## Testing Strategy

Tests verify:
1. Extension presence in VS Code
2. Successful extension activation
3. Command availability in command palette

The test suite uses VS Code's built-in test framework with Mocha for assertions.