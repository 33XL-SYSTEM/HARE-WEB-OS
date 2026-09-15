use datetime;
use fmt;
use strings;

// Mock structure for HARE WEB OS Kernel
// Hare language currently does not have official WASM support, 
// so this file serves as the reference architecture for the kernel 
// once WASM compilation for Hare is viable.

type Kernel = struct {
    version: str,
    organization: str,
    current_dir: str,
};

fn init_kernel() Kernel = {
    return Kernel {
        version = "1.0.0 (HARE WEB OS)",
        organization = "33XL System",
        current_dir = "/",
    };
};

export fn handle_command(k: *Kernel, cmd_str: str) str = {
    let parts = strings::tokenize(cmd_str, " ");
    let cmd = parts[0];

    switch (cmd) {
        case "uname" =>
            return "33XL System Kernel 1.0.0 [Hare WASM]";
        case "date" =>
            // Using a simple mock string for date in this reference
            return "2026-09-14 21:00:00"; 
        case "ls" =>
            if (k.current_dir == "/") {
                return "home boot sys";
            };
            return "";
        case "pwd" =>
            return k.current_dir;
        case "whoami" =>
            return "hare_admin";
        case "help" =>
            return "Available commands: uname, date, ls, pwd, echo, whoami, help";
        case =>
            return "Command not found";
    };
};
