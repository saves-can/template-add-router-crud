import * as denojson from "../deno.json" assert { type: "json" };

const PROXY_DB =
  "prisma://aws-us-east-1.prisma-data.com/?api_key=mY4engKpoOtH3QVxb9NWeTZ_NWpEeoT6CcLwsDAtpsefXTby_mpAjYXQj1qLL0yF";

const { name, version } = denojson.default;

export default {
  name,
  version,
  PROXY_DB,
};
