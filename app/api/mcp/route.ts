// Endpoint MCP de Navpit : https://navpit.com/api/mcp
// Clients : Claude Code, Claude Desktop, Cursor, agents perso.
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { registerNavpitTools } from "@/lib/mcp/tools";
import { verifyNavpitToken } from "@/lib/mcp/auth";

export const runtime = "nodejs"; // node:crypto requis
export const maxDuration = 60;

const handler = createMcpHandler(
  (server) => {
    registerNavpitTools(server);
  },
  {
    serverInfo: { name: "navpit", version: "1.0.0" },
    verboseLogs: process.env.NODE_ENV !== "production",
  }
);

const authedHandler = withMcpAuth(handler, verifyNavpitToken, { required: true });

export { authedHandler as GET, authedHandler as POST, authedHandler as DELETE };
