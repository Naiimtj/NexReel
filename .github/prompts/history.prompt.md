---
agent: agent
description: 'Record the current chat iteration history'
name: 'history'
---

# /history - Conversation History Tracking

## Command Usage

Use `/history` to document significant interactions in a structured conversation history file.

**Syntax:**

- `/history` - Infer mode from context
- `/history --help` or `/history -h` - Display help information
- `/history --mode Agent` or `/history -m Agent` - Specify mode (Ask/Agent/Edit/Plan)
- `/history --comment Your comment` or `/history -c Your comment` - Add a user comment
- `/history --mode Agent --comment Your comment` - Combine mode and comment

## Purpose

Maintain a comprehensive, structured conversation history file that documents design decisions, iterations, and changes throughout the development process.

## When to Use

After each significant interaction:

- Chat sessions with design decisions or requirements clarifications
- Planning sessions that establish architecture or approach
- Edits that implement major changes or new features
- Agent tasks that complete significant work

## File Location

- **Directory**: `.history/conversations/`
- **Filename**: `conversation_YYYY-MM-DD.md` (current date)

### Raw Chat Archive

- **Directory**: `.history/conversations/raw/`
- **Filename**: `iteration_N_YYYY-MM-DD.md`

## Workflow

**Step 1 (MANDATORY FIRST):** Archive raw chat to `.history/conversations/raw/iteration_N_YYYY-MM-DD.md`

**Step 2:** Update or create the conversation history file with the iteration details

## File Structure

### Header

```markdown
# Conversation History - Registros Backend

**Date:** [Full Date]

## Iteration Summary

| Iteration   | Mode   | Chats   | Summary   | Link                              |
| :---------- | :----- | :------ | :-------- | :-------------------------------- |
| Iteration 1 | [Mode] | [Count] | [Summary] | [Go to Iteration 1](#iteration-1) |
```

### Iteration Template

```markdown
### Iteration N: [Descriptive Title]

**Mode:** [Ask/Agent/Edit/Plan] | **Chats:** [Count]

**User Comment:** [If provided]

**User Feedback:** [What the user requested]

**Changes Made:**

1. **[Category]**: [Description]
   - [Detail]

**Architecture/Implementation Notes:**

- Key decisions and rationale
```

## Interaction Protocol

- Create archive first, then update history
- If file exists, append new iteration
- If file doesn't exist, create with header + first iteration
