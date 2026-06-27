{ treefmt-nix, pkgs, ... }:
let
  fmt = {
    projectRootFile = "flake.nix";

    # enable or disable formatters, see https://github.com/numtide/treefmt-nix#supported-programs
    programs = {
      nixpkgs-fmt.enable = true;
      prettier.enable = true;
      # nixos-26.05 removed `pkgs.nodePackages`; prettier is now a top-level package.
      # Override treefmt-nix's default (which still points at nodePackages.prettier).
      prettier.package = pkgs.prettier;
      shfmt.enable = true;
      gofmt.enable = true;
      actionlint.enable = true;
    };


  };
in
(treefmt-nix.lib.evalModule pkgs fmt).config.build.wrapper


