{
  description = "CyanPrint Plugin";
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";

    # CyanPrint CLI — provides `cyanprint` for the CI `test` and `publish` jobs.
    cyanprint.url = "github:AtomiCloud/sulfone.iridium/v2.22.0";

    # registry
    nixpkgs-2605.url = "github:NixOS/nixpkgs/nixos-26.05";
    atomipkgs.url = "github:AtomiCloud/nix-registry/v3";
  };
  outputs =
    { self
    , flake-utils
    , cyanprint
    , nixpkgs-2605
    , atomipkgs
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs-2605.legacyPackages.${system};
        atomi = atomipkgs.packages.${system};
        tools = [
          cyanprint.packages.${system}.default
          atomi.atomiutils
          pkgs.git
        ];
      in
      {
        devShells = {
          default = pkgs.mkShell { buildInputs = tools; };
          # `nix develop .#ci` is what the generated GitHub Actions CI runs.
          ci = pkgs.mkShell { buildInputs = tools; };
        };
      }
    );
}
