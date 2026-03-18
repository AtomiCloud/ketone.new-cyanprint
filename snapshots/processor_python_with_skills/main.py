import aiohttp.web
import os
import shutil

_orig_json = aiohttp.web.Request.json

async def _patched_json(self, *args, **kwargs):
    data = await _orig_json(self, *args, **kwargs)
    for g in data.get("globs", []):
        if isinstance(g, dict):
            g.setdefault("root", None)
            g.setdefault("exclude", [])
    return data

aiohttp.web.Request.json = _patched_json

from cyanprintsdk.domain.core.cyan_script_model import CyanProcessorInput
from cyanprintsdk.domain.core.fs.cyan_fs_helper import CyanFileHelper
from cyanprintsdk.domain.processor.output import ProcessorOutput
from cyanprintsdk.main import start_processor_with_fn


async def processor(i: CyanProcessorInput, fs: CyanFileHelper) -> ProcessorOutput:
    if os.path.exists(fs.read_dir):
        for root, dirs, files in os.walk(fs.read_dir):
            for file in files:
                src = os.path.join(root, file)
                rel = os.path.relpath(src, fs.read_dir)
                dst = os.path.join(fs.write_dir, rel)
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.copy2(src, dst)
    return ProcessorOutput(directory=i.write_dir)


start_processor_with_fn(processor)
