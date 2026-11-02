from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import re
import shutil

SITE = Path(__file__).resolve().parent
VIDEO = SITE / "assets" / "background.mp4"


class PreviewHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        self.range_length = None
        if urlsplit(self.path).path != "/assets/background.mp4":
            return super().send_head()

        video = VIDEO.open("rb")
        size = VIDEO.stat().st_size
        start, end = 0, size - 1
        requested = self.headers.get("Range")
        if requested:
            match = re.fullmatch(r"bytes=(\d*)-(\d*)", requested)
            if not match or not any(match.groups()):
                video.close()
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{size}")
                self.end_headers()
                return None
            first, last = match.groups()
            if first:
                start = int(first)
                if last:
                    end = min(end, int(last))
            else:
                start = max(0, size - int(last))
            if start >= size or start > end:
                video.close()
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{size}")
                self.end_headers()
                return None
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        else:
            self.send_response(200)
        self.range_length = end - start + 1
        self.send_header("Content-Type", "video/mp4")
        self.send_header("Content-Length", str(self.range_length))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        video.seek(start)
        return video

    def copyfile(self, source, outputfile):
        if self.range_length is None:
            return shutil.copyfileobj(source, outputfile)
        remaining = self.range_length
        while remaining:
            chunk = source.read(min(1024 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


handler = partial(PreviewHandler, directory=str(SITE))
ThreadingHTTPServer(("127.0.0.1", 8000), handler).serve_forever()
