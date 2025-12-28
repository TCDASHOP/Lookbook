# SAIREN COLOR ARCHIVE / LOOKBOOK

このリポジトリは **「雑誌のように“ページをめくる” LOOKBOOK」** を配信するためのテンプレートです。
- トップ（アーカイブ）で **タイトル＋号数** を表示
- クリックで **Issue ページ（フリップブック）** を開く
- **表紙 → 001〜… → 裏表紙** の順でページ送り

---

## 1) いちばん大事：画像の置き場所とファイル名（固定）

**Issue の画像は “置き場所＆名前が固定”** です。ここがズレると、あなたが見ている

> 画像が見つかりません: assets/cover.webp

のようなエラーになります。

### Issue 01 の例（必ずこの通り）

```
/issues/issue-01/assets/cover.webp
/issues/issue-01/assets/back.webp
/issues/issue-01/assets/logo.webp
/issues/issue-01/assets/pages/001.webp
/issues/issue-01/assets/pages/002.webp
...
/issues/issue-01/assets/pages/020.webp
```

- **拡張子は `.webp` 固定**
- **001〜020 は “3桁ゼロ埋め” 固定**（`1.webp` や `01.webp` はNG）
- 画像を差し替えるときは **「同名で上書き」** してください

---

## 2) フォルダー構成（最終決定版 / 未来の Issue 増加に対応）

```
/ (repo root)
  CNAME
  index.html
  robots.txt
  sitemap.xml

  /assets/
    /css/
      style.css
      issue.css
    /js/
      site.js
      archive.js
    /images/
      /covers/
        issue-01-cover.webp  (アーカイブ一覧用サムネ)
    /icons/
      favicon.svg
      favicon.ico
    /data/
      issues.json            (Issue一覧のマスタ)

  /data/
    issues.json              (互換用：/assets/data と同内容)

  /issues/
    /issue-01/
      index.html
      /js/
        flipbook.js
      /assets/
        cover.webp
        back.webp
        logo.webp
        /pages/
          001.webp
          ...
          020.webp

    /issue-02/
      ...（issue-01 を複製して増やす）

    /issue-03/
      ...
```

### どこを増やせば Issue が増える？
- `issues/issue-02/` を追加（`issue-01` を丸ごとコピー）
- `assets/data/issues.json`（＋ `data/issues.json`）に **Issue 02 の情報を追記**
- `assets/images/covers/issue-02-cover.webp` を追加（一覧カードのサムネ）
- `sitemap.xml` に `issues/issue-02/` を追加（SEO）

---

## 3) issues.json（Issue 一覧の書き方）

`assets/data/issues.json` と `data/issues.json` は同じ内容です。
（どちらか片方だけ編集して片方が古いと混乱するので、**同じに保つ**のが安全です）

例：

```json
{
  "site": {
    "brand": "SAIREN COLOR ARCHIVE",
    "subtitle": "LOOKBOOK"
  },
  "issues": [
    {
      "id": "issue-01",
      "title": "COLOR AS TIME",
      "year": "2026",
      "pages": 20,
      "path": "issues/issue-01/",
      "thumbnail": "assets/images/covers/issue-01-cover.webp",
      "description": "a lookbook where color is experienced as time."
    }
  ]
}
```

- `id`：フォルダ名と一致（`issues/issue-01/`）
- `path`：末尾の `/` を残す（相対パス解決を安定させるため）
- `pages`：**001〜020 の枚数と一致**

---

## 4) issue-01/js/flipbook.js は必要？（結論：必要）

**必要です。削除しないでください。**

このファイルが
- 表紙→ページ→裏表紙
- 次/前
- ページ番号表示
- 画像の読み込み

を担当しています。

> 「/flipbook.js は削除？」

→ **削除しません。**

（`issue-01/js/issue.js` のような別ファイルは、この構成では **不要** です。）

---

## 5) デプロイ（GitHub Pages / Cloudflare）

- GitHub Pages は **root** を公開（`index.html` がある階層）
- Cloudflare は `look.sairencolorarchive.com` を Pages（または GitHub Pages）に向ける
- `CNAME` には `look.sairencolorarchive.com` を入れる

---

## 6) トラブルシュート（頻出）

### A. 「画像が見つかりません: assets/cover.webp」
原因はほぼこれ：
- `issues/issue-01/assets/cover.webp` が存在しない
- 拡張子が `.webp` じゃない（`.WEBP` / `.jpg` など）
- `cover.webp` のスペル違い（`Cover.webp` など）

**解決**：上の「1) 画像の置き場所とファイル名」を“完全一致”で揃える。

### B. 001〜020 のどこかで止まる/真っ黒
- `assets/pages/00X.webp` の欠番・命名ズレの可能性が高い

**解決**：`001.webp` から連番で存在するか確認。

---

## 7) “雑誌感”を上げるための次の一手（設計メモ）

このテンプレは「破綻しない最小構成」に寄せています。
雑誌っぽさをさらに強めるなら、次の順で足すのが安全です。

1. **ページめくりの影（paper shadow）強化**（CSSのみ）
2. **表紙だけ“紙質テクスチャ”**（cover.webp に薄く入れる）
3. **目次ページ（002〜003 など）** を追加
4. Issue 内 i18n（見出し・UI）を追加

---

## 8) 変更しないルール（破綻防止）

- Issue 内の画像パスは **相対パス前提**（フォルダ移動すると壊れやすい）
- 画像名は **固定**（cover/back/logo/pages/001〜）
- `issues.json` の `pages` と実ファイル枚数は一致

