import os
import re

model_map = {
    'phase1_orchestrator.py': 'kimi-k2-thinking:cloud',
    'phase2_orchestrator.py': 'mistral-large-3:675b-cloud',
    'phase3_orchestrator.py': 'qwen3-coder:480b-cloud',
    'phase4_orchestrator.py': 'devstral-2:123b-cloud',
    'phase5_orchestrator.py': 'glm-4.7:cloud',
}

dir_path = r'c:\SITE\Projects\SDLC_Optimization\backend\orchestrator'
for fname, model_str in model_map.items():
    fpath = os.path.join(dir_path, fname)
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Replace `self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=XXX)`
        # with `self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=XXX, model='...cloud')`
        new_content = re.sub(
            r'(self\.llm\.generate\([^\)]+max_tokens=\d+)\)',
            fr'\1, model="{model_str}")',
            content
        )
        
        if new_content != content:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {fname}')
        else:
            print(f'No changes for {fname}')
