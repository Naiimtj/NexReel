---
description: 'Quick access to information about available skills'
name: 'skills'
---

# /skills - Skills Information Access

## Command Usage

Use `/skills` to access information about available skills from the SKILLS-DIGEST.md file.

**Syntax:**

- `/skills --help` or `/skills -h` - Display help information
- `/skills` or `/skills --all` or `/skills -a` - Display a simple list of all skill names
- `/skills --categories` or `/skills -c` - List all skill categories only
- `/skills --skill [skill-name]` or `/skills -s [skill-name]` - Display detailed information about a specific skill

## Purpose

Provide quick, structured access to skill documentation stored in `.github/skills/SKILLS-DIGEST.md` and individual `SKILL.md` files.

## Command Execution Requirements

1. **Always read the file first**: Use the `read_file` tool to read `.github/skills/SKILLS-DIGEST.md` before providing any response
2. **Process the data**: Parse and extract the requested information
3. **Present the output**: Format and display the results according to the command specifications below
4. **No placeholders**: Always show actual skill data from the file

## Command Details

### `/skills --all` or `/skills -a`

Display a simple list of all skill names, grouped by category.

**Output format:**

- One skill name per line
- Alphabetically sorted within categories
- End with: "Use `/skills -s [name]` to learn more about a skill"

### `/skills --categories` or `/skills -c`

List all skill categories with skill counts.

**Output format:**

```
API (2 skills)
Database (1 skill)
Infrastructure (1 skill)
Quality (1 skill)
Security (1 skill)
Testing (1 skill)
```

### `/skills --skill [skill-name]` or `/skills -s [skill-name]`

Read the specific `SKILL.md` file and display its content.

**Execution steps:**

1. Find the skill path from SKILLS-DIGEST.md
2. Read the SKILL.md file using `read_file`
3. Display the full skill content
