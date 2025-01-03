open Js_of_ocaml
open Js_of_ocaml_tyxml
open Js_of_ocaml_toplevel

let reset () = JsooTop.initialize ()

(* error highlight *)
let rec iter_on_sharp ~f x =
  Js.Opt.iter (Dom_html.CoerceTo.element x) (fun e ->
      if Js.to_bool (e##.classList##contains (Js.string "sharp")) then f e);
  match Js.Opt.to_option x##.nextSibling with
  | None -> ()
  | Some n -> iter_on_sharp ~f n

let current_position = ref 0

let highlight_location output loc =
  let x = ref 0 in
  let first =
    Js.Opt.get (output##.childNodes##item !current_position) (fun _ -> assert false)
  in
  iter_on_sharp first ~f:(fun e ->
      incr x;
      let _file1, line1, col1 = Location.get_pos_info loc.Location.loc_start in
      let _file2, line2, col2 = Location.get_pos_info loc.Location.loc_end in
      if !x >= line1 && !x <= line2
      then
        let from_ = if !x = line1 then `Pos col1 else `Pos 0 in
        let to_ = if !x = line2 then `Pos col2 else `Last in
        Colorize.highlight from_ to_ e)

(* create new output line *)
let append colorize cb cl s =
  if s <> "" && s <> "\n" && s <> " " && s <> "\t" then
    cb (Tyxml_js.To_dom.of_element (colorize ~a_class:cl s))
  else ()

let setup cb =
  JsooTop.initialize ();
  let sharp_chan = open_out "/dev/null0" in
  let sharp_ppf = Format.formatter_of_out_channel sharp_chan in
  let caml_chan = open_out "/dev/null1" in
  let caml_ppf = Format.formatter_of_out_channel caml_chan in
  let execute code output =
    let code' =
      let len = String.length code in
      if
        try code <> "" && code.[len - 1] <> ';' && code.[len - 2] <> ';'
        with _ -> true
      then code ^ ";;" else code
    in
    let hl = highlight_location output in
    JsooTop.execute true ~pp_code:sharp_ppf ~highlight_location:hl caml_ppf code';
    true
  in
  Sys_js.set_channel_flusher caml_chan (append Colorize.ocaml cb "caml");
  Sys_js.set_channel_flusher sharp_chan (append Colorize.ocaml cb "sharp");
  Sys_js.set_channel_flusher stdout (append Colorize.text cb "stdout");
  Sys_js.set_channel_flusher stderr (append Colorize.text cb "stderr");
  execute

let () =
  Js_of_ocaml.Js.export
    "toplevel"
    (object%js
       val reset = reset
       val setup = setup
    end)