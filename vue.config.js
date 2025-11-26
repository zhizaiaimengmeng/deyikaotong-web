'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'SpringCloud Admin'

const port = process.env.port || process.env.npm_config_port || 8080

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          // 静默弃用警告 - 最省事的方案
          silenceDeprecations: ['global-builtin', 'import', 'slash-div']
        }
      }
    }
  },
  publicPath: '/',
  outputDir: 'dyktweb',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: true, // 改为 true 确保生产环境也有 source map
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      [process.env.VUE_APP_BASE_API]: {
        target: `http://127.0.0.1:8443`,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API]: ''
        }
      }
    },
  },
  // 合并 configureWebpack 配置
  configureWebpack: {
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    // 调试配置 - 确保开发环境有完整的 source map
    devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map'
  },
  chainWebpack(config) {
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    // 移除或注释掉这里的 devtool 配置，避免冲突
    // config
    //   .when(process.env.NODE_ENV === 'development',
    //     config => config.devtool('cheap-source-map')
    //   )

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          // config
          //   .plugin('ScriptExtHtmlWebpackPlugin')
          //   .after('html')
          //   .use('script-ext-html-webpack-plugin', [{
          //     inline: /runtime\..*\.js$/
          //   }])
          //   .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial'
                },
                elementUI: {
                  name: 'chunk-elementUI',
                  priority: 20,
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'),
                  minChunks: 3,
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          config.optimization.runtimeChunk('single')
        }
      )
  }
}