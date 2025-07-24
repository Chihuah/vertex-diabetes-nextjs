# 使用 Vertex AI AutoML 訓練糖尿病風險預測模型教學

> 本教學以 [Pima Indians Diabetes Dataset](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database) 為例，實作完整「機器學習預測模型」自動訓練到部署 API 的全流程。

---

## 1️⃣ 資料準備

1. 從 Kaggle 下載 Pima Diabetes CSV 檔（或自行整理其他健康風險資料集）
2. 由於 Vertex AI AutoML 的限制，資料集內數據需至少 1000 筆資料。原始的 Pima Indians Diabetes Dataset 僅有 768 筆，建議先利用擴充資料量（Data Augmentation）的技術增加數據量。簡易的範例程式碼如下：
   ```python
      #安裝必要套件
      !pip install pandas imbalanced-learn scikit-learn
   
      import pandas as pd
      from imblearn.over_sampling import SMOTE
      
      # 讀取資料
      df = pd.read_csv('pima_diabetes.csv')
      X = df.drop(columns=['Outcome'])
      y = df['Outcome']
      
      # 使用 SMOTE 擴充資料（讓少數類別變多）
      smote = SMOTE(sampling_strategy='auto', random_state=42)
      X_resampled, y_resampled = smote.fit_resample(X, y)
      
      # 合併回 DataFrame
      df_resampled = pd.DataFrame(X_resampled, columns=X.columns)
      df_resampled['Outcome'] = y_resampled
      
      # 檢查結果
      print(f"原始筆數：{len(df)}")
      print(f"擴充後筆數：{len(df_resampled)}")
      print(df_resampled['Outcome'].value_counts())
      
      # 儲存新資料
      df_resampled.to_csv('pima_diabetes_augmented.csv', index=False)
   ```
   
3. **確認 CSV 欄位如下：**

   | Glucose | BloodPressure | BMI | Age | Outcome |
   |---------|--------------|-----|-----|---------|
   | 120     | 82           | 28  | 45  | 0       |

   - Outcome = 0（無糖尿病）/ 1（有糖尿病）
   - 註：因故，從原始資料集中刪除數個特徵欄位，本說明範例僅使用四個特徵值與一個目標值欄位

4. 上傳資料集到 Google Cloud Storage  
   - 進入 GCP Console > Storage 建立新 bucket
   - 上傳檔案（例如：`gs://your-bucket/pima_diabetes_augmented.csv`）
  
---

## 2️⃣ Google Cloud 專案與權限設定

1. 申請 [Google Cloud Platform](https://console.cloud.google.com/)
2. 建立新專案（如：`diabetes-ml-project`）
3. 啟用 Vertex AI、Cloud Storage API
4. 到「IAM 與管理員」→「服務帳戶」建立一個帳戶（建立 Service Account）並下載金鑰 JSON 檔（方便後續前端/後端呼叫）

---

## 3️⃣ 匯入 Dataset 到 Vertex AI

1. 進入左側導覽列 → Vertex AI → Dataset → + CREATE
2. 選擇 **Tabular Dataset**，命名如 `Diabetes Dataset` → 選擇地區（建議：us-central1）
3. 上傳資料：選擇 Cloud Storage 路徑。上傳方式選擇 Cloud Storage URI → 填入如 gs://my-diabetes-data/pima_diabetes.csv
4. 進行欄位型態自動判斷，並確認 Outcome 為分類欄位

---

## 4️⃣ 建立 AutoML 訓練任務

1. 點選 Dataset → 「Train new model」
2. 任務類型：**Classification（分類）**
3. 選擇 Outcome 作為 target，並確認所有特徵已正確識別（如都是數值）
4. 分割資料（預設 80% 訓練/10% 驗證/10% 測試）
5. 建議命名：`diabetes-risk-model`
6. 啟動訓練，系統自動調參與訓練（過程約需 1~2 小時分鐘）

---

## 5️⃣ 查看訓練成果與模型評估

1. 訓練完成後，點選模型進入詳細頁面
2. 可查看：
   - 混淆矩陣（Confusion Matrix）
   - ROC 曲線與 AUC 指標
   - Accuracy / Precision / Recall / F1-score

---

## 6️⃣ 部署模型成 Endpoint（API）

1. 點選右上「DEPLOY TO ENDPOINT」
2. 建立新 Endpoint，例如 `diabetes-predictor-endpoint`
3. 點選「Deploy」 → 模型會被部署到一個可用的 REST API Endpoint
4. 等待部署完成（數分鐘），會產生一組 endpoint ID

---

## 7️⃣ API 推論測試

- 進入 Endpoint 頁面，可直接用「API Explorer」測試
- 記錄 project ID、region（如：us-central1）、endpoint ID ，後續供網頁呼叫API時使用
- 透過 Python、curl、或 Web 前後端（如 Next.js）可發送推論請求

---

## 8️⃣ 串接前端/後端應用

- 可結合 React/Next.js/Vue 等前端，或 Python/Node.js 後端
- 發送 POST 請求至 Vertex AI endpoint，取得預測結果進行應用

---

## 9️⃣ 常見問題與建議

- 若資料筆數 < 1000，AutoML Tabular 不允許訓練，可用 SMOTE 增強法處理（參考[這裡](https://imbalanced-learn.org/stable/over_sampling.html#smote-adasyn)）
- 記得資料欄位型態必須與模型訓練時一致
- 不要在公開環境曝露 GCP 金鑰/模型 ID
- 部署前建議以測試專案/帳號練習

---

## 1️⃣0️⃣ 延伸資源

- [Vertex AI Tabular 資料官方教學](https://cloud.google.com/vertex-ai/docs/tabular-data/overview)
- [Vertex AI Python 客戶端](https://cloud.google.com/python/docs/reference/aiplatform/latest)
- [SMOTE 技術說明](https://imbalanced-learn.org/stable/references/generated/imblearn.over_sampling.SMOTE.html)

---
