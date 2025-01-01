from cyanprintsdk.domain.core.cyan_script_model import CyanPluginInput
from cyanprintsdk.domain.plugin.output import PluginOutput
from cyanprintsdk.main import start_plugin_with_fn


async def plugin(i: CyanPluginInput) -> PluginOutput:
    return PluginOutput(directory=i.directory)


start_plugin_with_fn(plugin)
