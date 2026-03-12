
import json
import re

try:
    with open('products-data.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex to strip "window.siteData =" or "const siteData =" and trailing ";"
    json_str_candidate = re.sub(r'^(window\.|const\s+)?siteData\s*=\s*', '', content).strip()
    if json_str_candidate.endswith(';'):
        json_str_candidate = json_str_candidate[:-1]
    
    # It enters as a JS object literal, which might not be valid JSON (keys not quoted).
    # We can try to use `exec` in python to evaluate it as a python dictionary if we massage it,
    # or just use node to evaluate it properly if we write a .js file that exports it.
    
    # Better approach: Write a node script that requires it (if it was a module) or loads it.
    # Since it assigns to window, let's mock window.
    
    print("JS content read. Delegating to Node for robust parsing.")
    
except Exception as e:
    print(e)
