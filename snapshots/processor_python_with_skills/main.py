from cyanprintsdk.domain.core.cyan_script_model import CyanProcessorInput
from cyanprintsdk.domain.core.fs.cyan_fs_helper import CyanFileHelper
from cyanprintsdk.domain.processor.output import ProcessorOutput
from cyanprintsdk.main import start_processor_with_fn


async def processor(i: CyanProcessorInput, fs: CyanFileHelper) -> ProcessorOutput:
    return ProcessorOutput(directory=i.write_dir)


start_processor_with_fn(processor)
