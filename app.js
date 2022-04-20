const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', 'utf8');
const other_page = fs.readFileSync('./other.ejs', 'utf8');
const style_css = fs.readFileSync('./style.css', 'utf8');

const server = http.createServer(getFromClient);
server.listen(3000);
console.log('Server start');

function getFromClient(req, res) {
  const baseURL = 'http://localhost:3000';
  const url = new URL(req.url, baseURL);
  let content;
  switch (url.pathname) {
    case '/':
      responseIndex(req, res);
      break;

    case '/other':
      responseOther(req, res);
      break;

    case '/style.css':
      res.writeHead(200, {'Content-Type': 'text/css'});
      res.write(style_css);
      res.end();
      break;

    default:
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('no page...');
      break;
  }
}

// 追加するデータ用変数
let data = {msg: 'no message...'};

// indexのアクセス処理
function responseIndex(req, res) {
  // POSTアクセス時の処理
  if(req.method === 'POST') {
    let body = '';

    // データ受信のイベント処理
    req.on('data', (data) => {
      body += data;
    });

    // データ受信終了のイベント処理
    req.on('end', () => {
      data = new URLSearchParams(body);
      // クッキーの保存
      setCookie('msg', data.get('msg'), res);
      write_index(req, res);
    });
  } else {
    write_index(req, res);
  }
}

// indexの表示の作成
function write_index(req, res) {
  const msg = "※伝言を表示します。";
  const cookie_data = getCookie('msg', req);
  console.log(`テンプレートに渡す${data}`);
  console.log(data.get('msg'));
  const content = ejs.render(index_page, {
    title: "Index",
    content: msg,
    data: data.get('msg'),
    cookie_data: cookie_data,
  });
  console.log(`${data}`);
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(content);
  res.end();
}

// クッキーの値を設定
function setCookie(key, value, res) {
  const cookie = encodeURIComponent(value);
  console.log(`クッキーに値を設定します${cookie}`);
  res.setHeader('Set-Cookie', [key + '=' + cookie]);
}

// クッキーの値を取得
function getCookie(key, req) {
  const cookie_data = req.headers.cookie ?? '';
  const data = cookie_data.split(';');
  let result;
  for(const value of data) {
    if(value.trim().startsWith(key + '=')) {
      result = value.trim().substring(key.length + 1);
      console.log(`バリューの値は${value}`);
      console.log(`リザルトの値は${result}`);
      return decodeURIComponent(result);
    }
  }
  return '';
}

const data2 = {
  'Taro': ['taro@yamada', '09-999-999', 'Tokyo'],
  'Hanako': ['hanako@flower', '080-888-888', 'Yokohama'],
  'Sachiko': ['sachi@happy', '070-777-777', 'Nagoya'],
  'Ichiro': ['ichi@baseball', '060-666-666', 'USA'],
};

// otherのアクセス処理
function responseOther(req, res) {
  const msg = "これはOtherページです。";
  const content = ejs.render(other_page, {
    title: "Other",
    content: msg,
    data: data2,
    filename: 'data_item'
  });
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(content);
    res.end();
}
