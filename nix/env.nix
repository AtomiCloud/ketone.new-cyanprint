{ pkgs, packages }:
with packages;
{
  system = [
    atomiutils
  ];

  dev = [
    pls
    git
    sg
  ];

  main = [
    python
    poetry

    cyanprint

    go

    dotnet

    nodejs
    infisical
    bun
  ];

  lint = [
    # core
    treefmt
    shellcheck
    golangci-lint
    gitlint
    infralint
    sg
  ];

  releaser = [
    sg
  ];
}
