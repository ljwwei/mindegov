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

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
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

async function main() {
  // 以舊資料為基底：單一來源失敗時保留上一次成功的數值
  let data = {};
  try { data = JSON.parse(await readFile(OUT, 'utf8')); } catch {}

  const jobs = [];
  if (CWA_KEY) jobs.push(fetchTemp().then(r => Object.assign(data, r)).catch(e => console.error('氣溫失敗:', e.message)));
  else console.error('未設定 CWA_API_KEY');
  if (MOENV_KEY) jobs.push(fetchAqi().then(r => Object.assign(data, r)).catch(e => console.error('AQI 失敗:', e.message)));
  else console.error('未設定 MOENV_API_KEY');
  await Promise.all(jobs);

  data.updatedAt = new Date().toISOString();
  await mkdir('data', { recursive: true });
  await writeFile(OUT, JSON.stringify(data, null, 2) + '\n');
}

main();
