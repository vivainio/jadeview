# JadeView

A Visual Studio Code extension for reading dense markup without the tag soup. It
converts the current document into a compact, indentation-based view in a new
temporary tab:

- **HTML → [Pug](https://pugjs.org/)** for HTML documents.
- **XML / XSLT / XSD / Schematron → unxml** for XML-family documents, with
  well-known namespaces (e.g. UBL `cbc:` / `cac:`) hidden for readability.

If text is selected when you run a command, only the selection is converted;
otherwise the whole document is.

## Installation

Download the latest `.vsix` from the
[Releases page](https://github.com/vivainio/jadeview/releases/latest), then in
VS Code run **Extensions: Install from VSIX…** from the Command Palette (or
`code --install-extension jadeview-<version>.vsix`).

The **Unxml** commands additionally require the external `unxml` binary on your
`PATH` — install it with `uv tool install unxml-rs` (see
[Commands](#commands)). The **Jade View** command needs no extra tools.

## Commands

Run these from the Command Palette (`Ctrl/Cmd+Shift+P`):

- **Jade View** — convert the HTML document (or selection) to Pug.
- **Unxml: Render** — render via `unxml --auto`; the formatter
  (XML / XSLT / XSD / Schematron) is chosen from the file extension.
- **Unxml: Select Tag…** — prompt for an element name and render only the
  matching subtrees (`unxml --auto --select <tag>`). A bare name like
  `InvoiceLine` matches the local name regardless of prefix; a prefixed name
  like `cac:InvoiceLine` matches the full name.
- **Unxml: Render (Special)** — render via `unxml --special` (proprietary
  business-element transformation rules).

The `unxml` commands shell out to the external `unxml` binary, which must be on
your `PATH`. Install it with [uv](https://docs.astral.sh/uv/):

```sh
uv tool install unxml-rs
```

The `.unxml` output is syntax-highlighted by a grammar bundled with this
extension — no separate language extension needed.

## Settings

- `jadeview.unxmlExtraArgs` — extra arguments appended to every `unxml`
  invocation, e.g. `["--hide-ns", "cbc,cac"]`.

## Notes for WSL / Remote users

JadeView declares `extensionKind: ["workspace", "ui"]`, so in a Remote-WSL (or
other remote) window it runs in the remote extension host and resolves the
remote `unxml` binary — not a Windows-side `unxml.exe`. Make sure the extension
is installed in the remote ("WSL: …") section of the Extensions view.

## License

MIT. Copyright (c) 2016 Ville M. Vainio.
