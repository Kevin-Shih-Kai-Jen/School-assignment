import fs from 'fs';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// 載入 .env 變數
dotenv.config();

// 初始化 Gemini API (建議使用 gemini-1.5-pro 處理複雜的程式碼與邏輯)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// 將圖片轉為 Gemini API 接受的格式
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

async function runAutoFix() {
  console.log("📸 [1/4] 啟動瀏覽器並截圖中...");
  const browser = await puppeteer.launch({
     executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage();
  
  // ⚠️ 請在這裡貼上你 Live Server 的真實網址！
const liveServerUrl = 'http://127.0.0.1:3000/second-year-first-sem/data-visualization/assignment%202/codes/main.html?vscode-livepreview=true';
  
  // 設定較大的視窗尺寸，確保截圖排版接近筆電螢幕
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(liveServerUrl, { waitUntil: 'networkidle0' });
  
  // 等待 2 秒，確保 Vega-Lite 的圖表動畫和資料都載入完畢
  await new Promise(r => setTimeout(r, 2000));
  
  const screenshotPath = 'screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await browser.close();
  console.log("✅ 截圖完成！");

  console.log("📄 [2/4] 讀取本地程式碼檔案...");
  // 讀取你的 main.html 和 style.css
  const htmlContent = fs.readFileSync('main.html', 'utf8');
  const cssContent = fs.readFileSync('style.css', 'utf8');

  console.log("🧠 [3/4] 正在將資料發送給 Gemini 分析 (請稍候約 15-30 秒)...");
  const imagePart = fileToGenerativePart(screenshotPath, "image/png");
  
  const prompt = `
  你現在是一位頂尖的 UI/UX 設計師、資料視覺化專家與文案大師。
  我正在完成 Monash University 的資料視覺化作業 (Scrollytelling 網頁)，主架構已經建置完畢。
  
  【視覺回饋工具與你的任務】
  我附上了「目前網頁的真實截圖 (Screenshot)」以及「我的 HTML 與 CSS 原始碼」。
  請找出截圖中不美觀、不對稱或字體難以閱讀的地方，並修改對應的 CSS 或給予 Vega-Lite Config 建議來修復它，目標是拿下 HD (High Distinction)！

  🚫 絕對禁忌：絕對「不可」修改任何 HTML 的 id、class 名稱，也「不可」修改 Vega 讀取資料的路徑或核心邏輯。不要破壞現有的穩定架構。

  【請根據截圖與 HD 評分標準，執行以下優化】
  1. 視覺除錯 (Visual Debugging)：檢查截圖中的 .chart-container 卡片是否置中？圖表與文字的比例是否失衡？留白 (White space) 是否足夠？請修改 CSS 讓版面達到完美的「對稱與平衡」。
  2. 圖地關係與色彩 (Figure-ground & Color)：為這個 CS2 電競主題設計一套「冷色調底色搭配高對比點綴色」的精品調色盤。
  3. 進階排版 (Typography)：目前的字體是 Inter，請在 CSS 引入一個適合標題的非標準字體（具電競或科技感），並嚴格設定行距與字重，確保易讀性。
  4. 敘事文案擴寫 (Storytelling)：目標受眾是「一般大眾」。請幫我將 HTML 裡留白的 <p> Introduction? </p>、<div id="conclusion"> 以及各個 text_block，擴寫成引人入勝的故事。針對如 K/D Ratio, Map Veto, Utility Damage 等 CS2 術語，請用非常淺顯易懂的文字加上簡短解釋。
  5. Vega-Lite 全域美化 (Config)：請給我一段 JSON 的 "config": {} 程式碼，用來移除醜陋的圖表邊框、統一圖表字體為網頁字體、並讓圖表背景透明以融入卡片設計。

  【目前的原始碼】
  HTML 架構：
  ${htmlContent}

  目前的 CSS：
  ${cssContent}

  請完整回傳：
  1. 修改後的完整 style.css。
  2. 填滿動人文案的 HTML 區塊 (只需回傳有修改文字的 tags 即可)。
  3. 通用的 Vega-Lite Config JSON 區塊。
  `;

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    console.log("💾 [4/4] 收到結果，正在儲存...");
    fs.writeFileSync('gemini_suggestion.md', responseText);
    console.log("🎉 任務完成！請查看 codes 資料夾底下的 gemini_suggestion.md 檔案。");
  } catch (error) {
    console.error("❌ 發生錯誤：", error);
  }
}

runAutoFix();