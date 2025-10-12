// Prefer the generated client in `generated/prisma` (custom generator output)
// when present. Some setups generate the client into a custom folder which
// means the runtime stub under node_modules/.prisma/client will still throw
// if imported directly. Attempt to require the generated client first and
// fall back to the package import.
let PrismaClientClass: any;
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
	const gen = require('../generated/prisma');
	PrismaClientClass = gen.PrismaClient || gen.default?.PrismaClient || gen.default || gen;
} catch (e) {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	PrismaClientClass = require('@prisma/client').PrismaClient;
}

// Ensure we don't create multiple instances of PrismaClient during hot reloads
// in development. Node's `global` is used to cache the client between module
// reloads. This file is imported by API routes and other server code.
declare const global: typeof globalThis & { prismadb?: InstanceType<any> };

const client = global.prismadb || new PrismaClientClass();

if (process.env.NODE_ENV !== 'production') global.prismadb = client;

export default client;