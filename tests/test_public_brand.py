from pathlib import Path
import json
ROOT = Path(__file__).resolve().parents[1]

def test_public_brand_and_stable_pwa_identity():
    manifest = json.loads((ROOT/'static/manifest.json').read_text())
    assert manifest['name'] == 'AutoEDU.ai Media Lab'
    assert manifest['short_name'] == 'AutoEDU Lab'
    assert (manifest['id'],manifest['start_url'],manifest['scope']) == ('/','/','/')
    html = (ROOT/'static/index.html').read_text()
    assert '<title>AutoEDU.ai Media Lab</title>' in html
    assert 'aria-label="Studio brand"' in html
    assert 'content="AutoEDU.ai Media Lab"' in html

def test_standalone_install_docs_and_compatibility():
    doc = (ROOT/'docs/INSTALL.md').read_text()
    assert 'git clone https://github.com/kerpopule/autoedu-media-lab.git' in doc
    assert 'cd autoedu-media-lab' in doc
    server = (ROOT/'media_lab_core/studio_server.py').read_text()
    assert "'name': 'AutoEDU.ai Media Lab'" in server
    assert "'vibexStudio':" in server
    app = (ROOT/'app.py').read_text()
    assert 'data["vibexEmbed"] = 1' in app
