import type { Plugin } from 'vite';

/**
 * Custom plugin to fix asset paths for GitHub Pages deployment
 */
export function fixAssetPaths(): Plugin {
  return {
    name: 'fix-asset-paths',
    enforce: 'post',
    // Transform HTML after Vite processes it
    transformIndexHtml(html) {
      // Fix asset paths in production builds for GitHub Pages
      if (process.env.NODE_ENV === 'production') {
        // Fix CSS links - make sure they point to the right place
        html = html.replace(
          /href="\/vue-multilang\//g, 
          'href="'
        );
        
        // Fix JS script sources - make sure they point to the right place
        html = html.replace(
          /src="\/vue-multilang\//g, 
          'src="'
        );
      }
      return html;
    }
  };
}
