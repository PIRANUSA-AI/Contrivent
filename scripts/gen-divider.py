# Generate divider artwork with Qwen (qwen-image-3.0-pro) and make it loop seamlessly.
#
#   python scripts/gen-divider.py --id d1 --prompt "..." [--size 1664*928]
#
# Reads QWEN_API_KEY from .env.qwen (gitignored). Saves:
#   generated/<id>.png        raw model output
#   generated/<id>-loop.webp  edge-blended, tiles perfectly on repeat-x
import argparse, json, os, re, sys, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = os.path.join(ROOT, ".env.qwen")
OUT = os.path.join(ROOT, "generated")
API = "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation"


def read_key():
    for line in open(ENV):
        m = re.match(r"QWEN_API_KEY=(\S+)", line.strip())
        if m:
            return m.group(1)
    sys.exit("QWEN_API_KEY not found in .env.qwen")


def find_image_url(obj):
    """Recursively hunt the first http(s) image URL in the response JSON."""
    if isinstance(obj, str):
        return obj if re.match(r"https?://.*\.(png|jpg|jpeg|webp)", obj, re.I) else None
    if isinstance(obj, dict):
        for v in obj.values():
            if (u := find_image_url(v)):
                return u
    if isinstance(obj, list):
        for v in obj:
            if (u := find_image_url(v)):
                return u
    return None


def generate(key, prompt, size):
    body = json.dumps(
        {
            "model": "qwen-image-3.0-pro",
            "input": {"messages": [{"role": "user", "content": [{"text": prompt}]}]},
            "parameters": {"prompt_extend": True, "size": size, "watermark": False},
        }
    ).encode()
    req = urllib.request.Request(API, data=body, headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"})
    with urllib.request.urlopen(req, timeout=300) as res:
        data = json.load(res)
    url = find_image_url(data)
    if not url:
        sys.exit("No image URL in response:\n" + json.dumps(data, indent=2)[:2000])
    print("image url:", url)
    raw = os.path.join(OUT, f"{args_id}.png")
    urllib.request.urlretrieve(url, raw)
    return raw


def make_loop(src, dst, blend=0.12):
    """Wrap-blend left/right edges so repeat-x has no visible seam."""
    from PIL import Image, ImageChops

    im = Image.open(src).convert("RGB")
    w, h = im.size
    b = int(w * blend)
    # Cross-fade the outer b px of each side against the opposite edge.
    left = im.crop((0, 0, b, h))
    right = im.crop((w - b, 0, w, h))
    grad = Image.new("L", (b, h))
    gp = grad.load()
    for x in range(b):
        v = int(255 * x / b)
        for y in range(0, h, 1):
            gp[x, y] = v
    merged_left = Image.composite(right, left, Image.eval(grad, lambda v: 255 - v))
    merged_right = Image.composite(left, right, grad)
    im.paste(merged_left, (0, 0))
    im.paste(merged_right, (w - b, 0))
    im.save(dst, "WEBP", quality=82, method=6)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True)
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--size", default="1664*928")
    a = ap.parse_args()
    args_id = a.id
    os.makedirs(OUT, exist_ok=True)
    t0 = time.time()
    raw = generate(read_key(), a.prompt, a.size)
    loop = os.path.join(OUT, f"{a.id}-loop.webp")
    make_loop(raw, loop)
    print(f"\nRAW : {raw}\nLOOP: {loop}\n({time.time() - t0:.0f}s)")
