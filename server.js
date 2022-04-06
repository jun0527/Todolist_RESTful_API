const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle.js');
const todoData = [];
const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json',
  }
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  })
  if (req.url === '/todos' && req.method === 'GET') {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      'status': 'success',
      'data': todoData,
    }));
    res.end();
  } else if(req.url === '/todos' && req.method === 'POST') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          const obj = {
            'title': title,
            'id': uuidv4(),
          };
          todoData.push(obj);
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            'status': 'success',
            'data': todoData,
          }));
          res.end();
        } else {
          errorHandle(res);
        }
      } catch(err) {
        errorHandle(res);
      }
    })
  } else if(req.url === '/todos' && req.method === 'DELETE') {
    todoData.length = 0;
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      'status': 'success',
      'data': todoData,
    }));
    res.end();
  } else if(req.url.startsWith('/todos/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    const index = todoData.findIndex(todo => todo.id === id);
    if (index !== -1) {
      todoData.splice(index, 1);
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        'status': 'success',
        'data': todoData,
      }));
      res.end();
    } else {
      errorHandle(res);
    }
  } else if(req.url.startsWith('/todos/') && req.method === 'PATCH') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title;
        const id = req.url.split('/').pop();
        const index = todoData.findIndex(item => item.id === id);
        if (title !== undefined && index !== -1) {
          todoData[index].title = title;
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            'status': 'success',
            'data': todoData,
          }));
          res.end();
        } else {
          errorHandle(res);
        }
      } catch {
        errorHandle(res);
      }
    })
  } else if(req.url === '/todos' && req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      'status': false,
      'message': '404 not find',
    }));
    res.end();
  }
}
const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);