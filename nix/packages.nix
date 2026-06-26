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
        poetry = (poetry.override { python3 = python312; });

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
