import pymupdf

doc = pymupdf.open(r"C:\Users\rajpa\.gemini\antigravity\brain\52c8f8c5-a47f-4be0-a7f6-a26cf1891ea4\.user_uploaded\media_1791364481895.pdf")

for pno, page in enumerate(doc):
    print(f"\n==================== PAGE {pno+1} BLOCKS ====================")
    blocks = page.get_text("dict")["blocks"]
    for b in blocks:
        if "lines" in b:
            for l in b["lines"]:
                for s in l["spans"]:
                    text = s["text"].strip()
                    if text:
                        bbox = [round(x, 1) for x in s["bbox"]]
                        color = hex(s["color"])
                        print(f"bbox={bbox} font={s['font']} size={s['size']:.1f} color={color} text={text}")
