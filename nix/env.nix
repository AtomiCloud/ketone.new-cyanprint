{ pkgs, packages }:
with packages;
{
  system = [
    coreutils
    sd
    bash
    findutils
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

  ci = [

  ];

  releaser = [
    nodejs
    sg
    npm
  ];

}
