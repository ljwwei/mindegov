/**
 * 民德市政府官網 - 外部資料設定 (API Keys)
 * 請填入您申請的授權碼；留空時，氣溫與空氣品質會顯示「--」。
 *
 * 中央氣象署 (CWA) 開放資料平臺：https://opendata.cwa.gov.tw/  → 會員專區取得授權碼 (CWA-XXXXXXXX-...)
 * 環境部 環境資料開放平臺：https://data.moenv.gov.tw/        → 註冊後取得 API Key
 *
 * 注意：純前端網站的金鑰公開可見，建議使用僅限讀取公開資料的金鑰。
 */
window.MINDE_CONFIG = {
  cwaApiKey: "",
  moenvApiKey: "",
  // 中央氣象署 臺南站（臺南市北區）
  cwaStationId: "467410",
  // 環境部 臺南測站
  moenvSiteName: "臺南",
  // 更新間隔（毫秒）
  refreshMs: 10 * 60 * 1000
};
