import "react-icons";

declare module "react-icons/lib" {
  export type IconType = (
    props: import("react-icons/lib").IconBaseProps
  ) => JSX.Element;
}
