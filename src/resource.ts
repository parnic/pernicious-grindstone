import { TiledMapResource } from "@excaliburjs/plugin-tiled";

const tiledMapTmx = `/tmx/stage-01.tmx`;

export const Resources = {
  tiledmap: new TiledMapResource(tiledMapTmx),
};
