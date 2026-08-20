import {defineConfig} from 'vitepress'

export default defineConfig({
  cleanUrls: true,
  description: '面向人类与 AI Agent 的 Nove 命令行工具',
  head: [['meta', {content: '#3451b2', name: 'theme-color'}]],
  ignoreDeadLinks: false,
  lang: 'zh-CN',
  lastUpdated: true,
  themeConfig: {
    docFooter: {next: '下一页', prev: '上一页'},
    lastUpdated: {text: '最后更新于'},
    nav: [
      {link: '/guide/installation-guide', text: '指南'},
      {link: '/commands/login', text: '命令'},
    ],
    outline: {label: '本页目录', level: [2, 3]},
    search: {
      options: {
        translations: {
          button: {buttonAriaLabel: '搜索文档', buttonText: '搜索文档'},
          modal: {
            footer: {
              closeText: '关闭',
              navigateText: '切换',
              selectText: '选择',
            },
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
          },
        },
      },
      provider: 'local',
    },
    sidebar: [
      {
        items: [
          {link: '/', text: '概览'},
          {link: '/guide/installation-guide', text: '安装与配置'},
        ],
        text: '开始使用',
      },
      {
        items: [
          {link: '/commands/config', text: '配置'},
          {link: '/commands/login', text: '登录'},
          {link: '/commands/meeting', text: '会议'},
          {link: '/commands/user', text: '用户'},
          {link: '/commands/plugins', text: '插件'},
          {link: '/commands/help', text: '帮助'},
        ],
        text: '命令参考',
      },
    ],
  },
  title: 'Nove CLI',
})
