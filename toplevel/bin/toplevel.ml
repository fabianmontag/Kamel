open Js_of_ocaml
open Js_of_ocaml_toplevel

(* reset toplevel instance *)
let reset () = JsooTop.initialize ()

(* let evalCode code' =
  (* assure safe code format for executing *)
  let code =
    let len = String.length code' in
    if
      try code' <> "" && code'.[len - 1] <> ';' && code'.[len - 2] <> ';'
      with _ -> true
    then code' ^ ";;"
    else code'
  in

  (* create buffers to capture output from channels *)
  let stdout_buf = Buffer.create 128 in
  let stderr_buf = Buffer.create 128 in
  let toplevel_buf = Buffer.create 128 in

  Sys_js.set_channel_flusher stdout (Buffer.add_string stdout_buf);
  Sys_js.set_channel_flusher stderr (Buffer.add_string stderr_buf);

  (* Use toplevel formatter on our custom buffer *)
  let formatter = Format.formatter_of_buffer toplevel_buf in

  (*
    try to execute, use try/catch because this can actually fail:
    e.g.: variable escape, code: "fun (x, y) -> x y;;"
  *)
  let evalFailed = ref false in
  (try JsooTop.execute true formatter code with _ -> evalFailed := true);

  let out_str = Buffer.contents stdout_buf in
  let err_str = Buffer.contents stderr_buf in
  let tl_str = Buffer.contents toplevel_buf in

  Buffer.clear stdout_buf;
  Buffer.clear stderr_buf;
  Buffer.clear toplevel_buf;

  (* (Js.string tl_str, Js.string out_str, Js.string err_str, !evalFailed) *)
  object%js
    val evalFailed = !evalFailed
    val stdout = out_str
    val stderr = err_str
    val tlout = tl_str
  end *)

(* event type we’ll export to JS *)
type event = { kind : string; chunk : string; seq : int }

(* Unified, ordered capture of stdout/stderr/JsooTop output *)
let evalCode code' =
  (* normalize code to ensure it ends with ";;" safely *)
  let code =
    let len = String.length code' in
    if
      try code' <> "" && code'.[len - 1] <> ';' && code'.[len - 2] <> ';'
      with _ -> true
    then code' ^ ";;"
    else code'
  in

  let seq = ref 0 in
  let events : event list ref = ref [] in
  let push kind chunk =
    if chunk <> "" && chunk <> "\n" && chunk <> " " && chunk <> "\t" then (
      incr seq;
      events := { kind; chunk; seq = !seq } :: !events)
  in

  (* set up unified flushers for stdout/stderr *)
  Sys_js.set_channel_flusher stdout (push "stdout");
  Sys_js.set_channel_flusher stderr (push "stderr");

  (* make a formatter that writes into our stream as "toplevel" *)
  let outc = ref "" in
  let fmt_out s ofs len = outc := !outc ^ String.sub s ofs len in
  let fmt_flush () =
    push "toplevel" !outc;
    outc := ""
  in
  let formatter = Format.make_formatter fmt_out fmt_flush in

  (* run the code, marking start/end + catching hard failures *)
  let evalFailed = ref false in
  (try ignore (JsooTop.execute true formatter code)
   with _ ->
     evalFailed := true;
     push "exception" "JsooTop.execute raised");

  (* ensure formatter flush (Format doesn’t auto-flush on its own) *)
  Format.pp_print_flush formatter ();

  let ordered = List.rev !events in

  (* build a JS array of objects *)
  let js_events =
    ordered
    |> List.map (fun e ->
           object%js
             val kind = e.kind
             val chunk = e.chunk
             val seq = e.seq
           end)
    |> Array.of_list |> Js.array
  in

  object%js
    val evalFailed = !evalFailed
    val events = js_events
  end

(* global interface *)
let () =
  Js_of_ocaml.Js.export "toplevel"
    (object%js
       val compiledOcamlVersion = Sys.ocaml_version
       val compiledJsOfOcamlVersion = Sys_js.js_of_ocaml_version
       val reset = reset
       val evalCode = evalCode
    end)
