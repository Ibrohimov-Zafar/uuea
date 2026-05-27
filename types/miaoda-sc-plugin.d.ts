declare module "miaoda-sc-plugin" {
  import type { Plugin } from "vite";

  export interface MiaodaDevPluginOptions {
    appType?: "web" | "miniapp";
    cdnBase?: string;
  }

  export function miaodaDevPlugin(
    options?: MiaodaDevPluginOptions,
  ): Plugin[];
}
