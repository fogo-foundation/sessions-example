{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ...  }: let
    project-shell-overlay = system: final: _: {
      project-shell = final.mkShell {
        FORCE_COLOR = 1;
        PUPPETEER_SKIP_DOWNLOAD = 1;
        PUPPETEER_EXECUTABLE_PATH = final.lib.getExe final.chromium;
        name = "project-shell";
        buildInputs = [
          final.git
          final.nodejs
          final.pnpm
          final.python3
          final.libusb1
        ];
      };
    };
  in
    (flake-utils.lib.eachDefaultSystem
      (
        system: let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [(project-shell-overlay system)];
            config = {};
          };
        in {
          packages = {
            inherit (pkgs) cli project-shell;
          };
          devShells.default = pkgs.project-shell;
        }
      ))
    // {
      overlays.project-shell = project-shell-overlay;
    };
}
