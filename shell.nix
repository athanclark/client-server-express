{ pkgs ? import <nixpkgs> {} }:
  pkgs.mkShell {
    nativeBuildInputs = [
      pkgs.postgresql
      pkgs.mermaid-cli
    ];
  }
