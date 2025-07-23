import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const keyPath = path.join(process.cwd(), 'service-account.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const authClient = await auth.getClient();

  const vertex = google.aiplatform({
    version: 'v1beta1',
    auth: auth,
  });


  const project = process.env.GCP_PROJECT_ID;
  const location = process.env.GCP_REGION;
  const endpointId = process.env.VERTEX_ENDPOINT_ID;

  const endpoint = `projects/${project}/locations/${location}/endpoints/${endpointId}`;

  // 這裡根據你的模型輸入調整 features
  // const instance = {
  //   Glucose: Number(req.body.Glucose),
  //   BloodPressure: Number(req.body.BloodPressure),
  //   BMI: Number(req.body.BMI),
  //   Age: Number(req.body.Age),
  // };
  // 只傳這四個欄位，且全部為字串
    const instance = {
      Glucose: String(req.body.Glucose),
      BloodPressure: String(req.body.BloodPressure),
      BMI: String(req.body.BMI),
      Age: String(req.body.Age),
    };


  try {
    const prediction = await vertex.projects.locations.endpoints.predict({
      endpoint,
      requestBody: {
        instances: [instance],
      },
    });

    // 只回傳 predictions 欄位
    res.status(200).json({
      predictions: prediction.data.predictions
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
}
