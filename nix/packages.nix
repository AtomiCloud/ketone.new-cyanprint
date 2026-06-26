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
          ;

        python = python312;
        # python-dotenv 1.2.2's test suite reads $HOME/.env, which fails the
        # from-source build in the non-sandboxed CI runner (it finds
        # /home/runner/.env and expects none). Skip its tests so poetry's
        # closure builds on the 26.05 baseline.
        poetry = (poetry.override {
          python3 = python312.override {
            packageOverrides = _final: prev: {
              python-dotenv = prev.python-dotenv.overridePythonAttrs (_: { doCheck = false; });
            };
          };
        });

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
