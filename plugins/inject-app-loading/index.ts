import type { PluginOption } from 'vite'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * 用于生成将loading样式注入到项目中
 * 为多app提供loading样式，无需在每个 app -> index.html单独引入
 */
async function viteInjectAppLoadingPlugin(
  isBuild: boolean,
  env: Record<string, any> = {},
  loadingTemplate = 'loading.html',
): Promise<PluginOption | undefined> {
  const loadingHtml = await getLoadingRawByHtmlTemplate(loadingTemplate)
  const version = '2.4.0'
  const envRaw = isBuild ? 'prod' : 'dev'
  const cacheName = `'${env.VITE_APP_NAMESPACE}-${version}-${envRaw}-preferences-theme'`

  // 获取缓存的主题
  // 保证黑暗主题下，刷新页面时，loading也是黑暗主题
  const injectScript = `
  <script data-app-loading="inject-js">
  const theme = localStorage.getItem(${cacheName})
  document.documentElement.classList.toggle('dark', /dark/.test(theme));
</script>
`

  if (!loadingHtml) {
    return
  }

  return {
    enforce: 'pre',
    name: 'vite:inject-app-loading',
    transformIndexHtml: {
      handler(html: string) {
        const re = /<body\s*>/
        html = html.replace(re, `<body>${injectScript}${loadingHtml}`)
        return html
      },
      order: 'pre',
    },
  }
}

/**
 * 用于获取loading的html模板
 */
async function getLoadingRawByHtmlTemplate(loadingTemplate: string) {
  // 支持在app内自定义loading模板，模版参考default-loading.html即可
  let appLoadingPath = join(process.cwd(), loadingTemplate)

  if (!fs.existsSync(appLoadingPath)) {
    const __dirname = fileURLToPath(new URL('.', import.meta.url))
    appLoadingPath = join(__dirname, './default-loading.html')
  }

  return await fsp.readFile(appLoadingPath, 'utf8')
}

/**
 * 移除并销毁loading
 * 放在这里是而不是放在 index.html 的app标签内，是因为这样比较不会生硬，渲染过快可能会有闪烁
 * 通过先添加css动画隐藏，在动画结束后在移除loading节点来改善体验
 * 不好的地方是会增加一些代码量
 * 自定义loading可以见：https://doc.vben.pro/guide/in-depth/loading.html
 */
function unmountGlobalLoading() {
  // 查找全局 loading 元素
  const loadingElement = document.querySelector('#__app-loading__')
  console.log(loadingElement)

  if (loadingElement) {
    // 添加隐藏类，触发过渡动画
    loadingElement.classList.add('hidden')

    // 查找所有需要移除的注入 loading 元素
    const injectLoadingElements = document.querySelectorAll(
      '[data-app-loading^="inject"]',
    )

    // 当过渡动画结束时，移除 loading 元素和所有注入的 loading 元素
    loadingElement.addEventListener(
      'transitionend',
      () => {
        loadingElement.remove() // 移除 loading 元素
        injectLoadingElements.forEach(el => el.remove()) // 移除所有注入的 loading 元素
      },
      { once: true },
    ) // 确保事件只触发一次
  }
}

export { unmountGlobalLoading, viteInjectAppLoadingPlugin }
