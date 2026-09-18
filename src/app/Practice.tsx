import { Terminal } from "../terminal/Terminal";
import { useRepo } from "./store";

export function Practice() {
  const { state, exec } = useRepo();

  return (
    <div className="space-y-6">
      <Terminal
        output={state.output}
        onExecute={exec}
      />
    </div>
  );
}