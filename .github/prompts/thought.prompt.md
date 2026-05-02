---
description: 'Record a thought related to the current project'
name: 'thought'
---

# /thought - Quick Thought Capture

## Command Usage

Use `/thought` to capture quick thoughts, ideas, and notes with timestamps.

**Syntax:**

- `/thought --help` or `/thought -h` - Display help information
- `/thought <your note or idea>` - Add a thought
- `/thought --recent` or `/thought -r` - View recent thoughts

## Purpose

Document fleeting ideas, reminders, and observations during development work without interrupting flow. All thoughts are collected in a single chronological file with timestamps.

## File Location

- **Directory**: `.history/thoughts/`
- **Filename**: `thoughts.md`
- **Path**: `.history/thoughts/thoughts.md`

## Command Details

### Adding a Thought

When the user types `/thought` followed by their note:

1. **Extract the note content**: Everything after `/thought` is the note text
2. **Generate timestamp**: Use the current date/time from context: `[YYYY.MM.DD HH:MM:SS]`
3. **Locate or create the thoughts file**: `.history/thoughts/thoughts.md`
4. **Append the timestamped note**:
   ```
   [YYYY.MM.DD HH:MM:SS] <note content>
   ```
5. **Confirm**: Briefly confirm the thought was captured with a concise message.

### Viewing Recent Thoughts (`/thought --recent` or `/thought -r`)

1. Read `.history/thoughts/thoughts.md`
2. Display the last 5 entries
3. If the file doesn't exist, inform the user no thoughts have been captured yet

## Example

**User input:**

```
/thought Consider adding email notification for institution membership changes
```

**Action:** Append to `.history/thoughts/thoughts.md`:

```
[2026.04.10 14:30:00] Consider adding email notification for institution membership changes
```

**Response:**

```
Thought captured.
```
