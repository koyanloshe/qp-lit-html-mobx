import { html, render, RootPart } from "lit-html";
import { useEffect, useRef } from "react";

export function reactComponent<Props>(litComponent: (props: Props) => unknown) {
  return (props: Props) => {
    const ref = useRef(null);
    const part = useRef<RootPart>();
    useEffect(() => {
      if (ref.current) {
        part.current = render(html`${litComponent(props)}`, ref.current);
      }
    }, [props]);
    useEffect(() => () => part.current.setConnected(false), []);
    return <div ref={ref}></div>;
  };
}
