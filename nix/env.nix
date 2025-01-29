{ pkgs, packages }:
with packages;
{
  system = [
    atomiutils
    sd
  ];

  dev = [
    pls
    git
  ];

  infra = [
    docker
  ];

  main = [
    python
    poetry

    cyanprint

    go

    dotnet

    nodejs
    bun

    infisical
  ];

  lint = [
    # core
    treefmt
    hadolint
    gitlint
    shellcheck
    sg
    golangci-lint
  ];

}
