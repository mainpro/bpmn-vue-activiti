import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
const path = require('path');

//直接获取文件的text
function rawTransform(fileRegex: Array<RegExp>): {
  name: string;
  transform: (src: string, id: string) => string | void;
} {
  return {
    name: 'get-file-raw',
    transform(src, id): string | void {
      if (fileRegex.filter((re) => re.test(id)).length > 0) {
        return `export default ${JSON.stringify(src)}`;
      }
    },
  };
}
export default {
  build: {
    minify: false, // 是否进行压缩,boolean | 'terser' | 'esbuild',默认使用terser
    manifest: false, // 是否产出maifest.json
    sourcemap: false, // 是否产出soucemap.json
    outDir: 'bpmnjs', // 产出目录
  },
  // outDir: 'bpmnjs',
  alias: {
    // 键必须以斜线开始和结束
    '@': path.resolve(__dirname, './src'),
  },
  base: './',
  port: 3000,
  optimizeDeps: {
    //声明深度路径模块
    include: ['bpmn-js/lib/Modeler', 'highlight.js', 'codemirror', 'codemirror/mode/xml/xml.js', 'codemirror/addon/hint/xml-hint.js', 'bpmn-js/lib/features/label-editing/LabelUtil.js'],
  },
  plugins: [vue(), rawTransform([/\.bpmn$/]), vueJsx()],
};
