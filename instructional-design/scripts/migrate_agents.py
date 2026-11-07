import os
import json
import re
import shutil

# Path is relative to the script's location assuming it lives in `scripts/`
script_dir = os.path.dirname(os.path.abspath(__file__))
agents_dir = os.path.join(script_dir, "..", "agents")

for filename in os.listdir(agents_dir):
    if not filename.endswith(".md"):
        continue
    
    filepath = os.path.join(agents_dir, filename)
    with open(filepath, "r") as f:
        content = f.read()
    
    # Parse frontmatter
    match = re.match(r"^---\n(.*?)\n---\n(.*)", content, re.DOTALL)
    if not match:
        print(f"No frontmatter found in {filename}")
        continue
        
    frontmatter_str, prompt_content = match.groups()
    
    name = ""
    description = ""
    for line in frontmatter_str.strip().split("\n"):
        if line.startswith("name:"):
            name = line.split("name:")[1].strip().strip('"').strip("'")
        elif line.startswith("description:"):
            description = line.split("description:")[1].strip().strip('"').strip("'")
    
    agent_dir = os.path.join(agents_dir, name)
    os.makedirs(agent_dir, exist_ok=True)
    
    agent_json = {
        "name": name,
        "description": description,
        "config": {
            "customAgent": {
                "systemPromptSections": [
                    {
                        "title": "Agent System Instructions",
                        "content": prompt_content.strip()
                    }
                ],
                "toolNames": [
                    "send_message",
                    "find_by_name",
                    "grep_search",
                    "view_file",
                    "list_dir",
                    "read_url_content",
                    "search_web",
                    "schedule",
                    "multi_replace_file_content",
                    "replace_file_content",
                    "write_to_file",
                    "run_command",
                    "manage_task",
                    "define_subagent",
                    "invoke_subagent",
                    "manage_subagents",
                    "call_mcp_tool"
                ],
                "systemPromptConfig": {
                    "includeSections": [
                        "user_information",
                        "mcp_servers",
                        "skills",
                        "subagent_reminder",
                        "messaging",
                        "artifacts",
                        "user_rules"
                    ]
                }
            }
        }
    }
    
    json_path = os.path.join(agent_dir, "agent.json")
    with open(json_path, "w") as f:
        json.dump(agent_json, f, indent=2)
    
    print(f"Successfully processed {filename} -> {json_path}")
