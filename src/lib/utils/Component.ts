import { noChange, nothing } from "lit-html";
import {
  directive,
  Directive,
  DirectiveParameters,
  ElementPart,
  Part
} from "lit-html/directive";
import { unsafeStatic } from "lit-html/static";
import { AsyncDirective, PartInfo } from "lit-html/async-directive";
import { RefOrCallback, ref as litRef } from "lit-html/directives/ref";
import { Reaction } from "mobx";
import _ from "lodash";

export function ref(r: RefOrCallback | undefined) {
  return r ? litRef(r) : nothing;
}

class SpreadDirective extends Directive {
  prevProps = new Map();
  render(props: Record<string, any> | undefined) {
    if (!props) return nothing;
    return unsafeStatic(
      Object.entries(props)
        .filter(([k, v]) => v != null && v !== nothing && v !== false)
        .map(([k, v]) => (v === true ? k : `${k}="${_.escape(String(v))}"`))
        .join(" ")
    );
  }
  update(part: Part, [props]: DirectiveParameters<this>) {
    const newProps: Map<string, any> = new Map(Object.entries(props ?? {}));
    const element = (part as ElementPart).element;
    this.prevProps.forEach((v, k) => {
      const vn = newProps.get(k);
      if (vn == null || vn === nothing || vn === false)
        element.removeAttribute(k);
    });

    newProps.forEach((vn, k) => {
      const v = this.prevProps!.get(k);
      if (vn != null && vn !== nothing && v !== vn && vn !== false)
        element.setAttribute(k, vn === true ? "" : String(vn));
    });
    this.prevProps = newProps;
    return noChange;
  }
}
export const spread = directive(SpreadDirective);

interface State<Props> {
  render(props: Props): unknown;
  disconnected?(): void;
  reconnected?(): void;
}

interface StateConstructor<Props> {
  new (initialProps: Props): State<Props>;
}

export function component<Props>(cls: StateConstructor<Props>) {
  class ComponentDirective extends AsyncDirective {
    constructor(partInfo: PartInfo) {
      super(partInfo);
      this._connect();
    }
    private reaction!: Reaction;
    private _connect() {
      this.reaction = new Reaction(this.constructor.name, this.rerender);
    }

    private _props!: Props;
    private state?: State<Props>;

    render(props: Props) {
      this._props = props;
      if (this.state === undefined) this.state = new cls(props);
      let result;
      this.reaction.track(() => {
        result = this.state!.render(this._props);
      });
      return result;
    }
    readonly rerender = () => {
      this.setValue(this.render(this._props));
    };

    disconnected() {
      if (this.state?.disconnected) this.state.disconnected();
      this.reaction.dispose();
    }
    reconnected() {
      this._connect();
      if (this.state?.reconnected) this.state.reconnected();
    }
  }

  return directive(ComponentDirective);
}
