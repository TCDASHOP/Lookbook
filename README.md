# SAIREN COLOR ARCHIVE｜LOOKBOOK（雑誌めくり）

このリポジトリは **LOOKBOOK専用**です。  
TOP（Issue一覧）→ Issue（表紙→001〜020→裏表紙）を **ページめくり演出**で表示します。

---

## 目的（この設計で守っていること）
- **雑誌体験**：表紙 → 本文（001〜）→ 裏表紙を「めくる」
- **未来性**：Issueが増えても、毎回コピペ増築で終わる
- **壊れない**：画像パス／大文字小文字／拡張子の事故を最小化
- **最低限のSEO**：canonical / OGP / robots / sitemap / JSON-LD をLOOKBOOK内で完結

---

## フォルダ構成（最終決定版）
```txt
/（repo root）
├─ CNAME
├─ index.html
├─ 404.html
├─ robots.txt
├─ sitemap.xml
│
├─ /data/
│  └─ issues.json
│
├─ /assets/
│  ├─ /css/
│  │  ├─ style.css
│  │  └─ issue.css
│  ├─ /js/
│  │  └─ archive.js
│  ├─ /data/
│  │  └─ i18n.json
│  └─ /images/
│     ├─ /covers/
│     │  └─ issue-01-cover.webp
│     └─ /og/
│        └─ og.webp
│
└─ /issues/
   └─ /issue-01/
      ├─ index.html
      ├─ /js/
      │  └─ flipbook.js
      └─ /assets/
         ├─ cover.webp
         ├─ back.webp
         ├─ logo.webp（任意）
         └─ /pages/
            ├─ 001.webp
            ├─ ...
            └─ 020.webp
