# SDK 型別同步 CI/CD 設定

**日期**: 2025-12-29
**狀態**: ✅ 完成

---

## 概述

建立 CI/CD 工作流程來自動化 SDK 型別與 API OpenAPI spec 的同步，支援從本地檔案或遠端 URL 生成型別。

---

## 設計原則

### 優先順序

1. **環境變數優先**: 如果設定了 `OPENAPI_SPEC_URL`，使用該 URL
2. **本地檔案降級**: 如果環境變數未設定，使用本地 `dist/swagger.json`

### 使用場景

| 場景 | OPENAPI_SPEC_URL | 實際來源 |
|------|------------------|----------|
| CI/CD | 已設定 | 已部署的 API（遠端） |
| 本地開發 | 未設定 | 本地構建的 spec |
| 測試環境 | 已設定 | Staging API |
| 生產環境 | 已設定 | Production API |

---

## 實施內容

### 1. 更新型別生成腳本

#### 檔案: `sdk/scripts/generate-types.ts`

**改進**:
- 明確的優先順序：環境變數 > 本地檔案
- 自動偵測多種可能的本地路徑
- 遠端 URL 可訪問性檢查（選用）
- 生成 metadata.json 記錄來源資訊
- 更清晰的日誌輸出

**使用方式**:
```bash
# 本地開發（使用本地 spec）
pnpm generate-types

# CI/CD（使用遠端 spec）
OPENAPI_SPEC_URL=https://api.example.com/openapi.json pnpm generate-types
```

### 2. CI/CD 工作流程

#### Type Sync Check (`type-sync-check.yml`)

**觸發時機**:
- Push 到 main/develop 分支
- Pull Request 建立
- 手動觸發

**功能**:
- 構建 API 並生成 OpenAPI spec
- 從本地 spec 生成 SDK 型別
- 檢查型別是否同步
- 失敗時顯示差異

#### Sync from Remote API (`sdk-sync-from-api.yml`)

**觸發時機**:
- 每日凌晨 2 點自動執行
- 手動觸發（可選擇環境）

**功能**:
- 從已部署的 API 獲取最新 spec
- 生成 SDK 型別
- 有變更時自動建立 PR

**輸入參數**:
- `api_url`: 自訂 OpenAPI spec URL
- `environment`: 選擇 staging 或 production

---

## 環境變數配置

### GitHub Actions Settings

在 GitHub repository 設定中添加：

```bash
# Production API
OPENAPI_SPEC_URL=https://api.aintandem.com/openapi.json

# Staging API (可在 workflow 中選擇)
STAGING_API_URL=https://staging-api.aintandem.com/openapi.json
```

### 本地開發

```bash
# .env.local (SDK 專案)
OPENAPI_SPEC_URL=  # 留空使用本地檔案

# 或在命令列
OPENAPI_SPEC_URL=https://dev-api.example.com/openapi.json pnpm generate-types
```

---

## 檔案結構

```
.github/
└── workflows/
    ├── type-sync-check.yml        # PR 時檢查型別同步
    ├── sdk-sync-from-api.yml      # 從遠端 API 同步型別
    └── README.md                  # 工作流程說明文檔

sdk/
├── scripts/
│   └── generate-types.ts          # 更新型的生成腳本
└── packages/core/src/types/generated/
    ├── schema.ts                  # 生成的型別
    ├── index.ts                   # 便利匯出
    └── metadata.json             # 來源資訊
```

---

## 使用範例

### 開發流程

```bash
# 1. 修改 API 定義
# (在 orchestrator/ 中修改 Controller)

# 2. 構建並生成 spec
cd orchestrator
pnpm build:api

# 3. 同步 SDK 型別
cd ../sdk
pnpm generate-types

# 4. 提交變更
git add packages/core/src/types/generated/
git commit -m "chore: sync SDK types from API"
```

### CI/CD 流程

```yaml
# .github/workflows/type-sync-check.yml

- Checkout code
- Install dependencies
- Build API (pnpm build:api)
- Generate SDK types (cd sdk && pnpm generate-types)
- Check for changes (git diff)
- Fail if out of sync
```

---

## metadata.json 結構

每次生成型別時會建立 metadata.json：

```json
{
  "generatedAt": "2025-12-29T12:00:00.000Z",
  "source": "local",
  "location": "/path/to/swagger.json"
}
```

或是遠端來源：

```json
{
  "generatedAt": "2025-12-29T12:00:00.000Z",
  "source": "remote",
  "location": "https://api.example.com/openapi.json"
}
```

---

## 排除問題

### 問題: 找不到本地 spec

**症狀**:
```
❌ OpenAPI spec not found!
```

**解決**:
```bash
# 確認 API 已構建
cd orchestrator && pnpm build:api

# 檢查檔案
ls dist/swagger.json

# 或使用遠端
OPENAPI_SPEC_URL=https://... pnpm generate-types
```

### 問題: 遠端 URL 無法訪問

**症狀**:
```
⚠️ Warning: Could not verify remote URL accessibility.
```

**解決**:
- 確認 API 已部署
- 確認 URL 正確
- 檢查防火牆/CORS 設定

### 問題: CI 持續失敗

**症狀**: GitHub Actions 顯示型別不一致

**解決**:
```bash
# 手動同步
cd sdk
pnpm generate-types
git add . && git commit -m "chore: sync types" && git push
```

---

## 相關檔案

- `.github/workflows/type-sync-check.yml` - PR 型別檢查
- `.github/workflows/sdk-sync-from-api.yml` - 遠端同步
- `.github/workflows/README.md` - 詳細文檔
- `sdk/scripts/generate-types.ts` - 生成腳本
- `worklogs/sdk-api-integration-analysis-2025-12-29.md` - 完整分析報告
