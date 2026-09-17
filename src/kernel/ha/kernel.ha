// HARE-OS kernel — native core (Hare reference implementation).
//
// This is the Node side of the hybrid kernel, written in Hare. Build with:
//
//   hare build -o bin/hare-kernel src/kernel/ha/kernel.ha
//
// Protocol (single-shot, line-oriented): the host spawns the binary passing
// the raw command line as argv[1]; the kernel prints the reply on stdout and
// exits. This interface is deliberately architected to compile to WASM once
// the Hare toolchain gains a stable WebAssembly backend — the ABI (dispatch on
// raw command line) is identical to src/kernel/wasm/kernel.c.
//
// The command set mirrors the WASM core: stateless, so the JS host stays the
// single source of truth for cwd/VFS state.

use fmt;
use os;
use strings;

fn fnv_hex(inputs: []str) u32 = {
	let hash: u32 = 2166136261;
	for (let i = 1z; i < len(inputs); i += 1) {
		for (let j = 0z; j < len(inputs[i]); j += 1) {
			hash ^= inputs[i][j]: u32;
			hash *= 16777619;
		};
	};
	return hash;
};

export fn main() void = {
	const args = os::args();
	if (len(args) < 2) {
		fmt::println()!;
		return;
	};

	const raw = args[1];
	const tokens = strings::split(raw, " ");
	defer strings::freeall(tokens);

	const cmd = tokens[0];
	switch (cmd) {
		"version" => fmt::println("HARE-OS kernel v0.1.0 (hare-linux)")!,
		"uname" => fmt::println("HARE-OS linux minimal/0.1 hare")!,
		"whoami" => fmt::println("hare_admin")!,
		"echo" => fmt::println(strings::join(tokens[1..], " "))!,
		"ident" => fmt::println("native:kernel-0.1")!,
		"fnv" => fmt::printfln("fnv1a={:x}", fnv_hex(tokens))!,
		"uptime" => fmt::println("up 0 seconds (native tick)")!,
		* => fmt::printfln(
			"core: unknown command '{}' (handled by JS fallback)",
			cmd,
		)!,
	};
};