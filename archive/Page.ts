import { html, render } from "lit-html";
import { createRef } from "lit-html/directives/ref";
import { action, makeObservable, observable } from "mobx";
import { Button } from "../Components/Button";
import { component } from "./Component";

class PageState {
  constructor() {
    makeObservable(this);
  }

  @observable
  disabled = false;

  @action.bound
  toggleEnabled() {
    this.disabled = !this.disabled;
  }

  render({ name }: { name: string }) {
    console.log("rendering page");
    return html`<div>
      Hello ${name} ${SharedStateContainer(this)}
      <p>The button is ${this.disabled ? "disabled" : "enabled"}</p>
    </div>`;
  }
}
export const Page = component(PageState);

const SharedStateContainer = component(
  class _SharedStateContainer {
    render(pageState: PageState) {
      console.log("rendering container");
      return html`<div
        style="display:flex;flex-direction:column; align-items: flex-start"
      >
        ${Button({
          text: pageState.disabled ? "Enable" : "Disable",
          onClick: pageState.toggleEnabled,
          rootAttributes: {
            type: "submit"
          }
        })}
        ${Button({
          text: "Click",
          rootAttributes: { disabled: pageState.disabled }
        })}
      </div>`;
    }
  }
);
