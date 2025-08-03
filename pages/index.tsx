import { useState } from 'react';

type FormState = {
  gender: string;
  age: string;
  height: string;
  weight: string;
  hypertension: string;
  heart_disease: string;
  blood_glucose_level: string;
  HbA1c_level: string;
};

export default function Home() {
  const [form, setForm] = useState<FormState>({
    gender: '',
    age: '',
    height: '',
    weight: '',
    hypertension: '0',
    heart_disease: '0',
    blood_glucose_level: '',
    HbA1c_level: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [sentPayload, setSentPayload] = useState<any>(null);

  // 自動計算 BMI
  function calcBMI(heightCm: string, weightKg: string): string {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (h > 0 && w > 0) {
      return (w / Math.pow(h / 100, 2)).toFixed(2); // 小數點兩位
    }
    return '';
  }

  // 處理輸入
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 預測送出
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setIsLoading(true);
    setProgress(0);

    // 動畫進度條
    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      setProgress(Math.min(100, tick * 10));
    }, 300);

    // 計算 BMI
    const bmi = calcBMI(form.height, form.weight);

    const payload = {
      gender: form.gender,
      age: form.age,
      height: form.height,
      weight: form.weight,
      hypertension: form.hypertension,
      heart_disease: form.heart_disease,
      blood_glucose_level: form.blood_glucose_level,
      bmi: bmi,
      HbA1c_level: form.HbA1c_level,
    };

    setSentPayload(payload);

    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setResult(JSON.stringify(data));
    setIsLoading(false);
    setProgress(100);
    clearInterval(interval);
  };

  function getRiskMessage(apiResult: any): string | null {
    try {
      const score = apiResult?.predictions?.[0]?.scores?.[1];
      if (typeof score === 'number') {
        const percent = (score * 100).toFixed(1);
        return `預估患有糖尿病的風險指數為 ${percent}%`;
      }
    } catch (e) {}
    return null;
  }

  // CSS 內嵌
  const cardStyle = {
    maxWidth: 420,
    margin: "2.5rem auto",
    padding: 32,
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 8px 24px 0 #d7e8f0",
    border: "1.5px solid #dde8ee"
  } as React.CSSProperties;

  const labelStyle = {
    fontWeight: 600,
    display: 'block',
    marginBottom: 6,
    fontSize: 15,
  };

  const inputStyle = {
    width: "90%",
    borderRadius: 8,
    border: "1.5px solid #c9d5e1",
    padding: "10px 12px",
    fontSize: 16,
    marginBottom: 16,
    outline: "none",
    background: "#f6fafd",
    transition: "border 0.2s"
  } as React.CSSProperties;

  const buttonStyle = {
    padding: "12px 0",
    width: "100%",
    borderRadius: 8,
    border: "none",
    fontWeight: 700,
    background: "#37a3e5",
    color: "#fff",
    fontSize: 17,
    letterSpacing: 2,
    cursor: "pointer",
    transition: "background 0.2s"
  };

  return (
    <main>
      <div style={cardStyle}>
        <h2 style={{ fontSize: 28, margin: "0 0 30px 0", fontWeight: 800, letterSpacing: 1, textAlign: "center" }}>糖尿病風險預測</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <label style={labelStyle}>
            性別
            <div style={{ marginBottom: 12 }}>
              <label style={{ marginRight: 16 }}>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={form.gender === "Female"}
                  onChange={handleChange}
                  required
                /> 女
              </label>
              <label style={{ marginRight: 16 }}>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={form.gender === "Male"}
                  onChange={handleChange}
                  required
                /> 男
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={form.gender === "Other"}
                  onChange={handleChange}
                  required
                /> 其他
              </label>
            </div>
          </label>
          <label style={labelStyle}>
            年齡（0~100）
            <input
              style={inputStyle}
              type="number"
              min="0"
              max="100"
              name="age"
              placeholder="請輸入年齡"
              value={form.age}
              onChange={handleChange}
              required
            />
          </label>
          <label style={labelStyle}>
            身高（公分）
            <input
              style={inputStyle}
              type="number"
              min="80"
              max="250"
              name="height"
              placeholder="請輸入身高"
              value={form.height}
              onChange={handleChange}
              required
            />
          </label>
          <label style={labelStyle}>
            體重（公斤）
            <input
              style={inputStyle}
              type="number"
              min="20"
              max="250"
              name="weight"
              placeholder="請輸入體重"
              value={form.weight}
              onChange={handleChange}
              required
            />
          </label>
          <label style={labelStyle}>
            高血壓
            <div style={{ marginBottom: 12 }}>
              <label style={{ marginRight: 16 }}>
                <input
                  type="radio"
                  name="hypertension"
                  value="0"
                  checked={form.hypertension === "0"}
                  onChange={handleChange}
                  required
                /> 無
              </label>
              <label>
                <input
                  type="radio"
                  name="hypertension"
                  value="1"
                  checked={form.hypertension === "1"}
                  onChange={handleChange}
                  required
                /> 有
              </label>
            </div>
          </label>

          <label style={labelStyle}>
            心臟病
            <div style={{ marginBottom: 12 }}>
              <label style={{ marginRight: 16 }}>
                <input
                  type="radio"
                  name="heart_disease"
                  value="0"
                  checked={form.heart_disease === "0"}
                  onChange={handleChange}
                  required
                /> 無
              </label>
              <label>
                <input
                  type="radio"
                  name="heart_disease"
                  value="1"
                  checked={form.heart_disease === "1"}
                  onChange={handleChange}
                  required
                /> 有
              </label>
            </div>
          </label>
          <label style={labelStyle}>
            血糖值（0~300）
            <input
              style={inputStyle}
              type="number"
              min="0"
              max="300"
              name="blood_glucose_level"
              placeholder="請輸入血糖值"
              value={form.blood_glucose_level}
              onChange={handleChange}
              required
            />
          </label>
          <label style={labelStyle}>
            醣化血紅素（HbA1c Level）（3.5~9）
            <input
              style={inputStyle}
              type="number"
              min="3.5"
              max="9"
              step="0.1"
              name="HbA1c_level"
              placeholder="請輸入 HbA1c"
              value={form.HbA1c_level}
              onChange={handleChange}
              required
            />
          </label>

          {/* BMI 動態顯示 */}
          {form.height && form.weight &&
            <div style={{ marginBottom: 12, color: "#1b6db4", fontSize: 15 }}>
              已計算 BMI：<b>{calcBMI(form.height, form.weight)}</b>
            </div>
          }

          <button style={buttonStyle} disabled={isLoading}>風險評估</button>
        </form>

        {/* 進度條動畫 */}
        {isLoading && (
          <div style={{ margin: "20px 0" }}>
            <div style={{
              width: "100%",
              height: 12,
              background: "#eaf3f9",
              borderRadius: 8,
              overflow: "hidden"
            }}>
              <div style={{
                width: `${progress}%`,
                height: "100%",
                background: "#51c6fc",
                transition: "width 0.5s"
              }} />
            </div>
            <div style={{ fontSize: 14, color: "#666", marginTop: 6 }}>
              預測中…請稍候
            </div>
          </div>
        )}

        {/* 結果區塊 */}
        {result && (
          <div style={{ marginTop: 28 }}>
            <b style={{ fontSize: 18 }}>預測結果：</b>
            <p style={{ fontSize: 17, margin: "8px 0" }}>
              {getRiskMessage(JSON.parse(result))}
            </p>
            <details style={{ marginTop: 10 }}>
              <summary style={{ fontSize: 15, color: "#1985bb", cursor: "pointer" }}>送出至 API 的內容</summary>
              <pre
                style={{
                  background: "#f6f8fa",
                  borderRadius: 10,
                  padding: 16,
                  fontSize: 14,
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  border: "1px solid #eee",
                  marginTop: 8
                }}
              >
                {sentPayload && JSON.stringify(sentPayload, null, 2)}
              </pre>
            </details>
            <details style={{ marginTop: 10 }}>
              <summary style={{ fontSize: 15, color: "#1985bb", cursor: "pointer" }}>完整 API 回傳內容</summary>
              <pre
                style={{
                  background: "#f6f8fa",
                  borderRadius: 10,
                  padding: 16,
                  fontSize: 14,
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  border: "1px solid #eee",
                  marginTop: 8
                }}
              >
                {result && JSON.stringify(JSON.parse(result), null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </main>
  );
}
