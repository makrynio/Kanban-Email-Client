# Email Kanban

A modern, visual email client built with Tauri and React that organizes emails as post-it notes in a kanban board interface.

## Features

- 🎯 **Visual Email Organization**: View emails as draggable post-it notes
- 📋 **Kanban Board**: Drag & drop emails between columns (Unread, Read, Flagged)
- 📁 **Folder Navigation**: Easy navigation between different email folders
- 📱 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- 🔄 **Drag & Drop**: Intuitive email organization with smooth animations
- 📎 **Attachment Support**: View and manage email attachments
- 🚀 **Cross-Platform**: Runs on Windows, macOS, and Linux

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Rust (Tauri)
- **Build Tool**: Vite
- **Drag & Drop**: react-beautiful-dnd
- **Icons**: Lucide React

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Rust** (latest stable version)
- **Git**

### Installing Prerequisites

#### Windows
```bash
# Install Node.js
winget install OpenJS.NodeJS

# Install Rust
winget install Rustlang.Rust.MSVC
```

#### macOS
```bash
# Install Node.js
brew install node

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### Linux
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd email-kanban
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run tauri dev
   ```

4. **Build for production**
   ```bash
   npm run tauri build
   ```

## Development

### Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build the React app
- `npm run preview` - Preview the built app
- `npm run tauri dev` - Start Tauri development mode
- `npm run tauri build` - Build the desktop app

### Project Structure

```
email-kanban/
├── src/                    # React frontend source
│   ├── components/        # React components
│   ├── types.ts          # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles
├── src-tauri/            # Rust backend source
│   ├── src/              # Rust source code
│   ├── Cargo.toml        # Rust dependencies
│   ├── build.rs          # Build script
│   └── tauri.conf.json   # Tauri configuration
├── package.json          # Node.js dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # This file
```

## Features in Detail

### Kanban Board
- **Unread Column**: New emails that haven't been opened
- **Read Column**: Emails that have been viewed
- **Flagged Column**: Important emails marked for follow-up

### Email Cards
Each email is displayed as a card showing:
- Sender information
- Subject line
- Preview of email content
- Timestamp
- Attachment indicators
- Status (unread, read, flagged)

### Drag & Drop
- Move emails between columns to change their status
- Reorder emails within columns
- Visual feedback during drag operations

### Folder Navigation
- Inbox, Sent, Drafts, Archive, Trash, Flagged
- Email counts for each folder
- Easy switching between different views

## Customization

### Styling
The app uses Tailwind CSS for styling. You can customize:
- Colors in `tailwind.config.js`
- Component styles in `src/index.css`
- Individual component styles

### Adding New Features
- **New Email Actions**: Add buttons in `EmailViewer.tsx`
- **New Columns**: Modify the `columns` state in `KanbanBoard.tsx`
- **New Folders**: Update the `folders` array in `Sidebar.tsx`

## Building for Distribution

### Windows
```bash
npm run tauri build
# Output: src-tauri/target/release/bundle/msi/
```

### macOS
```bash
npm run tauri build
# Output: src-tauri/target/release/bundle/dmg/
```

### Linux
```bash
npm run tauri build
# Output: src-tauri/target/release/bundle/appimage/
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the [Tauri documentation](https://tauri.app/)
2. Review the [React documentation](https://react.dev/)
3. Open an issue in this repository

## Roadmap

- [ ] Email composition and sending
- [ ] IMAP/SMTP integration
- [ ] Search and filtering
- [ ] Custom folder creation
- [ ] Email templates
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Email threading
- [ ] Calendar integration
- [ ] Mobile responsive design
