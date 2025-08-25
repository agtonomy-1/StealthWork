import os, csv, pathlib

REPO_ROOT = pathlib.Path(__file__).resolve().parents[2]
CSV_PATH = REPO_ROOT / "site" / "data" / "faq_topics.csv"
OUT_DIR  = REPO_ROOT / "site" / "faq"
ASSET_CSS = "/assets/style.css"

OUT_DIR.mkdir(parents=True, exist_ok=True)

def sanitize_filename(title: str) -> str:
    s = title.lower()
    for b in ['?', ':', '/', '\\', '"', "'", '#', '%', '&', '*', '<', '>', '|', '+']:
        s = s.replace(b, '')
    s = s.replace(' ', '-')
    return s + ".html"

TEMPLATE = (
    "<!doctype html><html><head><meta charset='utf-8'>"
    "<meta name='viewport' content='width=device-width, initial-scale=1'>"
    f"<link rel='stylesheet' href='{ASSET_CSS}'>"
    "<title>{title}</title></head><body>"
    "<section class='card'>"
    "<h1>{title}</h1>"
    "<p>Short answer: rules vary by location and situation. "
    "This page explains common practice and links a tool to help.</p>"
    "<p><a href='/products/{slug}.html'>Open the related tool</a></p>"
    "</section>"
    "</body></html>"
)

def main():
    if not CSV_PATH.exists():
        print(f"[warn] CSV not found at {CSV_PATH}. Create site/data/faq_topics.csv with 'topic,slug' columns.")
        return
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        rows = list(csv.DictReader(f))
    if not rows:
        print("[warn] No rows in CSV")
        return
    count = 0
    for row in rows:
        title = (row.get("topic") or "").strip()
        slug  = (row.get("slug") or "").strip()
        if not title or not slug:
            continue
        html = TEMPLATE.format(title=title, slug=slug)
        name = sanitize_filename(title)
        (OUT_DIR / name).write_text(html, encoding='utf-8')
        count += 1
    print(f"[ok] Built {count} FAQ pages into {OUT_DIR}")

if __name__ == "__main__":
    main()
