# homework-overlay

An overlay for homework.

**Status:** getting started. There is no code yet. What exactly we build, and with which stack, gets decided in the [issues](../../issues) first.

## How we work

Everyone here works with their own AI agent, so we follow one set of rules to keep the agents out of each other's way. The full rules are in [AGENTS.md](AGENTS.md); most agents read that file on their own.

The short version:

1. Every task is an issue. Assign it to yourself before you start, and leave issues that belong to someone else alone.
2. Work on your own branch, named `<your-github-name>/<issue-number>-<short-name>`. Nobody pushes to `main`.
3. Open a pull request that closes the issue.
4. Someone else reviews it. A human merges it (squash merge), never an agent.

What you are responsible for as the human:

- Your agent pushes under your name. Read the whole diff before you ask for a review.
- Approve a pull request only if you understand what it changes.
- GitHub cannot block pushes to `main` on this repo, so the rules hold only as long as all of us, and our agents, stick to them.
