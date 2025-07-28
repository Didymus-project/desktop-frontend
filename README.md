# Didymus Desktop Application

This repository contains the source code for the Didymus desktop application, built with Next.js, Electron, and Tailwind CSS.

## Overview

Didymus is a modern desktop application designed to assist in liturgical presentations by automatically scrolling scripture or service text in sync with spoken Malayalam. It combines the power of web technologies to deliver a sleek, responsive user interface, while utilizing the Electron framework to ensure seamless cross-platform compatibility across Windows, macOS, and Linux.

## Getting Started

Follow these instructions to set up the development environment and build the application from source.

## Prerequisites

- Node.js: `v22.17.1`
- npm: `v11.5.1`

It is highly recommended to use a version manager like nvm ([nvm-windows](https://github.com/coreybutler/nvm-windows)/[nvm](https://github.com/nvm-sh/nvm)) or [Volta](https://github.com/volta-cli/volta) to ensure you are using the correct Node.js and npm versions.

## Installation

1. ### Clone the repository:

   ```bash
   git clone https://github.com/Didymus-project/desktop-frontend
   cd didymus-desktop-frontend
   ```

2. ### Install dependencies:

   ```bash
   npm install
   ```

3. ### Build Environment Workaround (Windows Only):

   On Windows, `electron-builder` may incorrectly try to resolve macOS-specific native modules. To avoid this:

   ```bash
   mkdir node_modules/@img/sharp-darwin-arm64
   ```

   This creates a placeholder directory to satisfy the dependency check and allows builds to succeed on Windows.

## Development

To run the application in a local development environment with hot-reloading enabled, use the following command:

```bash
npm run dev
```

This will launch the Next.js development server and the Electron application simultaneously.

## Coding Conventions

To ensure builds do not fail due to linting errors, please adhere to the following conventions:

### Escaping Entities in JSX

The project's ESLint configuration enforces the `jsx-react/no-unescaped-entities` rule. This means special characters like apostrophes must be escaped.

- <b>Incorrect</b>: `This is Tailwind's arbitrary value syntax.`

- <b>Correct</b>: `This is Tailwind&apos;s arbitrary value syntax.`

Always use `&apos;` for apostrophes within JSX text to prevent the build from failing.

## Building for Production

To create a distributable executable for your platform, you must run the build command.

<b>Important</b>: On Windows, this command must be executed from a terminal with Administrator privileges. This is required for the build tools to correctly create symbolic links and set file permissions.

1. <b>Open your terminal (PowerShell or Command Prompt) as an Administrator.</b>
2. Navigate to the project directory.
3. Run the build script:
   ```bash
    npm run build
   ```
   <b>Note:</b> The first time you build the application, it may take several minutes. The process needs to download Electron binaries and other platform-specific dependencies, which are cached for subsequent builds.

The completed build artifacts will be located in the `/dist` directory.

## Release and Deployment

After a successful build, the `/dist` directory will contain the distributable files for your application.

- <b>For Windows:</b> You will typically find an installer (e.g., `Didymus Setup 0.1.0.exe`) and a folder containing the portable version.

- <b>For other platforms (macOS, Linux):</b> You will find the corresponding application bundles (e.g., `.dmg`, `.AppImage`).

To release the application, distribute the appropriate installer or portable executable to your users. The /out directory is an intermediate build artifact used by Electron and is not intended for distribution.
