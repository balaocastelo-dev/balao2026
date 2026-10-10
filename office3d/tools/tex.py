import sys, os
from PIL import Image
# usage: tex.py <rawdir> <outdir> ; converts *_body_color, *_head_color, *_opacity_color TGAs -> flipped webp
raw, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
SZ = {'body': int(os.environ.get('BODY', 1024)), 'head': int(os.environ.get('HEAD', 1024)), 'hair': 512, 'glasses': 256}
for n in sorted(os.listdir(raw)):
    low = n.lower()
    if not low.endswith('.tga'): continue
    kind = 'body' if '_body_color' in low else 'head' if '_head_color' in low else 'glasses' if 'glasses_opacity' in low else 'hair' if '_opacity_color' in low else None
    if not kind: continue
    im = Image.open(os.path.join(raw, n))
    s = SZ[kind]
    if kind in ('hair', 'glasses'):
        im = im.convert('RGBA').resize((s, s), Image.LANCZOS).transpose(Image.FLIP_TOP_BOTTOM)
        im.save(os.path.join(out, kind + '.webp'), 'WEBP', quality=82, method=6, exact=True)
    else:
        im = im.convert('RGB').resize((s, s), Image.LANCZOS).transpose(Image.FLIP_TOP_BOTTOM)
        im.save(os.path.join(out, kind + '.webp'), 'WEBP', quality=80 if kind == 'body' else 84, method=6)
    print(kind, os.path.getsize(os.path.join(out, kind + '.webp')))
