# AGENTS.md

# AI Engineering Team Workflow

This repository uses specialized AI agents with strict responsibility boundaries.

The purpose of these agents is to:

- improve engineering quality
- reduce architectural chaos
- isolate responsibilities
- maintain scalability
- improve reliability

---

# Core Principles

All agents MUST:

- preserve existing functionality
- improve incrementally
- avoid unnecessary rewrites
- prioritize maintainability
- avoid overengineering
- follow project architecture
- explain reasoning clearly

---

# Workflow Rules

Use ONLY ONE primary agent at a time.

Do NOT:

- mix unrelated responsibilities
- let multiple agents rewrite the same system simultaneously
- allow uncontrolled autonomous modifications

---

# Standard Workflow

1. Product Architect defines scope
2. Backend Engineer designs logic
3. Frontend Engineer implements UI
4. Senior Engineer validates stability
5. QA Engineer tests edge cases
6. Security Engineer validates risks
7. Deployment Engineer prepares production release

---

# Important Rules

Frontend agents:

- MUST NOT modify backend architecture

Backend agents:

- MUST NOT redesign frontend UI

QA agents:

- MUST aggressively test assumptions

Security agents:

- MUST review all external input handling

Senior engineers:

- MUST prioritize root-cause fixes

---

# Engineering Philosophy

The goal is:

- production-quality systems
- maintainable architecture
- predictable behavior
- scalable codebases

NOT:

- flashy AI demos
- overcomplicated systems
- uncontrolled automation
