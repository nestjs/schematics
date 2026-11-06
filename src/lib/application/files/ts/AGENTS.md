# AGENTS.md

## Production data: NestJS Observe

<% if (observe) { %>This app reports its traces, errors, logs and metrics to [NestJS Observe](https://observe.nestjs.com) through `ObserveModule` in `<%= minimal ? 'src/main.ts' : 'src/app.module.ts' %>`. Its key pair comes from `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET` in `.env`, which `npx @nestjs/observe link` writes.<% } else if (minimal) { %>This app's production telemetry - traces, errors, logs and metrics - goes to [NestJS Observe](https://observe.nestjs.com). Until `ObserveModule` is registered in `src/main.ts`, nothing is sent: `npx @nestjs/observe link` installs `@nestjs/observe` and writes the key pair (`OBSERVE_APP_KEY`, `OBSERVE_APP_SECRET`) to `.env`, and the quick start shows the edits that register it: https://observe.nestjs.com/documentation/sdk#quick-start<% } else { %>This app's production telemetry - traces, errors, logs and metrics - goes to [NestJS Observe](https://observe.nestjs.com). Until `ObserveModule` is registered in `src/app.module.ts`, nothing is sent: `npx @nestjs/observe link` sets it up in one step - it installs `@nestjs/observe`, wires it into the app, and writes the key pair (`OBSERVE_APP_KEY`, `OBSERVE_APP_SECRET`) to `.env`.<% } %>

When a task depends on how the app behaves in production - an error users hit, a slow endpoint, a failing job, whether a release made things worse - work from that data, not from the code alone:

- The Observe MCP server answers those questions directly: errors with their traces and logs, slow operations, jobs, and what a release changed (`find_regressions`, `diff_release`). It is included on the Pro plan and above. In Claude Code: `claude mcp add observe --transport http https://observe-api.nestjs.com/mcp`, and the client opens a browser to approve. Other clients: https://www.observe.nestjs.com/documentation/mcp
- Without it, the user can open the request or error in the Observe dashboard and click **Copy agent prompt**, which hands over that page's trace, stack and logs as text.
<% if (minimal) { %>
## One-file layout

All the code is in `src/main.ts`. `nest generate` (for example `nest g resource users`) writes new files under `src/` and registers them in `AppModule` there. It writes spec files once `@nestjs/testing` is in `package.json`. When `src/main.ts` gets long, move `AppModule` to `src/app.module.ts`: `nest generate` uses a `*.module.ts` file when there is one.

This project is ESM: relative imports end in `.js`, and `__dirname` doesn't exist (use `import.meta.dirname`).
<% } %>