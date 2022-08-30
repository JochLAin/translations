import type { CatalogType } from "@jochlain/translations";
import { MacroParams } from "babel-plugin-macros";
declare type LoaderType = {
    extension: RegExp;
    load: (content: string) => CatalogType;
};
declare const _default: (loader: LoaderType) => ({ babel, config, references }: typeof MacroParams) => void;
export default _default;
