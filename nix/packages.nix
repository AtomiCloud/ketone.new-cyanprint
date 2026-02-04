{ pkgs, pkgs-2511, pkgs-unstable, atomi }:
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
    nix-2511 = (
      with pkgs-2511;
      {

        inherit

          git

          infisical
          bun
          biome

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
nix-2511 //
nix-unstable //
atomipkgs
