

images = [
    {"name": "project1.svg", "color": "#667eea", "text": "Projekt 1"},
    {"name": "project2.svg", "color": "#764ba2", "text": "Projekt 2"},
    {"name": "project3.svg", "color": "#ff6b6b", "text": "Projekt 3"},
    {"name": "project4.svg", "color": "#48c774", "text": "Projekt 4"},
    {"name": "project5.svg", "color": "#3298dc", "text": "Projekt 5"},
    {"name": "project6.svg", "color": "#f39c12", "text": "Projekt 6"},
]

for img in images:
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect fill="{img['color']}" width="600" height="400"/>
    <text fill="#ffffff" font-family="sans-serif" font-size="30" dy="10.5" font-weight="bold" x="50%" y="50%" text-anchor="middle">{img['text']}</text>
</svg>'''

    with open(f"frontend/images/{img['name']}", "w") as f:
        f.write(svg_content)

print("Images generated.")
