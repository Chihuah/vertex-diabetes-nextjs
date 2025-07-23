import { useState } from 'react';

type FormState = {
  Glucose: string;    // 血糖
  BloodPressure: string; // 血壓
  Height: string;     // 身高
  Weight: string;     // 體重
  Age: string;        // 年齡
};

export default function Home() {
  const [form, setForm] = useState<FormState>({
    Glucose: '',
    BloodPressure: '',
    Height: '',
    Weight: '',
    Age: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    }, 1000);

    // 計算 BMI
    const BMI = calcBMI(form.Height, form.Weight);

    const payload = {
      Glucose: form.Glucose,
      BloodPressure: form.BloodPressure,
      BMI: BMI,
      Age: form.Age,
    };

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
            血糖值（Glucose）<span style={{ color: "#888", fontSize: 12 }}>（0~199）</span>
            <input
              style={inputStyle}
              type="number"
              min="0"
              max="199"
              name="Glucose"
              placeholder="請輸入血糖值"
              value={form.Glucose}
              onChange={handleChange}
              required
            />
          </label>
          <label style={labelStyle}>
            血壓（BloodPressure）<span style={{ color: "#888", fontSize: 12 }}>（0~130）</span>
            <input
              style={inputStyle}
              type="number"
              min="0"
              max="130"
              name="BloodPressure"
              placeholder="請輸入血壓"
              value={form.BloodPressure}
              onChange={handleChange}
              required
            />
          </label>
          <label style={labelStyle}>
            身高（公分）<span style={{ color: "#888", fontSize: 12 }}>例如：165</span>
            <input
              style={inputStyle}
              type="number"
              min="80"
              max="250"
              name="Height"
              placeholder="請輸入身高"
              value={form.Height}
              onChange={handleChange}
              required
            />
          </label>
          <label style={labelStyle}>
            體重（公斤）<span style={{ color: "#888", fontSize: 12 }}>例如：70</span>
            <input
              style={inputStyle}
              type="number"
              min="20"
              max="250"
              name="Weight"
              placeholder="請輸入體重"
              value={form.Weight}
              onChange={handleChange}
              required
            />
          </label>
          <label style={labelStyle}>
            年齡（Age）<span style={{ color: "#888", fontSize: 12 }}>（20~90）</span>
            <input
              style={inputStyle}
              type="number"
              min="20"
              max="90"
              name="Age"
              placeholder="請輸入年齡"
              value={form.Age}
              onChange={handleChange}
              required
            />
          </label>

          {/* BMI 動態顯示 */}
          {form.Height && form.Weight &&
            <div style={{ marginBottom: 12, color: "#1b6db4", fontSize: 15 }}>
              已計算 BMI：<b>{calcBMI(form.Height, form.Weight)}</b>
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
