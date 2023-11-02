import * as http from 'http'
import * as fs from 'fs'
import * as p from 'path'
import * as url from 'url'
import { IncomingMessage, ServerResponse } from 'http'

const server = http.createServer()
const publicDir = p.resolve(__dirname, 'public')
let cacheAge = '31536000'

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
  const { method, url: path, headers } = request
  if(method !== 'GET'){
    response.statusCode = 405;
    response.end('method not allowed')
    return
  }
  console.log(path);
  const { pathname, search } = url.parse(path as string)
  let filename = pathname?.substr(1)
  if(filename === ''){
    filename = 'index.html'
  }
  fs.readFile(p.resolve(publicDir, filename as string), (error, data) => {
    if (error) {
      if(error.errno === -2){
        response.statusCode = 404;
        fs.readFile(p.resolve(publicDir, '404.html'),(error,data)=>{
          response.end(data)
        })
      }else{
        response.statusCode = 500;
         response.end('server error')
      } 
    }else{
      // 没有error的情况
      response.setHeader('Cache-Control',`public,max-age=${cacheAge}`)
      response.end(data)
    }
  });
})

server.listen(8088)