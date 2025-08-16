import "./toplevel.js";

export interface ToplevelWorkerEvalAction {
    type: "eval";
    code: string;
}
export interface ToplevelWorkerResetAction {
    type: "reset";
}
export type ToplevelWorkerAction = ToplevelWorkerEvalAction | ToplevelWorkerResetAction;

export type ToplevelWorkerEvalActionOutput =
    | {
          type: "eval";
          result: ToplevelEvalResult;
          success: true;
      }
    | {
          type: "eval";
          success: false;
          errMsg?: string;
      };

export interface ToplevelWorkerResetActionOutput {
    type: "reset";
    success: boolean;
}

export interface ToplevelWorkerInvalidActionOutput {
    type: "invalid";
    success: false;
}

export type ToplevelWorkerActionOutput =
    | ToplevelWorkerEvalActionOutput
    | ToplevelWorkerResetActionOutput
    | ToplevelWorkerInvalidActionOutput;

self.onmessage = (d: MessageEvent<ToplevelWorkerAction>) => {
    const action = d.data;

    const getResp = (): ToplevelWorkerActionOutput => {
        try {
            if (action.type == "eval") {
                const result = toplevel.evalCode(action.code);

                return {
                    type: "eval",
                    result,
                    success: true,
                };
            } else if (action.type == "reset") {
                toplevel.reset();

                return {
                    type: "reset",
                    success: true,
                };
            }
        } catch (err) {
            return {
                type: action.type,
                success: false,
            };
        }

        return {
            type: "invalid",
            success: false,
        };
    };

    self.postMessage(getResp());
};
