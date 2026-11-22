import json
import urllib.request
import urllib.error
import os

AUTH_FILE = r'C:\Users\hp\AppData\Roaming\com.vercel.cli\Data\auth.json'
with open(AUTH_FILE, 'r') as f:
    token = json.load(f)['token']

TEAM_ID = 'team_5addzFT2d4xxGrS2QRm6shlm'
HEADERS = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

def list_projects():
    url = f'https://api.vercel.com/v9/projects?teamId={TEAM_ID}'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"Total projects: {len(data.get('projects', []))}")
        for p in data.get('projects', []):
            print(f"Project: {p['name']} | ID: {p['id']}")
        return data.get('projects', [])

def get_or_create_project(name='btp-maroc-erp'):
    projects = list_projects()
    for p in projects:
        if p['name'] == name:
            print(f"Found existing project {name} with id {p['id']}")
            return p
    
    url = f'https://api.vercel.com/v10/projects?teamId={TEAM_ID}'
    payload = json.dumps({
        'name': name,
        'framework': 'nextjs'
    }).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers=HEADERS, method='POST')
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"Created project {name} with id {data['id']}")
            return data
    except urllib.error.HTTPError as e:
        print("HTTP Error creating project:", e.code, e.read().decode())
        raise

if __name__ == '__main__':
    project = get_or_create_project('btp-maroc-erp')
    vercel_dir = r'C:\Users\hp\.gemini\antigravity\scratch\btp-maroc-erp\.vercel'
    os.makedirs(vercel_dir, exist_ok=True)
    project_json_path = os.path.join(vercel_dir, 'project.json')
    with open(project_json_path, 'w') as f:
        json.dump({
            'projectId': project['id'],
            'orgId': TEAM_ID,
            'projectName': project['name']
        }, f)
    print("Successfully wrote .vercel/project.json:", project_json_path)
