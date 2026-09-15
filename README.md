<div align="center">
  <img src="./public/favicon.png" alt="HARE WEB OS Logo" width="800" />
</div>

# HARE WEB OS

HARE WEB OS is a fork of Bunny OS, re-engineered as a modern, high-tech Web Operating System.

We have adopted the **Hare** programming language for the kernel to complete the rhyme (replacing Python) alongside a cutting-edge **TypeScript / React** GUI. 

*Note: Since the Hare compiler does not officially support a stable WebAssembly target yet, the kernel logic is written in `.ha` reference files while the frontend uses a JS-bridge mock until the Hare-WASM toolchain matures.*

### Organization
Maintained and developed by **33XL System**.

### Stack
- **Frontend / GUI**: React, TypeScript, Vite
- **Kernel Language**: Hare (WASM)
- **Styling**: Glassmorphism CSS

### Development
```bash
# Install dependencies
npm install

# Start the Web OS locally
npm run dev
```
