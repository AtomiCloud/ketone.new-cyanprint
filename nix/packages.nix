{ pkgs, atomi, pkgs-2411 }:
let
  all = {
    atomipkgs = (
      with atomi;
      {
        inherit
          atomiutils
          pls
          sg;
      }
    );
    nix-2411 = (
      with pkgs-2411;
      {
        inherit
          infisical
          hadolint
          bun
          sd
          git
          # lint
          treefmt
          gitlint
          shellcheck

          # dotnet
          # go
          golangci-lint
          go


          #infra
          docker
          ;

        python = python312;
        poetry = (poetry.override { python3 = python311; });

        nodejs = nodejs_20;
        dotnet = dotnet-sdk_9;
      }
    );
  };
in
with all;
atomipkgs //
nix-2411
