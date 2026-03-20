from cyanprintsdk.main import start_template_with_fn
from cyanprintsdk.domain.core.inquirer import IInquirer
from cyanprintsdk.domain.core.deterministic import IDeterminism
from cyanprintsdk.domain.core.cyan import Cyan, CyanProcessor, CyanGlob, GlobType


async def template(i: IInquirer, d: IDeterminism) -> Cyan:
    name = await i.text("Project name", "cyan/new/name")
    description = await i.text("Project description", "cyan/new/description")
    open_var = "{" + "{"
    close_var = "}" + "}"

    return Cyan(
        processors=[
            CyanProcessor(
                name="cyan/default",
                files=[
                    CyanGlob(
                        root="templates",
                        glob="**/*",
                        type=GlobType.Template,
                        exclude=[],
                    ),
                ],
                config={
                    "vars": {"projectName": name, "projectDescription": description},
                    "parser": {
                        "varSyntax": [
                            [open_var, close_var],
                            ["// " + open_var, close_var],
                            ["# " + open_var, close_var],
                        ],
                    },
                },
            ),
        ],
        plugins=[],
    )

start_template_with_fn(template)
