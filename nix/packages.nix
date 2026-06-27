{ pkgs, pkgs-2605, pkgs-unstable, atomi }:
let

  all = {
    atomipkgs = (
      with atomi;
      {
        inherit
          infrautils
          infralint
          atomiutils
          sg
          pls;
      }
    );
    nix-unstable = (
      with pkgs-unstable;
      { }
    );
    nix-2605 = (
      with pkgs-2605;
      {

        inherit

          git

          infisical
          bun
          biome
          typescript-language-server

          treefmt
          shellcheck

          gitlint

          golangci-lint
          go

          # poetry stays on its default (cached) interpreter. Overriding its
          # python3 to python312 rebuilds poetry's entire closure from source,
          # which then runs each dependency's test suite on the non-sandboxed
          # CI runner where env-sensitive ones fail (python-dotenv reads
          # $HOME/.env, dulwich reads the global git config). poetry-the-tool
          # need not share the project's interpreter.
          poetry
          ;

        python = python312;

        nodejs = nodejs_22;
        dotnet = dotnet-sdk_8;
      }
    );
  };
in
with all;
nix-2605 //
nix-unstable //
atomipkgs
