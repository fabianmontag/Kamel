export const interpreterCode = `(* helper functions *)
let rec foldl f l b = match l with | [] -> b | x :: l -> foldl f l (f x b);;
let rev l = foldl (fun a b -> a :: b) l [];;

let explode s =
    let rec explode' i acc =
        if i < 0 then acc
        else explode' (i-1) (String.get s i :: acc)
    in explode' (String.length s - 1) []

let implode cl =
    let rec implode' cl s = match cl with
        | [] -> s
        | x :: cl' -> implode' cl' (s ^ (String.make 1 x))
    in implode' cl ""
;;

(* lexing *)
type lex_tkn =
    | LP | RP | COL | EQ | ARR | INT | BOOL | ANY
    | LTE | LT | GTE | GT | ADD | SUB | MUL | DIV | MOD
    | LET | REC | IN | LAM | IF | THEN | ELSE
    | ID of string | ICON of int | BCON of bool

let is_whitespace c = c = ' ' || c = '\\n' || c = '\\b' || c = '\\r'
let is_digit c = '0' <= c && c <= '9'
let is_lower c = 'a' <= c && c <= 'z'
let is_upper c = 'A' <= c && c <= 'Z'
let is_id_c c = is_digit c || is_lower c || is_upper c || c = '_' || c = '\\''
let is_id_c_start c = is_lower c || c = '_'
let int_of_c c = Char.code c - Char.code '0'
;;

let lex s =
    let rec lex' cl acc = match cl with
        | [] -> rev acc
        | '(' :: cl -> lex' cl (LP :: acc)
        | ')' :: cl -> lex' cl (RP :: acc)
        | ':' :: cl -> lex' cl (COL :: acc) 
        | '=' :: cl -> lex' cl (EQ :: acc) 
        | '-' :: '>' :: cl -> lex' cl (ARR :: acc) 
        | '<' :: '=' :: cl -> lex' cl (LTE :: acc) 
        | '<' :: cl -> lex' cl (LT :: acc)
        | '>' :: '=' :: cl -> lex' cl (GTE :: acc)
        | '>' :: cl -> lex' cl (GT :: acc)
        | '+' :: cl -> lex' cl (ADD :: acc)
        | '-' :: cl -> lex' cl (SUB :: acc)
        | '*' :: cl -> lex' cl (MUL :: acc)
        | '/' :: cl -> lex' cl (DIV :: acc)
        | c :: cl when is_digit c -> lexnum 0 (c :: cl) acc
        | c :: cl when is_id_c_start c -> lexid [c] cl acc
        | c :: cl when is_whitespace c -> lex' cl acc
        | _ -> failwith "lex: illegal character"
    and lexid id cl acc = match cl with
        | c :: cl when is_id_c c -> lexid (c :: id) cl acc
        | _ -> 
            let cont tkn = lex' cl (tkn :: acc) in
            match (implode (rev id)) with
               | "let" -> cont LET
               | "rec" -> cont REC
               | "in" -> cont IN
               | "fun" -> cont LAM
               | "if" -> cont IF
               | "then" -> cont THEN
               | "else" -> cont ELSE
               | "mod" -> cont MOD
               | "true" -> cont (BCON true)
               | "false" -> cont (BCON false)
               | "int" -> cont INT
               | "any" -> cont ANY
               | "bool" -> cont BOOL
               | id -> cont (ID id)
    and lexnum n cl acc = match cl with
        | c :: cl when is_digit c -> lexnum (n*10 + int_of_c c) cl acc
        | _ -> lex' cl (ICON n :: acc)
    in
        lex' (explode s) [];;

(* parsing *)
let is_opp_tkn tkn = match tkn with
    | LTE | LT | GTE | GT | ADD | SUB | MUL | DIV | MOD -> true
    | _ -> false

exception ExpectedToken of lex_tkn
exception ExpectedId;;

let expect_tkn tkn tkn_ls = match tkn_ls with
    | tkn' :: tkn_ls ->
        if tkn = tkn' then tkn_ls
        else raise (ExpectedToken tkn)
    | _ -> raise (ExpectedToken tkn)

let expect_id tkn_ls = match tkn_ls with
    | ID id :: tkn_ls -> (id, tkn_ls)
    | _ -> raise ExpectedId

type ast_opp = Add | Sub | Mul | Div | Mod | Lt | Lte | Gt | Gte
type ast_ty = Int | Bool | Any | Arr of ast_ty * ast_ty
type ast =
    | Icon of int | Bcon of bool | Id of string
    | Oapp of ast_opp * ast * ast
    | If of ast * ast * ast
    | Let of string * ast * ast
    | LetRec of string * string * ast_ty * ast_ty * ast * ast
    | Lam of string * ast_ty * ast
    | Fapp of ast * ast
;;

let parse tkn_ls =
    let rec parse_rec_descent tkn_ls = match tkn_ls with
        | ICON x :: tkn_ls -> (Icon x, tkn_ls)
        | BCON x :: tkn_ls -> (Bcon x, tkn_ls)
        | ID x :: tkn_ls -> (Id x, tkn_ls)
        | LP :: tkn_ls -> 
            let (e, tkn_ls) = parse_bin_op tkn_ls in
            let tkn_ls = expect_tkn RP tkn_ls in
            (e, tkn_ls) 
        | IF :: tkn_ls ->
            let (e1, tkn_ls) = parse_bin_op tkn_ls in
            let tkn_ls = expect_tkn THEN tkn_ls in
            let (e2, tkn_ls) = parse_bin_op tkn_ls in
            let tkn_ls = expect_tkn ELSE tkn_ls in
            let (e3, tkn_ls) = parse_bin_op tkn_ls in
            (If (e1, e2, e3), tkn_ls)
        | LET :: REC :: tkn_ls ->
            let (fn_id, tkn_ls) = expect_id tkn_ls in
            let tkn_ls = expect_tkn LP tkn_ls in
            let (arg_id, tkn_ls) = expect_id tkn_ls in
            let tkn_ls = expect_tkn COL tkn_ls in
            let (ty1, tkn_ls) = parse_ty tkn_ls in
            let tkn_ls = expect_tkn RP tkn_ls in
            let tkn_ls = expect_tkn COL tkn_ls in
            let (ty2, tkn_ls) = parse_ty tkn_ls in
            let tkn_ls = expect_tkn EQ tkn_ls in
            let (e1, tkn_ls) = parse_bin_op tkn_ls in
            let tkn_ls = expect_tkn IN tkn_ls in
            let (e2, tkn_ls) = parse_bin_op tkn_ls in
            (LetRec (fn_id, arg_id, ty1, ty2, e1, e2), tkn_ls)
        | LET :: tkn_ls ->
            let (id, tkn_ls) = expect_id tkn_ls in
            let tkn_ls = expect_tkn EQ tkn_ls in
            let (e1, tkn_ls) = parse_bin_op tkn_ls in
            let tkn_ls = expect_tkn IN tkn_ls in
            let (e2, tkn_ls) = parse_bin_op tkn_ls in
            (Let (id, e1, e2), tkn_ls)
        | LAM :: tkn_ls ->
            let tkn_ls = expect_tkn LP tkn_ls in
            let (id, tkn_ls) = expect_id tkn_ls in
            let tkn_ls = expect_tkn COL tkn_ls in
            let (ty, tkn_ls) = parse_ty tkn_ls in
            let tkn_ls = expect_tkn RP tkn_ls in
            let tkn_ls = expect_tkn ARR tkn_ls in
            let (e1, tkn_ls) = parse_bin_op tkn_ls in
            (Lam (id, ty, e1), tkn_ls)
        | _ -> failwith "parse: illegal token sequence"
    and parse_bin_op tkn_ls =
        let rec parse_bin_op' prp (ast, tkn_ls) = match get_opp tkn_ls with
            | Some (lp, rp, p_opp, tkn_ls') ->
                if lp < prp then (ast, tkn_ls)
                else 
                    let (ast', tkn_ls'') = parse_bin_op' rp (parse_rec_descent tkn_ls') in
                    parse_bin_op' prp (p_opp ast ast', tkn_ls'')
            | None -> (ast, tkn_ls)
        in parse_bin_op' 0 (parse_rec_descent tkn_ls)
    and create_p_opp lp rp op tkn_ls =
        Some (lp, rp, (fun e1 e2 -> Oapp (op, e1, e2)), tkn_ls)
    and create_p_fapp lp rp tkn_ls =
        Some (lp, rp, (fun e1 e2 -> Fapp (e1, e2)), tkn_ls)
    and get_opp tkn_ls = match tkn_ls with
        | ADD :: tkn_ls -> create_p_opp 2 3 Add tkn_ls
        | SUB :: tkn_ls -> create_p_opp 2 3 Sub tkn_ls
        | MUL :: tkn_ls -> create_p_opp 4 5 Mul tkn_ls
        | DIV :: tkn_ls -> create_p_opp 4 5 Div tkn_ls
        | MOD :: tkn_ls -> create_p_opp 4 5 Mod tkn_ls
        | LT :: tkn_ls -> create_p_opp 1 1 Lt tkn_ls
        | LTE :: tkn_ls -> create_p_opp 1 1 Lte tkn_ls
        | GT :: tkn_ls -> create_p_opp 1 1 Gt tkn_ls
        | GTE :: tkn_ls -> create_p_opp 1 1 Gte tkn_ls
        | ID _ :: _ -> create_p_fapp 6 7 tkn_ls
        | LP :: _ -> create_p_fapp 6 7 tkn_ls
        | ICON _ :: _ -> create_p_fapp 6 7 tkn_ls
        | BCON _ :: _ -> create_p_fapp 6 7 tkn_ls
        | _ -> None
    and parse_ty tkn_ls =
        let rec parse_ty' lt tkn_ls = match tkn_ls with
            | ARR :: tkn_ls ->
                let (rt, tkn_ls) = parse_ty tkn_ls in
                (Arr (lt, rt), tkn_ls)
            | _ -> (lt, tkn_ls)
        in match tkn_ls with
            | INT :: tkn_ls -> parse_ty' Int tkn_ls
            | BOOL :: tkn_ls -> parse_ty' Bool tkn_ls
            | ANY :: tkn_ls -> parse_ty' Any tkn_ls
            | LP :: tkn_ls -> 
                let (ty, tkn_ls) = parse_ty tkn_ls in
                let tkn_ls = expect_tkn RP tkn_ls in
                parse_ty' ty tkn_ls
            | _ -> failwith "parse: illegal token sequence, failed to parse type sequence"
    in match parse_bin_op tkn_ls with
        | (ast, []) -> ast
        | _ -> failwith "parse: illegal token sequence"
;;

type ('a, 'b) env = ('a * 'b) list

let rec update_env env k v = match env with
    | (k', v') :: env ->
        if k = k' then (k, v) :: env
        else (k', v') :: update_env env k v
    | _ -> [(k, v)]     

let rec env_has env k = match env with
    | (k', _) :: env -> k = k' || env_has env k
    | _ -> false

let rec env_get env k = match env with
    | (k', v) :: env -> 
        if k = k' then Some v
        else env_get env k
    | _ -> None

let rec check_boundness (benv: (string, bool) env) ast = match ast with
    | Icon _ | Bcon _ -> true
    | Id id -> env_has benv id
    | Oapp (_, e1, e2) -> check_boundness benv e1 && check_boundness benv e2
    | If (e1, e2, e3) ->
        check_boundness benv e1 && 
        check_boundness benv e2 &&
        check_boundness benv e3
    | Let (id, _, e1)
    | Lam (id, _, e1) ->
        check_boundness (update_env benv id true) e1
    | LetRec (fn_id, arg_id, _, _, e1, e2) ->
        check_boundness (update_env (update_env benv fn_id true) arg_id true) e1 &&
        check_boundness (update_env benv fn_id true) e2
    | Fapp (e1, e2) ->
        check_boundness benv e1 && 
        check_boundness benv e2
;;

let rec check_ty (tenv: (string, ast_ty) env) ast = match ast with
    | Icon _ -> Some Int
    | Bcon _ -> Some Bool
    | Id id -> env_get tenv id
    | If (e1, e2, e3) -> (
        match check_ty tenv e1, check_ty tenv e2, check_ty tenv e3 with
            | Some Any, _, _ -> Some Any
            | _, Some Any, _ -> Some Any
            | _, _, Some Any -> Some Any
            | Some Bool, Some t1, Some t2 when t1 = t2 -> Some t1
            | _ -> None
        )
    | Oapp (opp, e1, e2) -> (
        match opp, check_ty tenv e1, check_ty tenv e2 with
            | _, Some Any, _ -> Some Any
            | _, _, Some Any -> Some Any
            | (Add | Sub | Mul | Div | Mod), Some Int, Some Int -> Some Int
            | (Lt | Lte | Gt | Gte), Some Bool, Some Bool -> Some Bool
            | (Lt | Lte | Gt | Gte), Some Int, Some Int -> Some Bool
            | _ -> None
        )
    | Let (id, e1, e2) -> (
        let t1 = check_ty tenv e1 in match t1 with
            | Some Any -> Some Any
            | Some t -> check_ty (update_env tenv id t) e2
            | _ -> None
        )
    | LetRec (fid, argid, ty1, ty2, e1, e2) -> (
            let t2' = check_ty (update_env (update_env tenv argid ty1) fid (Arr (ty1, ty2))) e1 in
            match t2' with
                | Some Any -> Some Any
                | Some t2' when t2' = ty2 -> check_ty (update_env tenv fid (Arr (ty1, ty2))) e2
                | _ -> None
        )
    | Lam (argid, ty1, e1) -> (
            let t1 = check_ty (update_env tenv argid ty1) e1 in
            match t1 with
                | Some Any -> Some Any
                | Some t1 -> Some (Arr (ty1, t1))
                | _ -> None
        )
    | Fapp (e1, e2) -> (
            let t1 = check_ty tenv e1 in
            let t2 = check_ty tenv e2 in
            match t1, t2 with
                | Some Any, _ -> Some Any
                | _, Some Any -> Some Any
                | Some Arr (t2', t3), Some t2 when t2 = t2' -> Some t3
                | _ -> None
        )
;;

type eval_val = 
    | Ival of int 
    | Bval of bool 
    | Cl of eenv * string * ast
    | Cr of eenv * string * string * ast
and eenv = (string, eval_val) env

let rec eval (eenv: eenv) ast = match ast with
    | Icon x -> Ival x
    | Bcon x -> Bval x
    | Id x -> (
        match env_get eenv x with
            | Some v -> v
            | None -> failwith "unbound identifier"
    )
    | If (e1, e2, e3) -> (
        let v1 = eval eenv e1 in
        match v1 with
            | Bval true -> eval eenv e2
            | Bval false -> eval eenv e3
            | _ -> failwith "eval: illegal value"
    )
    | Oapp (opp, e1, e2) -> (match opp, eval eenv e1, eval eenv e2 with
        | Add, Ival x, Ival y -> Ival (x + y)
        | Sub, Ival x, Ival y -> Ival (x - y)
        | Mul, Ival x, Ival y -> Ival (x * y)
        | Div, Ival x, Ival y -> Ival (x / y)
        | Mod, Ival x, Ival y -> Ival (x mod y)
        | Lt, Ival x, Ival y -> Bval (x < y)
        | Lte, Ival x, Ival y -> Bval (x <= y)
        | Gt, Ival x, Ival y -> Bval (x > y)
        | Gte, Ival x, Ival y -> Bval (x >= y)
        | Lt, Bval x, Bval y -> Bval (x < y)
        | Lte, Bval x, Bval y -> Bval (x <= y)
        | Gt, Bval x, Bval y -> Bval (x > y)
        | Gte, Bval x, Bval y -> Bval (x >= y)
        | _ -> failwith "eval: illegal value"
    )
    | Let (x, e1, e2) ->
        let v1 = eval eenv e1 in
        eval (update_env eenv x v1) e2
    | Lam (x, _, e1) ->
        Cl (eenv, x, e1)
    | LetRec (fid, argid, fty, argty, e1, e2) ->
        eval (update_env eenv fid (Cr (eenv, fid, argid, e1))) e2
    | Fapp (e1, e2) -> (
        let v1 = eval eenv e1 in
        let v2 = eval eenv e2 in
        match v1 with
            | Cl (eenv', x, e1) ->
                eval (update_env eenv' x v2) e1
            | Cr (eenv', f, x, e1) ->
                eval (update_env (update_env eenv' f v1) x v2) e1
            | _ -> failwith "illegal value"
    )
;;      

let run code =
    let tkn_seq = lex code in
    let ast = parse tkn_seq in
    if check_boundness [] ast then
        if check_ty [] ast <> None then eval [] ast
        else failwith "typechecking failed"
    else failwith "some variables are not bound"
;;

run "
    let fact =
        (fun (f: any) -> (fun (x: any) -> fun (a: any) -> f (x x) a) (fun (x: any) -> fun (a: any) -> f (x x) a))
        (fun (f: int -> int) -> fun (n: int) -> if n < 2 then 1 else n * f (n-1))
    in fact 20
";;
`;
