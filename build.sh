nix-shell --command "for f in {erd, init}; do mmdc -i $f -t neutral -e pdf; done"
