from cyanprintsdk.domain.core.question import TextQ
from cyanprintsdk.main import start_template_with_fn
from cyanprintsdk.domain.core.inquirer import IInquirer
from cyanprintsdk.domain.core.deterministic import IDeterminism
from cyanprintsdk.domain.core.cyan import Cyan, CyanProcessor, CyanGlob, GlobType


def validate(v):
    try:
        n = int(v)
        if n < 19:
            return "Age needs to be larger than 19"
        if n > 150:
            return "Age needs to be less than 150"
        return None
    except ValueError:
        return "Please enter a number"


async def template(i: IInquirer, d: IDeterminism) -> Cyan:
    name = await i.text("What is your name?")
    age = await i.text(TextQ(
        message="What is your age?",
        validate=validate,
    ))

    return Cyan(
        processors=[
            CyanProcessor(
                name="cyan/default:7",
                files=[
                    CyanGlob(
                        root=".",
                        glob="**/*",
                        exclude=["scripts"],
                        type=GlobType.Template
                    ),
                ],
                config={
                    "vars": {
                        "name": name,
                        "age": age,
                    },
                    "parser": {
                        "varSyntax": [
                            ["{{", "}}"],
                        ]
                    }
                },
            ),
        ],
        plugins=[

        ],
    )


start_template_with_fn(template)
