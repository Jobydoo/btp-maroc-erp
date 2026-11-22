import urllib.request

urls = [
    'https://btp-maroc-erp.vercel.app/dashboard',
    'https://btp-maroc-erp.vercel.app/chantiers',
    'https://btp-maroc-erp.vercel.app/devis',
    'https://btp-maroc-erp.vercel.app/ouvriers',
    'https://btp-maroc-erp.vercel.app/journal'
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            btp_found = "BTP" in content or "Chantier" in content or "Maroc" in content
            print(f"{u} -> Status: {resp.status} | Length: {len(content)} bytes | Valid ERP Content: {btp_found}")
    except Exception as e:
        print(f"{u} -> Error: {e}")
