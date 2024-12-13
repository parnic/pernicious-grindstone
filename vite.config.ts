import type { UserConfig } from 'vite'

// const tiledPlugin = () => {
//   return {
//       name: 'tiled-tileset-plugin',
//       resolveId: {
//           order: 'pre',
//           handler(sourceId, importer, options) {
//               if (!sourceId.endsWith(".tsx")) return;
//               return { id: 'tileset:' + sourceId, external: 'relative' }
//           }
//       }
//   };
// }

export default {
  base: '/pernicious-grindstone/',
  // plugins: [tiledPlugin()], // hint vite that tiled tilesets should be treated as external
  optimizeDeps: {
      exclude: ["excalibur"],
  },
  build: {
    assetsInlineLimit: 0,
    sourcemap: true
  }
} satisfies UserConfig
