from playwright.sync_api import sync_playwright
import os

output_dir = r"C:\Users\vnthu\OneDrive\Documents\ValgeMed\screenshots"
os.makedirs(output_dir, exist_ok=True)

widths = [360, 390, 430, 768, 1024, 1440]
pages = [
    ("http://localhost:3000/login", "login"),
    ("http://localhost:3000/dashboard", "dashboard"),
    ("http://localhost:3000/command", "command"),
    ("http://localhost:3000/settings", "settings"),
]

with sync_playwright() as p:
    for mode in ["light", "dark"]:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            color_scheme=mode,
            viewport={"width": 1440, "height": 900}
        )
        
        for url, name in pages:
            page = context.new_page()
            page.goto(url)
            page.wait_for_load_state("networkidle")
            
            # Wait a bit for any animations
            page.wait_for_timeout(500)
            
            for w in widths:
                page.set_viewport_size({"width": w, "height": 900 if w >= 768 else 1200})
                page.wait_for_timeout(300)
                filename = f"{name}_{mode}_{w}px.png"
                page.screenshot(path=os.path.join(output_dir, filename), full_page=True)
                print(f"Saved {filename}")
            
            page.close()
        
        context.close()
        browser.close()

print("Done")
