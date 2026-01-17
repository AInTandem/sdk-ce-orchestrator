# Changesets

歡迎使用 changesets！這裡的 markdown 檔案會被用來產生 changelog。

## Changeset 檔案格式

每個 changeset 檔案都是一個 markdown 檔案，格式如下：

```markdown
---
"@aintandem/sdk-core": minor
"@aintandem/sdk-react": patch
---

這是一段描述變更內容的文字。
```

## 版本類型說明

- **major**: 破壞性變更 (1.0.0 → 2.0.0)
- **minor**: 新功能，向後相容 (1.0.0 → 1.1.0)
- **patch**: 錯誤修復 (1.0.0 → 1.0.1)

## 使用流程

1. **建立 changeset**：
   ```bash
   pnpm changeset
   ```
   依提示選擇要變更版本的套件和版本類型。

2. **消費 changesets（更新版本）**：
   ```bash
   pnpm changeset:version
   ```
   這會更新所有套件的 package.json 版本，並將 changeset 檔案移到 `.changeset` 目錄。

3. **發佈**：
   ```bash
   pnpm release
   ```
   這會建構並發佈所有已更新版本的套件到 npm。
