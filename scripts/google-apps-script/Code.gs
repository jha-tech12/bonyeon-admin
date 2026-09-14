/**
 * BONYEON 문의접수 Google Apps Script
 *
 * 기능:
 * 1. create (기본) — 랜딩페이지 문의 폼 저장
 * 2. list — 관리자 문의 목록 조회
 * 3. update — 처리 상태(H열) / 비고(I열) 수정
 *
 * Script Properties 설정:
 *   ADMIN_API_KEY = 관리자 API 키 (임의의 긴 문자열)
 */

var SHEET_NAME = "문의접수";
var VALID_STATUSES = ["접수", "확인", "완료"];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.action === "list") {
      return handleList(data);
    }

    if (data.action === "update") {
      return handleUpdate(data);
    }

    return handleCreate(data);
  } catch (err) {
    return jsonResponse({ success: false, error: String(err.message || err) });
  }
}

function handleCreate(data) {
  var sheet = getSheet();

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.age || "",
    data.phone || "",
    data.email || "",
    data.message || "",
    data.privacyAgreed ? "Y" : "N",
    "접수",
    "",
  ]);

  return jsonResponse({ success: true });
}

function handleList(data) {
  if (!verifyAdminKey(data.apiKey)) {
    return jsonResponse({ success: false, error: "Unauthorized" }, 401);
  }

  var sheet = getSheet();
  var rows = sheet.getDataRange().getValues();
  var inquiries = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[1]) continue;

    inquiries.push({
      rowId: i + 1,
      submittedAt: formatDate(row[0]),
      name: String(row[1] || ""),
      age: String(row[2] || ""),
      phone: String(row[3] || ""),
      email: String(row[4] || ""),
      message: String(row[5] || ""),
      privacyAgreed: String(row[6] || ""),
      status: String(row[7] || "접수"),
      notes: String(row[8] || ""),
    });
  }

  inquiries.reverse();

  return jsonResponse({ success: true, inquiries: inquiries });
}

function handleUpdate(data) {
  if (!verifyAdminKey(data.apiKey)) {
    return jsonResponse({ success: false, error: "Unauthorized" }, 401);
  }

  var rowId = Number(data.rowId);
  if (!rowId || rowId < 2) {
    return jsonResponse({ success: false, error: "Invalid rowId" }, 400);
  }

  var sheet = getSheet();
  var lastRow = sheet.getLastRow();

  if (rowId > lastRow) {
    return jsonResponse({ success: false, error: "Row not found" }, 404);
  }

  if (data.status !== undefined && data.status !== null) {
    if (VALID_STATUSES.indexOf(data.status) === -1) {
      return jsonResponse({ success: false, error: "Invalid status" }, 400);
    }
    sheet.getRange(rowId, 8).setValue(data.status);
  }

  if (data.notes !== undefined && data.notes !== null) {
    sheet.getRange(rowId, 9).setValue(String(data.notes));
  }

  return jsonResponse({ success: true });
}

function getSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error("시트 탭 '" + SHEET_NAME + "'을(를) 찾을 수 없습니다.");
  }
  return sheet;
}

function verifyAdminKey(key) {
  var expected = PropertiesService.getScriptProperties().getProperty("ADMIN_API_KEY");
  return expected && key === expected;
}

function formatDate(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  }
  return String(value);
}

function jsonResponse(payload, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );

  if (statusCode) {
    // GAS Web App does not support custom HTTP status codes directly.
    // Admin API interprets payload.success / payload.error instead.
  }

  return output;
}
