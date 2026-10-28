/**
 * 抓取 中央氣象署(臺南站) 氣溫 與 環境部(臺南測站) AQI，輸出 data/weather.json
 * 金鑰由環境變數提供 (GitHub Secrets)，不會出現在網站程式碼中。
 *   CWA_API_KEY   中央氣象署授權碼
 *   MOENV_API_KEY 環境部 API Key
 */
import { writeFile, readFile, mkdir } from 'node:fs/promises';

const CWA_KEY = process.env.CWA_API_KEY;
const MOENV_KEY = process.env.MOENV_API_KEY;
const STATION_ID = '467410';   // 中央氣象署 臺南站
const SITE_NAME = '臺南';       // 環境部 臺南測站
const OUT = 'data/weather.json';

// 單次請求 15 秒逾時，失敗最多重試 3 次 (避免卡住整個排程佇列 / 偶發網路錯誤造成漏更新)
const FETCH_TIMEOUT_MS = 15000;
const FETCH_RETRIES = 3;

async function getJson(url) {
  let lastErr;
  for (let i = 1; i <= FETCH_RETRIES; i++) {
    try {
      const res = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      if (i < FETCH_RETRIES) await new Promise(r => setTimeout(r, 2000 * i));
    }
  }
  throw lastErr;
}

async function fetchTemp() {
  const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${encodeURIComponent(CWA_KEY)}&StationId=${STATION_ID}&format=JSON`;
  const json = await getJson(url);
  const rec = json.records || {};
  const st = (rec.Station || rec.station || [])[0];
  const we = st && (st.WeatherElement || st.weatherElement);
  const t = parseFloat(we && we.AirTemperature);
  if (isNaN(t) || t <= -90) throw new Error('invalid temperature');
  return { temperature: t, tempObsTime: st.ObsTime && st.ObsTime.DateTime };
}

async function fetchAqi() {
  const url = `https://data.moenv.gov.tw/api/v2/aqx_p_432?api_key=${encodeURIComponent(MOENV_KEY)}&limit=1&format=json&filters=${encodeURIComponent('sitename,EQ,' + SITE_NAME)}`;
  const json = await getJson(url);
  const list = Array.isArray(json) ? json : (json.records || []);
  const rec = list.find(r => r.sitename === SITE_NAME) || list[0];
  const aqi = parseInt(rec && rec.aqi, 10);
  if (isNaN(aqi)) throw new Error('invalid aqi');
  return { aqi, aqiStatus: (rec.status || '').trim(), aqiPublishTime: rec.publishtime };
}

// 環境部 AQI 為每小時發布一次 (publishtime 為整點)，通常每小時 10~20 分間可取得該整點資料。
// 從每小時 10 分起，只要「已儲存的資料尚非本小時」就抓取 (未發布則下一輪再試)，其餘時間沿用舊值。
// 若已儲存資料落後超過 2 小時 (例如先前排程中斷)，不論分鐘一律強制抓取。
const AQI_READY_MINUTE = 10;
const AQI_STALE_MS = 2 * 3600 * 1000;

function shouldFetchAqi(data) {
  const tw = new Date(Date.now() + 8 * 3600 * 1000); // 以 UTC getter 讀取臺灣時間
  if (!data.aqiPublishTime) return true;
  const pubMs = Date.parse(data.aqiPublishTime.replace(/\//g, '-').replace(' ', 'T') + '+08:00');
  if (!isNaN(pubMs) && Date.now() - pubMs > AQI_STALE_MS) return true;
  if (tw.getUTCMinutes() < AQI_READY_MINUTE) return false;
  const p = n => String(n).padStart(2, '0');
  const currentHour = `${tw.getUTCFullYear()}/${p(tw.getUTCMonth() + 1)}/${p(tw.getUTCDate())} ${p(tw.getUTCHours())}`;
  const storedHour = (data.aqiPublishTime || '').slice(0, 13);
  return storedHour < currentHour;
}

async function main() {
  // 以舊資料為基底：單一來源失敗時保留上一次成功的數值
  let data = {};
  try { data = JSON.parse(await readFile(OUT, 'utf8')); } catch {}

  const jobs = [];
  if (CWA_KEY) jobs.push(fetchTemp().then(r => Object.assign(data, r)).catch(e => console.error('氣溫失敗:', e.message)));
  else console.error('未設定 CWA_API_KEY');
  if (!MOENV_KEY) console.error('未設定 MOENV_API_KEY');
  else if (shouldFetchAqi(data)) jobs.push(fetchAqi().then(r => Object.assign(data, r)).catch(e => console.error('AQI 失敗:', e.message)));
  else console.log('AQI 本小時資料已是最新或尚未到發布時間，略過抓取');
  await Promise.all(jobs);

  data.updatedAt = new Date().toISOString();
  await mkdir('data', { recursive: true });
  await writeFile(OUT, JSON.stringify(data, null, 2) + '\n');
}

main();
