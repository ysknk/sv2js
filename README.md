# sv2js

## Description

csvやtsvファイルを元にjs,jsonなどオブジェクト格納されたファイルを作成する。  
Googleスプレッドシートからのコピペでtsv形式になるので、gasを通さずにデータを扱いたい場合に使えるかも。  

## Requirement

* Node.js -> check cmd `node -v`

## Install

```sh
npm i -D https://github.com/ysknk/sv2js.git
```

## Usage

### add script in package.json

```json
{
  "scripts": {
    "ｓｖ２ｊｓ": "ｓｖ２ｊｓ"
  },
}
```

```sh
# check arguments help
npm run sv2js -- --help
```
