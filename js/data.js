/**
 * 民德市政府官網 - 核心資料庫 (Core Data Service)
 * 智慧民德．幸福永續
 */

const MINDE_DATA = {
  // 市政基本資訊
  cityInfo: {
    name: "民德市政府",
    englishName: "Minde City Government",
    slogan: "智慧民德・幸福永續",
    address: "100001 民德市中央區市政大道一段 1 號",
    phone: "(02) 2345-6789",
    hotline: "1999（外縣市請撥 02-2345-1999）",
    hours: "週一至週五 08:30 - 17:30（中午不打烊，國定例假日休息）",
    mayor: "陳思維 (Mayor Szu-Wei Chen)",
    population: "2,768,520 人",
    updatedDate: "115-10-25"
  },

  // 最新公告資料
  announcements: [
    {
      id: "ann-001",
      category: "urgent",
      categoryName: "重要警戒",
      badgeColor: "urgent",
      isPinned: true,
      title: "【重要公告】民德市因應季節性強風豪雨各項防汛設施整備完成，水門及抽水站隨時待命",
      bureau: "工務局水利處",
      date: "2026-10-25",
      views: 3840,
      summary: "為因應秋季鋒面及沿海強陣風，工務局已完成全市 48 處抽水站全面檢驗與滯洪池水位預降作業，請市民保持排水孔暢通。",
      content: `
        <h3>民德市政府防汛緊急整備說明</h3>
        <p>因應近期氣象署預報之秋季鋒面與東北季風共伴效應，民德市政府已於今日上午由市長召開跨局處防汛整備會議。</p>
        <p><strong>主要整備作為：</strong></p>
        <ul>
          <li><strong>工務局：</strong>已調派 12 組巡檢小組，針對全市 65 處易積水熱點完成側溝巡檢與清淤，水利抽水站 48 處機組運轉測試皆正常。</li>
          <li><strong>環保局：</strong>清潔隊針對各主要幹道排水格柵加強落葉雜物清除，累計清疏長度達 32 公里。</li>
          <li><strong>消防局：</strong>已通報各分隊救災艇與救生器材全面上線整備，特搜大隊隨時待命支援。</li>
          <li><strong>水門管制資訊：</strong>若遇潮位暴漲，將提前 2 小時透過官方 LINE、民德市 APP 及警政廣播通知車主駛離河濱公園停車場。</li>
        </ul>
        <p>市民如有砂包借用需求，可至各區公所洽詢登記領取，防汛專線請撥 1999。</p>
      `,
      attachments: [
        { name: "民德市各區公所砂包領用地點一覽表.pdf", size: "348 KB" },
        { name: "河濱公園水門啟閉與拖吊標準作業程序.odt", size: "192 KB" }
      ]
    },
    {
      id: "ann-002",
      category: "news",
      categoryName: "市政焦點",
      badgeColor: "primary",
      isPinned: true,
      title: "民德市「智慧市民卡 3.0」全面升級！整合大眾運輸、借書證與市府規費線上折抵",
      bureau: "民政局 / 資訊處",
      date: "2026-10-24",
      views: 5210,
      summary: "即日起開放數位虛擬卡申請，綁定手機錢包即可享捷運公車 8 折、市立美術館免費參觀等多項市民專屬禮遇。",
      content: `
        <h3>智慧科技融入市民日常，民德市民卡全面數位化</h3>
        <p>為落實「數位宜居城市」願景，民德市政府民政局與資訊處歷時一年研發，正式推出「智慧市民卡 3.0」。市民無需攜帶實體卡片，只需登入市府官網或市民 APP，即可快速申辦並新增至 Apple Wallet 或 Google 錢包。</p>
        <p><strong>3.0 升級亮點：</strong></p>
        <ol>
          <li><strong>通勤優惠升級：</strong>搭乘民德捷運、市區公車享有 8 折回饋，每月累積搭乘滿 30 次再加碼贈送 100 元綠色生活點數。</li>
          <li><strong>文化場館暢遊：</strong>市立美術館、天文教育館、歷史博物館免預約刷碼免費入場。</li>
          <li><strong>規費線上直繳：</strong>申辦戶籍謄本、地政規費免排隊，卡內點數可直接抵繳市府各項行政規費。</li>
        </ol>
      `,
      attachments: [
        { name: "民德智慧市民卡3.0申請懶人包.pdf", size: "1.2 MB" }
      ]
    },
    {
      id: "ann-003",
      category: "news",
      categoryName: "市政焦點",
      badgeColor: "primary",
      isPinned: false,
      title: "育兒家庭福音！115年度民德市公托倍增計畫達標，再增設 6 處社區公共托育家園",
      bureau: "社會局",
      date: "2026-10-23",
      views: 2980,
      summary: "打造安心生養環境，社會局新設之中央區、新興區公托今日聯合啟用，預計提供 360 個托育名額。",
      content: `
        <h3>擴大平價托育供給，落實願生、樂養政策</h3>
        <p>民德市社會局積極盤點市有閒置空間與校園餘裕教室，成功於中央區、新興區、海濱區等 6 處增設社區公共托育家園。每月家長自付額僅需 3,500 元（含政府托育補助），大幅減輕雙薪家庭經濟負擔。</p>
        <p>即日起至 11 月 15 日止開放線上登記抽籤，符合資格之設籍市民可至社會局公托報名專區填單登記。</p>
      `,
      attachments: [
        { name: "115年度新設公托家園招生簡章與名額分配.pdf", size: "580 KB" }
      ]
    },
    {
      id: "ann-004",
      category: "events",
      categoryName: "活動訊息",
      badgeColor: "accent",
      isPinned: false,
      title: "「2026 民德水岸光影藝術季」即將於中央水岸公園盛大登場，連展 30 天璀璨夜空",
      bureau: "文化局 / 觀光傳播處",
      date: "2026-10-22",
      views: 7420,
      summary: "邀請國內外 18 位當代光影藝術家打造 24 組互動巨型裝置，每逢週五至週日晚間更有水幕無人機燈光秀！",
      content: `
        <h3>水岸美學新地標，光影交織幸福城市</h3>
        <p>「2026 民德水岸光影藝術季」以「流動的光之語」為策展主題，沿著民德大橋至水岸生態園區設置全長 2.5 公里的藝術走廊。展區規劃「未來之森」、「深藍星辰」、「市民共創光屋」三大展區。</p>
        <p>為方便民眾賞燈，市府交通局將加密捷運藍線班次，並提供自中央車站發車之免費接駁專車。</p>
      `,
      attachments: [
        { name: "水岸光影藝術季全區地圖與交通指南.pdf", size: "2.4 MB" }
      ]
    },
    {
      id: "ann-005",
      category: "tenders",
      categoryName: "招標採購",
      badgeColor: "warning",
      isPinned: false,
      title: "【公開招標】「民德市智慧綠能公共自行車租賃系統（二期）建置營運案」公開招標公告",
      bureau: "交通局",
      date: "2026-10-21",
      views: 1840,
      summary: "為擴大綠色公共運輸銜接網絡，採最有利標評選方式辦理，預算金額新臺幣 8,500 萬元整，等標期至 11 月 28 日止。",
      content: `
        <h3>標案案號：TRA-115-089</h3>
        <p><strong>標的名稱：</strong>民德市智慧綠能公共自行車租賃系統（二期）建置營運案</p>
        <p><strong>招標方式：</strong>公開招標（準用最有利標）</p>
        <p><strong>履約期限：</strong>自決標日起至 118 年 12 月 31 日止</p>
        <p><strong>領標方式：</strong>請至行政院公共工程委員會「政府電子採購網」領投標系統下載招標文件。</p>
      `,
      attachments: [
        { name: "招標投標須知與評選作業辦法.pdf", size: "890 KB" }
      ]
    },
    {
      id: "ann-006",
      category: "recruit",
      categoryName: "徵才資訊",
      badgeColor: "info",
      isPinned: false,
      title: "【就業快報】民德市政府環境保護局甄選「115年儲備清潔隊員及駕駛」計 120 名",
      bureau: "環境保護局",
      date: "2026-10-20",
      views: 4120,
      summary: "月薪加獎金上看 4 萬 3 千元，分為一般類組、駕駛類組及原住民身障特定保障類組，體能測驗預計 12 月初舉行。",
      content: `
        <h3>環保守護生力軍，誠徵市民夥伴加入</h3>
        <p>民德市環保局為充實第一線街道維護及垃圾資源清運人力，委託民德市就業服務處辦理 115 年儲備清潔隊員甄試。</p>
        <p><strong>報考資格：</strong>設籍民德市滿 6 個月以上，具中華民國國籍，國中（含）以上畢業學歷。</p>
        <p><strong>甄試方式：</strong>第一階段體能測驗（負重折返跑 60 公尺），第二階段電腦筆試與口試。</p>
      `,
      attachments: [
        { name: "儲備隊員甄試簡章與體檢表.pdf", size: "430 KB" }
      ]
    },
    {
      id: "ann-007",
      category: "news",
      categoryName: "市政焦點",
      badgeColor: "primary",
      isPinned: false,
      title: "財政健全評比名列前茅！民德市連續 3 年榮獲中央考核地方財政管理甲等優良機關",
      bureau: "財政局",
      date: "2026-10-18",
      views: 1950,
      summary: "嚴格恪守財政紀律，落實開源節流，市府公共債務逐年下降，人均負債降至六都最低水準。",
      content: `
        <h3>恪守財政紀律，打造永續健康市庫</h3>
        <p>民德市政府財政局今日發布 114 年度決算審核成果，市府在重大建設如捷運與下水道全速推進的同時，透過活化公有閒置資產、精準預算審查，累計減債 42 億元。</p>
      `,
      attachments: [
        { name: "民德市地方財政結構與減債專報.pdf", size: "1.1 MB" }
      ]
    },
    {
      id: "ann-008",
      category: "events",
      categoryName: "活動訊息",
      badgeColor: "accent",
      isPinned: false,
      title: "「2026 民德國際智慧永續高峰論壇」開放線上席次預約，聚焦 AI 城市治理與淨零碳排",
      bureau: "經濟發展局 / 研考會",
      date: "2026-10-15",
      views: 3100,
      summary: "邀集來自 12 國智慧城市代表與產官學專家，於民德國際會議中心共商數位孿生與綠能城市解方。",
      content: `
        <p>高峰會規劃「AI 驅動城市防災」、「次世代綠能電網」、「以人為本的樂齡智慧社區」三大核心議程，現場設有智慧治理示範展區。</p>
      `,
      attachments: [
        { name: "智慧永續論壇議程與演講嘉賓名冊.pdf", size: "1.5 MB" }
      ]
    }
  ],

  // 便民服務快速入口
  quickServices: [
    {
      id: "srv-01",
      category: "household",
      title: "戶籍申辦與謄本申請",
      bureau: "民政局",
      icon: "users",
      tag: "熱門首選",
      desc: "戶籍謄本線上申請、新生兒出生登記、遷徙登記及國民身分證掛失換發。",
      processingTime: "線上即辦 / 郵寄約 2 工作天",
      requirements: ["自然人憑證或行動自然人憑證", "申請人個人身分資料", "戶號或戶政規費線上繳納"]
    },
    {
      id: "srv-02",
      category: "tax",
      title: "地方稅務線上申辦與繳費",
      bureau: "財政局 / 稅捐稽徵處",
      icon: "dollar-sign",
      tag: "全時服務",
      desc: "房屋稅、地價稅、使用牌照稅查繳，身障免稅申辦及各項繳納證明下載。",
      processingTime: "即時查繳 / 系統自動銷帳",
      requirements: ["健保卡卡號或工商憑證", "車號或房屋稅單代號", "信用卡或行動支付繳款"]
    },
    {
      id: "srv-03",
      category: "construction",
      title: "道路平整與路燈修復通報",
      bureau: "工務局養工處",
      icon: "tool",
      tag: "24h 處理",
      desc: "市區道路坑洞、路面下陷、側溝阻塞、路燈熄滅破損線上拍照通報。",
      processingTime: "通報後 4 小時內到場勘驗",
      requirements: ["現場照片（清晰可辨識）", "明確路段與鄰近門牌定位", "通報人聯絡電話以便進度回報"]
    },
    {
      id: "srv-04",
      category: "education",
      title: "公立國中小新生線上入學報到",
      bureau: "教育局",
      icon: "book-open",
      tag: "學季專區",
      desc: "學區分發查詢、國中小新生常態編班與線上報到資料確認上傳。",
      processingTime: "填表後系統自動比對學籍",
      requirements: ["家長身分證字號", "新生戶籍資料及入學通知單號", "疫苗接種記錄卡影本"]
    },
    {
      id: "srv-05",
      category: "transit",
      title: "即時公車動態與停車在席",
      bureau: "交通局",
      icon: "navigation",
      tag: "即時動態",
      desc: "全市民德捷運、市區公車到站預估、路邊及公有停車場剩餘車位查詢。",
      processingTime: "即時更新（每 15 秒更新）",
      requirements: ["免任何憑證，開放全體市民直接查詢"]
    },
    {
      id: "srv-06",
      category: "welfare",
      title: "敬老愛心卡與長青津貼申辦",
      bureau: "社會局",
      icon: "heart",
      tag: "長者照護",
      desc: "年滿 65 歲市民敬老乘車點數卡申請、身心障礙生活補助及乘車優惠換卡。",
      processingTime: "審核約 3-5 個工作天",
      requirements: ["身分證正反面影本", "半年內兩吋半身彩色照片 2 張", "郵局或指定金融機構存摺影本"]
    },
    {
      id: "srv-07",
      category: "eco",
      title: "定點與即時垃圾車動態查詢",
      bureau: "環境保護局",
      icon: "truck",
      tag: "市民必備",
      desc: "查詢即時垃圾車 GPS 抵達時間、定時定點收運站、大型廢棄家具線上預約清運。",
      processingTime: "大型家具預約於 24 小時內專人確認",
      requirements: ["通報地址", "廢棄家具品項種類及數量", "清運聯絡人手機"]
    },
    {
      id: "srv-08",
      category: "health",
      title: "社區健康檢查與預防疫苗線上預約",
      bureau: "衛生局",
      icon: "activity",
      tag: "市民健康",
      desc: "各區衛生所老人健檢、公費流感疫苗、幼兒常規疫苗施打時段在線預約。",
      processingTime: "線上預約立即取得序號",
      requirements: ["健保 IC 卡", "身分證或居留證", "預防接種紀錄手冊（幼兒）"]
    }
  ],

  // 各局處介紹資料
  departments: [
    {
      id: "dept-civil",
      name: "民政局",
      englishName: "Civil Affairs Bureau",
      category: "governance",
      categoryName: "政務與民生",
      chief: "林宏昇",
      chiefTitle: "局長",
      phone: "(02) 2345-6789 轉 6100",
      location: "市政大樓 4 樓東側",
      website: "https://civil.mindegov.example",
      bannerColor: "#1d63b8",
      motto: "深耕基層，關懷民生，打造最有溫度的宜居生活",
      intro: "民政局為統籌全市民政基層組織、區公所業務、戶政登載、兵役替代役徵集、宗教禮俗推廣及原住民客家多元文化之樞紐機關。積極推展「一區一特色」，打造幸福共好生活圈。",
      duties: [
        "基層鄰里組織劃分與區公所行政督導考核",
        "全市 12 個區戶政事務所各項身分登記事項督導",
        "兵役徵集、替代役管理與役男權益輔導",
        "寺廟宗教財團法人登記輔導及民俗文化節慶辦理",
        "殯葬設施現代化改善及綠色環保葬推廣"
      ],
      keyServices: [
        "智慧市民卡 3.0 申請與換發",
        "國民身分證、戶口名簿與戶籍謄本申辦",
        "役男兵籍調查與體檢時程線上預約",
        "市民聯合婚禮報名與禮堂租借"
      ]
    },
    {
      id: "dept-finance",
      name: "財政局",
      englishName: "Finance Bureau",
      category: "finance",
      categoryName: "財政與經濟",
      chief: "張敏慧",
      chiefTitle: "局長",
      phone: "(02) 2345-6789 轉 6200",
      location: "市政大樓 5 樓中央",
      website: "https://finance.mindegov.example",
      bannerColor: "#0f4c81",
      motto: "穩健市庫，精準治理，促進城市資產永續價值",
      intro: "財政局專責全市財政收支管理、地方稅務法規研擬、公有市有財產活化運用、菸酒產銷查緝及公庫集中支付運作。長年恪守嚴格財政紀律，確保重大市政基礎建設獲得充裕資源挹注。",
      duties: [
        "市庫調度籌措與年度總預算歲入編列執行",
        "公債發行審議及地方公務債務穩健控管",
        "市有非公用公產土地盤點、都更參與及促參（BOT/OT）推動",
        "地方稅收稽徵業務監督與無實體電子發票推廣",
        "非公用不動產標租與智慧地籍資訊整合"
      ],
      keyServices: [
        "市有房地承租續約線上申辦",
        "地方稅務抵繳證明查驗",
        "促參民間投資公開招商案查詢",
        "合法菸酒批發零售營業許可查詢"
      ]
    },
    {
      id: "dept-publicworks",
      name: "工務局",
      englishName: "Public Works Bureau",
      category: "infrastructure",
      categoryName: "工務與交通",
      chief: "高建銘",
      chiefTitle: "局長",
      phone: "(02) 2345-6789 轉 6300",
      location: "市政大樓 6 樓西側",
      website: "https://works.mindegov.example",
      bannerColor: "#17528a",
      motto: "精工淬鍊，韌性防災，築構安全可靠的城市骨幹",
      intro: "工務局肩負全市民生基礎工程重任，轄下設立新建工程處、養護工程處、水利工程處、公園路燈工程管理處及大地工程處。致力建構韌性承災海綿城市、平整安全的道路路網與優質綠帶空間。",
      duties: [
        "全市重大聯外幹道、高架橋梁及人行立體通道之規劃與新建",
        "道路鋪面定期刨除重鋪、人行道無障礙平整改善",
        "雨水下水道防汛排洪系統維護及滯洪池防洪操作",
        "全市民德市級公園、綠地生態系保護與主題共融式遊戲場建置",
        "山坡地水土保持監測及邊坡落石智慧預警"
      ],
      keyServices: [
        "全民路面平整與路燈障礙 24h 通報",
        "挖掘道路申請許可與即時施工監控圖台",
        "全市公園場地租借線上登記系統",
        "民間水土保持計畫提送與審查進度查詢"
      ]
    },
    {
      id: "dept-education",
      name: "教育局",
      englishName: "Education Bureau",
      category: "education",
      categoryName: "教育與文化",
      chief: "蘇雅芬",
      chiefTitle: "局長",
      phone: "(02) 2345-6789 轉 6400",
      location: "市政大樓 8 樓北側",
      website: "https://edu.mindegov.example",
      bannerColor: "#2b70c9",
      motto: "適性揚才，智慧教育，培育放眼未來的國際公民",
      intro: "教育局統理全市幼兒園、市立國中小、高中職、特殊教育學校及社會終身學習機構。全面推動雙語教育、AI 智慧科技校園、校校有冷氣及平價公立幼兒園倍增計畫，深耕孩子幸福學習未來。",
      duties: [
        "國民義務教育學區規劃與常態編班督導",
        "推動數位酷課雲科技輔助自主學習網絡",
        "公共幼兒園與非營利幼兒園擴展與平價化",
        "全市校園營養午餐三章一Q在地有機食材把關",
        "體育賽事推展、學校體育運動場館夜間開放市民使用"
      ],
      keyServices: [
        "國中小新生入學線上報到系統",
        "公立幼兒園線上登記與即時備取查詢",
        "民德市酷課雲線上自主學習平台帳號綁定",
        "校園開放時段場地借用線上預約"
      ]
    },
    {
      id: "dept-social",
      name: "社會局",
      englishName: "Social Affairs Bureau",
      category: "governance",
      categoryName: "政務與民生",
      chief: "許書晴",
      chiefTitle: "局長",
      phone: "(02) 2345-6789 轉 6500",
      location: "市政大樓 2 樓南側",
      website: "https://social.mindegov.example",
      bannerColor: "#0d5c75",
      motto: "關懷弱勢，暖心守護，編織綿密溫馨的社會安全網",
      intro: "社會局本著人道關懷與社會正義，推動兒少福利、婦女扶助、長者長青安居、身心障礙生活尊嚴支持及社會救助。透過跨局處社區安全防護網，不漏接任何一位需要援助的市民朋友。",
      duties: [
        "長者敬老愛心卡、長期照護生活津貼及日照中心輔導",
        "低收入戶、中低收入戶生活急難救助金審核發放",
        "社區公共托育家園、托嬰中心立案評鑑與津貼補助",
        "身心障礙者日間照護、輔具補助與無障礙居住空間改裝",
        "家庭暴力防治及兒少高風險個案危機介入救援"
      ],
      keyServices: [
        "育兒津貼與托育補助資格試算線上申辦",
        "敬老愛心卡線上換補發與點數加值",
        "市民輔具資源整合中心預約到府評估",
        "微型急難救助線上即時申報"
      ]
    },
    {
      id: "dept-economic",
      name: "經濟發展局",
      englishName: "Economic Development Bureau",
      category: "finance",
      categoryName: "財政與經濟",
      chief: "郭承宇",
      chiefTitle: "局長",
      phone: "(02) 2345-6789 轉 6600",
      location: "市政大樓 9 樓東側",
      website: "https://economic.mindegov.example",
      bannerColor: "#1d63b8",
      motto: "創新領航，產業升級，打造亞太最具競爭力經貿港都",
      intro: "經濟發展局致力於促進民德市產業聚落數位轉型、招商引資投資媒合、中小企業創業投資輔導、商圈特色活化與綠色低碳能源推廣。持續引進全球頂尖研發總部進駐民德智慧創新園區。",
      duties: [
        "民德高科技產業園區及軟體生技聚落招商評選",
        "青年創業育成基地孵化、低利青創貸款保證支持",
        "商業登記、工廠設立登記及公司變更便民登記",
        "傳統公有市場環境現代化改建及在地商圈特色行銷",
        "企業綠電媒合與工廠屋頂太陽光電設施推動"
      ],
      keyServices: [
        "公司商業登記線上申請與電子公文送達",
        "民德市青年創業優惠貸款線上送件",
        "全球企業投資民德一站式單一窗口服務",
        "傳統市場自治會振興專案補助申請"
      ]
    },
    {
      id: "dept-epb",
      name: "環境保護局",
      englishName: "Environmental Protection Bureau",
      category: "infrastructure",
      categoryName: "工務與交通",
      chief: "鄭志遠",
      chiefTitle: "局長",
      phone: "(02) 2345-6789 轉 6700",
      location: "市政大樓 7 樓西側",
      website: "https://epb.mindegov.example",
      bannerColor: "#147a61",
      motto: "藍天綠地，淨零碳排，守護世代共好的永續好環境",
      intro: "環境保護局全方位守護民德市的清淨空氣、純淨水質與整潔市容。落實資源循環零廢棄、推動電動公車與機車補助、引進 AI 科技執法查緝噪音排氣，邁向 2050 淨零碳排永續模範城。",
      duties: [
        "家戶一般垃圾收運、資源垃圾精細分類及廚餘堆肥再利用",
        "空氣品質監測站網維護、PM2.5 及有害氣體即時預警",
        "民德河川水體水質污染防治與工廠廢水排放稽查",
        "大型家具清運、環境消毒及登革熱病媒蚊防治",
        "全市民德低碳永續社區認證輔導與綠色採購推展"
      ],
      keyServices: [
        "大型廢棄家具線上免費預約清運",
        "即時垃圾車動態與定點清運路線地圖",
        "淘汰老舊燃油機車換購電動車補助線上申請",
        "公害噪音空污異味 24 小時線上檢舉通報"
      ]
    },
    {
      id: "dept-transport",
      name: "交通局",
      englishName: "Transportation Bureau",
      category: "infrastructure",
      categoryName: "工務與交通",
      chief: "沈國峰",
      chiefTitle: "局長",
      phone: "(02) 2345-6789 轉 6800",
      location: "市政大樓 6 樓東側",
      website: "https://transport.mindegov.example",
      bannerColor: "#226eb8",
      motto: "人本交通，智慧暢行，串聯便捷安全的通勤日常",
      intro: "交通局以「人本安全、綠色低碳、智慧無縫」為核心理念，主責民德捷運路網督導、公車路線智慧化重組、停車場智慧導航管理、號誌智慧聯鎖及通學步道友善行人環境改善。",
      duties: [
        "大眾捷運系統二期規劃與營運監管",
        "幹道智慧綠能公車路網優化與行車班次監測",
        "市區智慧路邊停車柱建置與智慧導引停車系統",
        "行人專用時相劃設、通學巷道彩色標線與交通寧靜區建置",
        "違規拖吊保管場督導與交通事故防制作業"
      ],
      keyServices: [
        "路邊停車繳費線上查繳與自動扣繳設定",
        "公車即時到站查詢與市民轉乘優惠試算",
        "計程車投訴與優良駕駛推薦回饋",
        "市區號誌異常秒數調整線上反映"
      ]
    },
    {
      id: "dept-health",
      name: "衛生局",
      englishName: "Health Bureau",
      category: "governance",
      categoryName: "政務與民生",
      chief: "何美玲",
      chiefTitle: "局長",
      phone: "(02) 2345-6789 轉 6900",
      location: "市政大樓 3 樓東側",
      website: "https://health.mindegov.example",
      bannerColor: "#0f6c8d",
      motto: "全人照護，守護健康，打造樂齡活力的健康名城",
      intro: "衛生局秉持專業嚴謹態度，守護市民食品藥物安全、傳染病精準防治、長照醫療資源無縫銜接及全民心理健康支持。設立 12 區現代化智慧健康中心，提供市民全生命週期預防保健。",
      duties: [
        "市售食品安全查驗、溯源標章稽核與食材登錄透明化",
        "季節性流感及新興傳染病疫苗配發與監測體系",
        "高齡長者失智友善社區推動與日間照護中心醫療支援",
        "各級醫療機構、診所及藥局醫事人員執業管理考核",
        "社區心理諮商駐點服務與生命關懷專線營運"
      ],
      keyServices: [
        "四癌篩檢與長者體檢線上預約",
        "預防接種證明中英文線上申請",
        "市民免費心理諮商門診線上預約掛號",
        "食品藥物中毒案件通報與標示諮詢"
      ]
    },
    {
      id: "dept-urban",
      name: "都市發展局",
      englishName: "Urban Development Bureau",
      category: "infrastructure",
      categoryName: "工務與交通",
      chief: "楊振華",
      chiefTitle: "局長",
      phone: "(02) 2345-6789 轉 7000",
      location: "市政大樓 5 樓西側",
      website: "https://urban.mindegov.example",
      bannerColor: "#1d4e89",
      motto: "宏觀願景，宜居永續，雕塑國際水岸美學新天際",
      intro: "都市發展局掌理民德市國土空間總體規劃、都市更新加速推動、高品質社會住宅建設營運、建築物使用執照核發及都市景觀風貌形塑，開創兼具歷史文化底蘊與現代科技之光榮城市。",
      duties: [
        "全市都市計畫主要計畫與細部計畫法定通盤檢討",
        "危老重建、自辦都更及公辦都更案之專案輔導與容積獎勵審議",
        "萬戶青年社會住宅興建、物業營運與只租不賣政策推動",
        "建築執照、使用執照、室內裝修審查與施工勘驗管考",
        "水岸天際線都市設計管制與公共藝術空間配置審議"
      ],
      keyServices: [
        "民德好宅青年社會住宅線上招租抽籤",
        "都市計畫使用分區證明線上即時核發",
        "危老重建輔導團免費諮詢線上預約",
        "建物室內裝修合格證明圖檔線上調閱"
      ]
    }
  ],

  // 市府活動專區
  cityEvents: [
    {
      id: "evt-01",
      title: "2026 民德水岸光影藝術季",
      category: "文化藝術",
      status: "ongoing",
      statusLabel: "進行中",
      dateRange: "2026/10/20 ~ 2026/11/20",
      location: "民德中央水岸生態公園（民德大橋東岸至河濱步道）",
      image: "assets/images/waterfront_festival.jpg",
      participants: "已突破 15 萬人次參觀",
      description: "匯聚 18 位海內外當代藝術巨擘，打造 24 座沉浸式光影裝置。週末每晚 19:00、20:00、21:00 展演水幕無人機立體矩陣秀，並設有在地特色小吃與文創市集。",
      highlights: ["水幕無人機璀璨矩陣秀", "24 組沉浸式巨型燈光裝置", "在地小吃與文創百攤市集", "捷運專屬彩繪列車及接駁車"]
    },
    {
      id: "evt-02",
      title: "2026 民德國際智慧永續高峰論壇",
      category: "科技經貿",
      status: "registration",
      statusLabel: "報名中",
      dateRange: "2026/11/12 ~ 2026/11/14",
      location: "民德國際會議展覽中心 3 樓大會堂",
      image: "assets/images/smart_city_expo.jpg",
      participants: "限量 1,200 席（剩餘 280 席）",
      description: "以「AI 驅動未來：數位孿生與淨零城市」為主題，匯集全球 12 國市長、前瞻科技獨角獸領袖，探討智慧交通、綠色能源電網與韌性防災的最新解決方案。",
      highlights: ["國際重量級院士專題演講", "智慧治理大數據實境展示", "青年黑客松成果頒獎典禮", "提供中英雙向同步口譯"]
    },
    {
      id: "evt-03",
      title: "第 16 屆民德市民萬人星光馬拉松",
      category: "健康體育",
      status: "upcoming",
      statusLabel: "即將額滿",
      dateRange: "2026/12/05 16:30 起跑",
      location: "市政大樓市民廣場（起終點）",
      image: "assets/images/minde_city_hall.jpg",
      participants: "報名率 92%（倒數 500 名）",
      description: "全台最美都會星光路跑！賽道串聯民德市政大道、中央林蔭綠廊與海濱夕陽大道，分為全馬組（42K）、半馬組（21K）及 6K 市民健康樂活組。",
      highlights: ["夜跑浪漫城市燈海賽道", "全台最奢華在地美食補給站", "完賽即贈限定極光運動紀念衫", "現場摸彩抽智慧綠能電動機車"]
    }
  ],

  // 市長信箱測試案件進度庫
  mockCases: [
    {
      caseNumber: "MD-20261020-0042",
      name: "林*誠",
      phone: "0912-***-456",
      category: "工務局養工處",
      title: "中央區市政二路與仁愛街口路面凹陷及標線磨損通報",
      date: "2026-10-20",
      status: "completed",
      statusText: "已結案回覆",
      timeline: [
        { date: "2026-10-20 09:15", title: "案件成立登記", desc: "系統自動收案並指派案號 MD-20261020-0042。" },
        { date: "2026-10-20 10:30", title: "分派承辦局處", desc: "案件經市長室審查，分案至工務局養護工程處第二工務所。" },
        { date: "2026-10-21 14:00", title: "現場勘驗與修復", desc: "工務所工程人員到場完成瀝青鋪面緊急填補，並重新劃設熱拌反光標線。" },
        { date: "2026-10-22 11:20", title: "驗收完成結案", desc: "市民通報事項已全數修復完畢，已發送簡訊與電子郵件結案通知。" }
      ],
      reply: "感謝市民林先生通報。工務局養工處已於 10 月 21 日下午派員完成路面銑鋪與新式防滑抗磨標線標繪，現場勘驗平整度良好，保障市民行車安全。再次感謝您的熱心反映！"
    },
    {
      caseNumber: "MD-20261023-0188",
      name: "陳*婷",
      phone: "0933-***-789",
      category: "交通局",
      title: "建請於新興國小校門口增設行人專用時相與綠底斑馬線",
      date: "2026-10-23",
      status: "processing",
      statusText: "專案評估中",
      timeline: [
        { date: "2026-10-23 15:40", title: "案件成立登記", desc: "系統自動收案完成。" },
        { date: "2026-10-24 09:00", title: "分派承辦局處", desc: "分案至交通局交通管制工程科。" },
        { date: "2026-10-25 10:00", title: "排定現地會勘", desc: "已排定於 10 月 29 日上午會同轄區分局與校方代表實地勘驗車流秒差。" }
      ],
      reply: "您好！本案涉及學童通學步道安全與路口時相調整，交通局交工科已正式立案，將於 10 月 29 日辦理現場會勘，會勘結果將於兩日內通知您。"
    }
  ]
};

// 匯出全域變數
window.MINDE_DATA = MINDE_DATA;
