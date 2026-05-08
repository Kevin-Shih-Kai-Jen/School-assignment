import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// 載入 .env 變數
dotenv.config();

// 初始化 Gemini API (建議使用 gemini-1.5-flash 或 pro，支援圖片輸入)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  
  // 取得目前資料夾的絕對路徑，並將 HTML 轉為 file:// 協定網址
  const htmlPath = `file://${path.resolve('index.html')}`;
  
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });
  // 將截圖存為 screenshot.png
  const screenshotPath = 'screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await browser.close();
  console.log("✅ 截圖完成！");

  console.log("📄 [2/4] 讀取本地程式碼檔案...");
  const cssContent = fs.readFileSync('style.css', 'utf8');
  const jsonContent = fs.readFileSync('data.json', 'utf8');

  console.log("🧠 [3/4] 正在將資料發送給 Gemini 分析...");
  const imagePart = fileToGenerativePart(screenshotPath, "image/png");
  
  // 這裡是你對 Gemini 下的指令，可以根據需求隨時修改
  const prompt = `
  這是一張透過我的 index.html 產生的網頁截圖。
  以下是我目前的 CSS 與 JSON 檔案。
  
  我的需求：請幫我修改 CSS 讓卡片置中對齊，並在 JSON 裡新增一個 "description" 欄位。
  
  【目前的 style.css】
  ${cssContent}
  
  【目前的 data.json】
  ${jsonContent}
  
  請直接提供修改後的完整 CSS 與 JSON 程式碼，並在程式碼區塊標示對應的語言。
  `;

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    console.log("💾 [4/4] 收到結果，正在儲存...");
    // 將 Gemini 的回覆存下來
    fs.writeFileSync('gemini_suggestion.md', responseText);
    
    console.log("🎉 任務完成！請查看 gemini_suggestion.md 檔案。");
  } catch (error) {
    console.error("❌ 發生錯誤：", error);
  }
}

runAutoFix();