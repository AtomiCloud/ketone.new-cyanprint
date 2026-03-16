from cyanprintsdk.main import start_template_with_fn
from cyanprintsdk.domain.core.inquirer import IInquirer
from cyanprintsdk.domain.core.deterministic import IDeterminism
from cyanprintsdk.domain.core.cyan import Cyan, CyanProcessor


async def template(i: IInquirer, d: IDeterminism) -> Cyan:
    return Cyan(
        processors=[
# {{processorsConfig}}
        ],
        plugins=[
# {{pluginsConfig}}
        ],
    )

start_template_with_fn(template)
