#!/usr/bin/env python3
"""Bygger delco.nu som statiska HTML-sidor utifrån _src/partials + _src/pages.
Kör: python3 build.py
"""
import json
import pathlib
import datetime

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "_src"
PARTIALS = SRC / "partials"
PAGES = SRC / "pages"

SITE_URL = "https://delco.nu"
YEAR = str(datetime.date.today().year)

PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="sv">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <meta name="description" content="{description}">
  <link rel="canonical" href="{canonical}">
  <link href="/assets/images/favicon/favicon.png" rel="icon">
  <title>{title}</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://use.fontawesome.com">
  <link rel="dns-prefetch" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://fonts.gstatic.com">
  <link rel="dns-prefetch" href="https://use.fontawesome.com">
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&family=Roboto:wght@400;700&display=swap">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.1/css/all.css">
  <link rel="stylesheet" href="/assets/css/libraries.css">
  <link rel="stylesheet" href="/assets/css/style.css">
{schema}
</head>

<body>
  <div class="wrapper">
    <div class="preloader">
      <div class="loading"><span></span><span></span><span></span><span></span></div>
    </div><!-- /.preloader -->

{header}

{content}

{footer}
  </div><!-- /.wrapper -->

  <script src="/assets/js/jquery-3.6.0.min.js"></script>
  <script src="/assets/js/plugins.js"></script>
  <script src="/assets/js/main.js"></script>
</body>

</html>
"""


def schema_block(schema_list):
    if not schema_list:
        return ""
    parts = []
    for s in schema_list:
        parts.append('  <script type="application/ld+json">\n' + json.dumps(s, ensure_ascii=False, indent=2) + "\n  </script>")
    return "\n".join(parts)


def out_path_for(canonical: str) -> pathlib.Path:
    # canonical like "/", "/tjanster/", "/omraden/malmo/"
    if canonical == "/":
        return ROOT / "index.html"
    trimmed = canonical.strip("/")
    return ROOT / trimmed / "index.html"


def main():
    header = (PARTIALS / "header.html").read_text(encoding="utf-8")
    footer = (PARTIALS / "footer.html").read_text(encoding="utf-8").replace("__YEAR__", YEAR)

    sitemap_entries = []
    built = []

    for meta_file in sorted(PAGES.glob("*.meta.json")):
        meta = json.loads(meta_file.read_text(encoding="utf-8"))
        content_file = PAGES / meta["content_file"]
        content = content_file.read_text(encoding="utf-8")

        canonical_path = meta["canonical"]
        canonical_url = SITE_URL + canonical_path

        html = PAGE_TEMPLATE.format(
            description=meta["description"],
            canonical=canonical_url,
            title=meta["title"],
            schema=schema_block(meta.get("schema", [])),
            header=header,
            content=content,
            footer=footer,
        )

        out_file = out_path_for(canonical_path)
        out_file.parent.mkdir(parents=True, exist_ok=True)
        out_file.write_text(html, encoding="utf-8")
        built.append(str(out_file.relative_to(ROOT)))

        sitemap_entries.append((canonical_url, meta.get("priority", "0.7")))

    # sitemap.xml
    build_date = datetime.date.today().isoformat()
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, priority in sitemap_entries:
        sm.append("  <url>")
        sm.append(f"    <loc>{url}</loc>")
        sm.append(f"    <lastmod>{build_date}</lastmod>")
        sm.append(f"    <priority>{priority}</priority>")
        sm.append("  </url>")
    sm.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(sm) + "\n", encoding="utf-8")

    # robots.txt
    robots = f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n"
    (ROOT / "robots.txt").write_text(robots, encoding="utf-8")

    print(f"Byggde {len(built)} sidor:")
    for b in built:
        print("  -", b)
    print("Skrev sitemap.xml och robots.txt")


if __name__ == "__main__":
    main()
