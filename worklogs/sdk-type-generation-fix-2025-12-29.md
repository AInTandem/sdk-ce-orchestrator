# SDK 型別生成流程修復

**日期**: 2025-12-29
**狀態**: ✅ 完成

---

## 問題描述

SDK 專案使用 `openapi-typescript-codegen` 工具從 OpenAPI spec 生成型別定義，但生成的檔案幾乎是空的，導致 SDK 與 API 之間的型別不一致。

## 根本原因

1. **`openapi-typescript-codegen` v0.30.0 相容性問題**
   - 工具生成的 `models/` 和 `schemas/` 目錄下的檔案幾乎都是空的
   - 只有 `index.ts` 包含正確的導出語句，但沒有實際的型別定義

2. **SDK 專案路徑問題**
   - SDK 原本位於 `/base-root/aintandem/default/sdk`
   - 現在透過 symbolic link 連結到 `/base-root/aintandem/default/orchestrator/sdk`
   - node_modules 中的路徑引用需要更新

3. **型別定義不一致**
   - SDK 手動維護的型別與 API 的 OpenAPI spec 不匹配
   - 缺少自動同步機制

## 解決方案

### 1. 更換型別生成工具

採用 `openapi-typescript` 替代 `openapi-typescript-codegen`

**優點**:
- 更穩定，廣泛使用的工具
- 生成純型別定義，不包含客戶端代碼
- 完全符合 OpenAPI 3.0 規範
- 支援從本地檔案或遠端 URL 生成

### 2. 實施步驟

#### Step 1: 重新安裝 SDK 依賴
```bash
cd sdk
rm -rf node_modules .pnpm-store
pnpm install
```

#### Step 2: 安裝新工具
```bash
pnpm add -D -w openapi-typescript
```

#### Step 3: 創建新的生成腳本
檔案: `sdk/scripts/generate-types-v2.ts`

功能:
- 支援從本地 OpenAPI spec 生成
- 支援從遠端 URL 生成
- 自動檢測多種可能的專案結構

#### Step 4: 更新 package.json 腳本
```json
{
  "scripts": {
    "generate-types": "tsx scripts/generate-types-v2.ts",
    "generate-types:remote": "OPENAPI_SPEC_URL=\"$OPENAPI_SPEC_URL\" tsx scripts/generate-types-v2.ts"
  }
}
```

### 3. 驗證結果

#### 型別一致性檢查

| 項目 | API OpenAPI spec | SDK 生成型別 | 狀態 |
|------|------------------|--------------|------|
| `CreateWorkflowRequest.description` | required | required | ✅ |
| `CreateWorkflowRequest.definition` | required | required | ✅ |
| `UpdateWorkflowRequest.changeDescription` | optional | optional | ✅ |
| `ChangeWorkflowStatusRequest.status` | enum | enum | ✅ |
| `CreateWorkflowExecutionRequest.projectId` | required | required | ✅ |

#### 生成的檔案結構
```
sdk/packages/core/src/types/generated/
├── schema.ts         # openapi-typescript 生成 (約 2500 行)
└── index.ts          # 便利的型別匯出檔案
```

## 使用方式

### 本地開發
```bash
# 確保 API 已構建
cd ../..
pnpm build:api

# 生成型別
cd sdk
pnpm generate-types
```

### 從遠端 API 生成
```bash
# 設定遠端 URL 並生成
OPENAPI_SPEC_URL=https://api.example.com/openapi.json pnpm generate-types:remote
```

## 跨語言 SDK 支援

由於使用標準的 OpenAPI 3.0 規範，未來可以為其他程式語言生成 SDK：

### Python
```bash
# 使用 openapi-python-client
openapi-python-client generate https://api.example.com/openapi.json
```

### Java
```bash
# 使用 openapi-generator
openapi-generator generate -i openapi.json -g java -o ./sdk-java
```

### Go
```bash
# 使用 oapi-codegen
oapi-codegen -package api -types openapi.json > api/types.go
```

## 架構改進

### 降低耦合度
1. **SDK 不再依賴 API 的原始碼**
   - 只需要 OpenAPI spec (JSON 檔案)
   - 可以從已部署的 API 取得 spec

2. **型別定義單一來源**
   - OpenAPI spec 是唯一的真相來源
   - SDK 和 API 都遵循相同的規範

3. **支援獨立開發**
   - SDK 可以獨立於 API 專案開發
   - 只需要在需要時同步 spec

### CI/CD 整合建議

```yaml
# .github/workflows/sdk-type-check.yml
name: SDK Type Check
on: [push, pull_request]

jobs:
  type-sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build API Spec
        run: |
          pnpm install
          pnpm build:api

      - name: Generate SDK Types
        run: |
          cd sdk
          pnpm generate-types

      - name: Check for diffs
        run: |
          git diff --exit-code sdk/packages/core/src/types/generated/
```

## 後續改進建議

1. **在 CI/CD 中自動檢查型別同步**
   - 每次 API 變更時自動檢查型別是否需要更新

2. **發布 OpenAPI spec**
   - 在 `/openapi.json` 端點提供最新的 spec
   - 允許 SDK 從遠端自動更新

3. **型別版本管理**
   - 在 spec 中包含版本資訊
   - 支援多版本 API 的型別生成

4. **自動發布**
   - 當 API 發布新版本時，自動發布對應的 SDK 版本

## 相關檔案

- `sdk/scripts/generate-types-v2.ts` - 新的型別生成腳本
- `sdk/scripts/generate-types.ts` - 舊腳本（已棄用）
- `sdk/packages/core/src/types/generated/schema.ts` - 生成的型別定義
- `sdk/packages/core/src/types/generated/index.ts` - 便利匯出檔案
- `worklogs/sdk-api-integration-analysis.md` - 完整分析報告
