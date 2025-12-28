# SAIREN COLOR ARCHIVE — Lookbook (Complete Template)

このZIPは「壊れにくい未来対応フォルダ構成」の完全テンプレです。

## 構造
- /data/issue-XX.json : Issueごとのページ一覧（画像パス）
- /pages/issue-XX/    : 実画像（001.webp, 002.webp...）
- /issue-XX/          : ビューア（index.html + css/js）
- /data/issues.json   : Archive一覧

## 新しいIssue追加手順（最短）
1) /pages/issue-02/ に画像を入れる（001.webp〜）
2) /data/issue-02.json を作る（画像パスは /pages/issue-02/001.webp 形式）
3) /issue-01/ をコピーして /issue-02/ を作る（title/OG必要なら変更）
4) /data/issues.json に追記
5) /sitemap.xml に /issue-02/ を追記

## 重要ルール
- フォルダ名/ファイル名は小文字
- 画像は3桁連番（001.webp）
- JSON内の画像パスは「先頭/の絶対パス」
