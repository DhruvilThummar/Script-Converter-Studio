# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
  ];

  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];

    # Enable previews
    previews = {
      enable = true;
      previews = {
        react-app = {
          command = ["npm" "--prefix" "react-ts-app" "start"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
        angular-app = {
          command = ["npm" "--prefix" "angular-app" "start"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        npm-install-react = "npm --prefix react-ts-app install";
        npm-install-angular = "npm --prefix angular-app install";
      };
      # Runs when the workspace is (re)started)
      onStart = {};
    };
  };
}
