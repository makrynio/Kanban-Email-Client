# Email Kanban

A desktop email client that organises emails as draggable post-it notes on a kanban board. Built with Electron, React and TypeScript.

## Features

- Kanban board of emails with drag and drop between columns, powered by dnd-kit
- Gmail integration through OAuth2 (read, modify, send, compose scopes)
- Generic IMAP support for other providers
- Folder navigation, email viewer and action modals
- Demo mode with sample emails, used automatically when no credentials are configured

## Tech stack

- Electron 25, Vite, React 18, TypeScript, Tailwind CSS
- dnd-kit for drag and drop, lucide-react for icons
- googleapis and google-auth-library for Gmail, node-imap and mailparser for IMAP
- electron-store for local, encrypted settings and tokens

## Getting started

Requires Node.js 18 or higher.

```bash
npm install
npm run electron:dev      # development with hot reload
npm run electron:build    # package the desktop app
```

Without credentials the app starts in demo mode.

### Connecting Gmail

1. In [Google Cloud Console](https://console.cloud.google.com/) create a project and enable the Gmail API.
2. Create an OAuth client ID of type **Desktop application**.
3. Copy `.env.example` to `.env` and fill in the values:

   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   VITE_GOOGLE_CLIENT_SECRET=your-client-secret
   ```

4. Restart the app. `.env` is git-ignored, so credentials are never committed.

### Connecting over IMAP

Enter your server details in the IMAP setup form. TLS certificates are verified by default. The "accept self-signed certificate" option is off by default and should only be used with servers you trust.

## Security notes

- No credentials or keys are stored in the source. Google credentials come from `.env`.
- Local settings and OAuth tokens are encrypted with `VITE_STORE_ENCRYPTION_KEY` if set, otherwise a random per-install key generated on first run. A key stored beside the data only obfuscates it at rest; moving it to the OS keychain (Electron `safeStorage`) is a planned improvement.
- IMAP passwords are saved in the local settings file for reconnection.

## Project structure

```
email-kanban/
├── electron/        # Electron main process
├── src/
│   ├── components/  # Kanban board, email viewer, setup screens
│   ├── config/      # OAuth config and store key helper
│   ├── hooks/       # Tooltip and drag-hold hooks
│   └── services/    # Gmail, IMAP, OAuth2 and demo services
├── .env.example
└── vite.config.ts
```
