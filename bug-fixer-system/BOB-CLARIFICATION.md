# 📝 Bob vs BOB - Naming Clarification

## Two Different "Bobs"

This system uses two different entities with similar names. Here's the clarification:

### 1. **IBM Bob** (The IDE)
- **What it is:** IBM's AI-powered development environment
- **Role:** The development environment where you work
- **Also called:** "Bob" (lowercase after first letter)
- **You use it for:** Writing code, managing projects, and interacting with AI assistants

### 2. **BOB AI Assistant** (The AI)
- **What it is:** The AI assistant that helps you within IBM Bob
- **Role:** Executes the bug-fixing workflows, uses MCP tools
- **Also called:** "BOB" (all caps) or "BOB AI Assistant"
- **You use it for:** Asking questions, running tools, automating tasks

---

## In This Documentation

Throughout the documentation:

- **"Bob"** or **"IBM Bob"** = The IDE application
  - Example: "Restart Bob completely"
  - Example: "Configure Bob's MCP settings"

- **"BOB AI Assistant"** or **"BOB"** = The AI helping you
  - Example: "Ask the BOB AI Assistant to list repositories"
  - Example: "BOB will execute all steps automatically"

---

## Typical Workflow

```
You (User)
    ↓
    Open IBM Bob (the IDE)
    ↓
    Ask BOB AI Assistant (the AI) to do something
    ↓
    BOB AI Assistant uses MCP tools
    ↓
    Results shown in IBM Bob (the IDE)
```

---

## Configuration File Locations

### For IBM Bob:
The MCP configuration file location:
- Check IBM Bob's documentation for the exact path
- Typically `~/.bob/mcp.json` or in Bob's settings directory
- Configuration structure follows MCP standard format

### For Reference (Other MCP Clients):
- **Other IDEs:** Check their respective documentation for MCP configuration
- **Other MCP clients:** Check their respective documentation

---

## In Conversations

When you talk to the BOB AI Assistant in IBM Bob:

✅ **Correct:**
- "List my repositories" (BOB AI understands you're talking to it)
- "Use the fetch_issues tool"
- "Fix this bug"

❌ **Not needed:**
- "Hey BOB, list my repositories" (you can just ask directly)
- "Bob, fix this bug" (context makes it clear)

---

## Summary

| What | Full Name | Short Name | What It Does |
|------|-----------|------------|--------------|
| IDE | IBM Bob | Bob | Development environment |
| AI | BOB AI Assistant | BOB | Executes tasks & uses tools |

---

## Need Help?

The BOB AI Assistant is designed to work seamlessly with IBM Bob IDE, providing intelligent code assistance and automation through the Model Context Protocol (MCP).

---

Made for IBM Bob users
