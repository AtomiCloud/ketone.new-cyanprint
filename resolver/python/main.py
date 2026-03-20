from cyanprintsdk.domain.resolver.input import ResolverInput
from cyanprintsdk.domain.resolver.output import ResolverOutput
from cyanprintsdk.main import start_resolver_with_fn


async def resolver(i: ResolverInput) -> ResolverOutput:
    # Process files and return resolved output
    # Note: Resolver returns a single output; the engine may call this multiple times
    file = i.files[0] if i.files else None
    if file:
        return ResolverOutput(path=file.path, content=file.content)
    return ResolverOutput(path="", content="")


start_resolver_with_fn(resolver)
