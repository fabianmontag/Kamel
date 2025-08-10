# how to build own toplevel

-   (recommended for VSCode: OCaml Platform Extension with `opam install ocaml-lsp-server ocamlformat`, .ocamlformat is important for formatting to work properly)
-   install opam (https://opam.ocaml.org)
-   install dune (https://dune.build)
-   install deps: `opam install . --deps-only` (https://ocaml.org/docs/managing-dependencies)
-   build: dune build
-   toplevel.js should be in `_build/default/bin/toplevel.js`
