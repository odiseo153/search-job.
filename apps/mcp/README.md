# Ever Jobs MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that lets AI assistants like **ChatGPT**, **Claude**, **GitHub Copilot**, and others search for jobs across **60+ sources** — including LinkedIn, Indeed, Glassdoor, company career pages, and ATS platforms.

## Quick Start

### Install & Run

```bash
# From the ever-jobs monorepo root
cd apps/mcp
npm install
npm run build
npm start          # starts the MCP server in stdio mode
```

### Connect to Claude Desktop

Add to your Claude Desktop config (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ever-jobs": {
      "command": "node",
      "args": ["<path-to>/ever-jobs/apps/mcp/dist/index.js"],
      "env": {
        "EVER_JOBS_API_URL": "http://localhost:3001"
      }
    }
  }
}
```

### Connect to ChatGPT / Other Clients

Use any MCP-compatible client. The server communicates via **stdio** (standard input/output).

## Tools

### `search_jobs`

Search for jobs across all sources.

| Parameter     | Type    | Required | Description                                        |
| ------------- | ------- | -------- | -------------------------------------------------- |
| `query`       | string  | ✅       | Job search query (e.g. "software engineer")        |
| `location`    | string  | ❌       | Location filter (e.g. "San Francisco", "Remote")   |
| `source`      | string  | ❌       | Specific source id (use `list_sources` to see all) |
| `company`     | string  | ❌       | Company slug for ATS sources (e.g. "stripe")       |
| `limit`       | number  | ❌       | Max results (default: 20, max: 100)                |
| `remote_only` | boolean | ❌       | Filter to remote positions only                    |

### `get_job_details`

Get detailed information about a specific job posting.

| Parameter | Type   | Required | Description                 |
| --------- | ------ | -------- | --------------------------- |
| `job_url` | string | ❌       | Full URL of the job posting |
| `job_id`  | string | ❌       | Ever Jobs internal job ID   |

### `list_sources`

List all available job sources.

| Parameter | Type   | Required | Description                                                          |
| --------- | ------ | -------- | -------------------------------------------------------------------- |
| `type`    | string | ❌       | Filter: `all`, `job_board`, `ats`, `company`, `remote`, `aggregator` |

## Resources

| URI                  | Description                        |
| -------------------- | ---------------------------------- |
| `everjobs://sources` | Complete list of available sources |
| `everjobs://guide`   | Search tips and usage guide        |

## Environment Variables

| Variable            | Default                 | Description            |
| ------------------- | ----------------------- | ---------------------- |
| `EVER_JOBS_API_URL` | `http://localhost:3001` | Ever Jobs API endpoint |

## Source Coverage

- **18** Job Boards (LinkedIn, Indeed, Glassdoor, Dice, Monster, ...)
- **6** Remote Job Boards (RemoteOK, Remotive, We Work Remotely, ...)
- **4** Aggregator APIs (Adzuna, Reed, Jooble, CareerJet)
- **22** ATS Platforms (Greenhouse, Lever, Ashby, Workable, ...)
- **12** Company Career Pages (Google, Meta, Netflix, Stripe, OpenAI, Amazon, Apple, ...)

**Total: 62 sources**
