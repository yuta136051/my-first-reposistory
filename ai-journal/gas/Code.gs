/**
 * AIジャーナリング GAS Web App
 *
 * iPhoneショートカット or Gemまとめからの POST を受け、
 * Google Drive「日記」フォルダの月次 Google Docs に日付見出し付きで先頭追記する。
 * ストリーク（連続記録日数）を計算してレスポンスに含める。
 */

// === 設定 ===
const JOURNAL_FOLDER_ID = 'PUT_YOUR_FOLDER_ID_HERE'; // Driveの「日記」フォルダID
const SHARED_TOKEN = 'PUT_YOUR_RANDOM_TOKEN_HERE';   // ショートカット側と一致させる簡易認証
const TIMEZONE = 'JST';

// === エントリポイント ===
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.token !== SHARED_TOKEN) {
      return jsonResponse_({ ok: false, error: 'unauthorized' });
    }

    const mode = body.mode || 'entry'; // 'entry' | 'skip' | 'weekend'
    const text = (body.text || '').trim();
    const now = new Date();

    if (mode === 'entry' && !text) {
      return jsonResponse_({ ok: false, error: 'empty_text' });
    }

    const result = appendToMonthlyDoc_(now, text, mode);
    const streak = updateStreak_(now, mode);

    return jsonResponse_({
      ok: true,
      isNew: result.isNew,
      url: result.url,
      streak: streak,
    });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

// === 月次Docsへの追記 ===
function appendToMonthlyDoc_(now, text, mode) {
  const ym = Utilities.formatDate(now, TIMEZONE, 'yyyy-MM');
  const fileName = `日記_${ym}`;
  const folder = DriveApp.getFolderById(JOURNAL_FOLDER_ID);

  let docFile;
  let isNew = false;
  const it = folder.getFilesByName(fileName);
  if (it.hasNext()) {
    docFile = it.next();
  } else {
    const created = DocumentApp.create(fileName);
    DriveApp.getFileById(created.getId()).moveTo(folder);
    const cdoc = DocumentApp.openById(created.getId());
    cdoc
      .getBody()
      .appendParagraph(`# ${ym}`)
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    cdoc.saveAndClose();
    docFile = DriveApp.getFileById(created.getId());
    isNew = true;
  }

  const doc = DocumentApp.openById(docFile.getId());
  const docBody = doc.getBody();
  const dateStr = Utilities.formatDate(now, TIMEZONE, "yyyy-MM-dd (E) HH:mm");

  const tag =
    mode === 'weekend' ? ' 【週末レビュー】'
    : mode === 'skip' ? ' 【記録なし】'
    : '';

  const content = mode === 'skip' ? '（記録なし）' : text;

  // 月見出し (index 0) の直下に挿入し、最新が上に来るようにする
  docBody.insertParagraph(1, content);
  docBody
    .insertParagraph(1, `## ${dateStr}${tag}`)
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  doc.saveAndClose();
  return { isNew, url: docFile.getUrl() };
}

// === ストリーク計算 ===
function updateStreak_(now, mode) {
  const props = PropertiesService.getScriptProperties();
  const today = Utilities.formatDate(now, TIMEZONE, 'yyyy-MM-dd');
  const lastDate = props.getProperty('lastEntryDate');
  let streak = Number(props.getProperty('streak') || 0);

  if (lastDate === today) {
    return streak;
  }

  if (!lastDate) {
    streak = 1;
  } else {
    const diff = daysBetween_(lastDate, today);
    if (diff === 1) {
      streak += 1;
    } else if (mode === 'skip' && diff <= 3) {
      // skipモードでは3日以内ならソフトストリーク継続
      streak += 0;
    } else {
      streak = 1;
    }
  }

  props.setProperty('lastEntryDate', today);
  props.setProperty('streak', String(streak));
  return streak;
}

function daysBetween_(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

// === ヘルパー ===
function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// === テスト関数（手動実行用） ===
function testAppend() {
  const fakePost = {
    postData: {
      contents: JSON.stringify({
        token: SHARED_TOKEN,
        text: 'これはテストエントリです。',
        mode: 'entry',
      }),
    },
  };
  Logger.log(doPost(fakePost).getContent());
}

function testWeekend() {
  const fakePost = {
    postData: {
      contents: JSON.stringify({
        token: SHARED_TOKEN,
        text: '## 2026-05-31 (日) 20:30 【週末レビュー】\n\n**ハイライト**: ...',
        mode: 'weekend',
      }),
    },
  };
  Logger.log(doPost(fakePost).getContent());
}

function resetStreak() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log('streak reset');
}
