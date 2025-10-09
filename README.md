# DataDome MCP server

## Introduction

This is an early implementation of the DataDome MCP server in TypeScript. This server uses the stdio transport and implements several tools that interact with the customer dashboard via the management API:

- **get_account_settings**: returns the parameters of the account being used ([doc](https://docs.datadome.co/reference/get_1-0-account-settings))
- **get_all_endpoints**: returns a collection of all configured endpoints details, using an optional search filter ([doc](https://docs.datadome.co/reference/get_1-0-endpoints))
- **get_custom_rules**: returns a collection of all custom rules ([doc](https://docs.datadome.co/reference/get_1-1-protection-custom-rules))
- **create_custom_rule**: creates a new custom protection rule ([doc](https://docs.datadome.co/reference/post_1-1-protection-custom-rules))
- **get_account_usage**: returns the account usage and number of requests across endpoints, using a time range filter ([doc](https://docs.datadome.co/reference/get_1-0-account-usage))

## Running the server

Install dependencies:
```
npm install
```

Copy the example env file, and set the DataDome management API key of your account (```DD_MGMT_KEY``` variable):
```
cp .env.example .env
```

Build the server:
```
npm run build
```

## Testing the server

The easiest way to test and troubleshoot the server is to use [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector).

Just run:

```
npx @modelcontextprotocol/inspector node dist/main.js
```

The MCP Inspector will automatically open in a new browser window where you can explore the available tools.

## MCP client configuration

To use this MCP server in a desktop LLM application that supports MCP (Claude Desktop, etc), add the following configuration to your MCP settings file:

```json
{
  "mcpServers": {
    "datadome": {
      "command": "node",
      "args": ["/absolute/path/to/datadome-public-mcp-server/dist/main.js"],
      "env": {
        "DD_MGMT_KEY": "your-datadome-management-api-key"
      }
    }
  }
}
```

Make sure to:
- Replace `/absolute/path/to/datadome-public-mcp-server` with the actual path to your installation
- Replace `your-datadome-management-api-key` with your actual DataDome management API key

## Useful resources

- [DataDome management API doc](https://docs.datadome.co/reference)
- [Official MCP TypeScript SDK doc from Anthropic](https://github.com/modelcontextprotocol/typescript-sdk)
