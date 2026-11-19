# 冠表行情

劳力士型号与价格查询站（个人爱好者项目，与 Rolex SA 无关联）。

- 浏览约 300 个型号，按系列、材质筛选，按价格或溢价排序，支持搜索型号、系列、昵称
- 每个型号：二手在售标价统计（最低 / 中位 / 最高）、美国公价、溢价幅度、各地区折算参考价、价格走势、在售列表、系列评测与外部评测链接
- 11 种货币切换，深浅色自动适配，手机可用

## 数据来源与更新

| 数据 | 来源 | 频率 |
| --- | --- | --- |
| 二手行情 | Bob's Watches 公开的在售列表（标价，非成交价） | 每日 |
| 美国公价 | 同站各系列的型号价格表；`data/official-overrides.json` 中的手工条目优先 | 每日 / 手工 |
| 其他地区公价 | 默认按当日汇率由美国公价折算，页面上明确标注为“汇率折算”；在 `data/official-overrides.json` 填入核实过的当地公价后显示为“已核实” | 手工 |
| 汇率 | api.frankfurter.dev（欧洲央行参考汇率） | 每日 |

rolex.com、Chrono24、WatchCharts 都会拦截自动化访问，本项目不去绕过，所以没有直接抓取它们。

`.github/workflows/daily.yml` 每天北京时间约 05:17 运行 `scripts/update.mjs`，把新数据提交回仓库并发布到 GitHub Pages。定时任务只在默认分支上生效，并且需要在仓库 Settings → Pages 把 Source 设为 “GitHub Actions”。

## 本地运行

```sh
node scripts/update.mjs      # 刷新 data/（Node 20+，无依赖）
npx serve .                  # 任意静态服务器均可
```
