const request = require('request');
const cheerio = require('cheerio');
var question=[];
var homeUrl=[];
var subQuestionUrl =[];
const { DownloaderHelper } = require('node-downloader-helper');

/*
for(var i =1; i<10; i++){
  const dl = new DownloaderHelper(`https://www.selfstudys.com/get-pdf/14383${i}`, __dirname);
 
  dl.on('end', () => console.log('Download Completed'))
  dl.start();
}*/

let getHomeUrl = new Promise(function(resolve, reject){
  try{
    request('https://goprep.co/ncert-solutions', (error, response, html) => {
      if (!error && response.statusCode == 200) {
           const $ = cheerio.load(html);
        $('ul').find('li').each(function(i, items_list){
            $(items_list).find('a').each(function(j, li){
              if(li.children[j].data.toString().startsWith('Chapter')){
                //console.log(li.children[j].data +" -> "+li.attribs['href']);
                homeUrl.push(li.attribs['href']);
              }
            })
            resolve(homeUrl);
        })        
      }
    });
  }catch(error){
    console.log(error);
  }
})

 function questionUrls(url){
  return  new Promise(function(resolve, reject){
    request(url, (error, response, html) => {
      if (!error && response.statusCode == 200) {
           const $ = cheerio.load(html);
           $('div[class="flex flex-column question-display-list ph3"]').find('div > div > div > a').each(function (index, element) {
            question.push($(element).attr('href'));
           });
           resolve(question);
      }
    });
  });
} 

function getQuesAnswere(url){
  return  new Promise(function(resolve, reject){
    request("https://goprep.co"+url, (error, response, html) => {
       if (!error && response.statusCode == 200) {
           const $ = cheerio.load(html);
           $('div[class="flex flex-column bb b--black-10 pb3"]').find('span').each(function (index, element) {
            console.log("Question: " ,$(element).text());
          });
          $('div[class="mt2 mid-gray f4 custom-html-style pv2"]').find('p').each(function (index, element) {
            console.log("Answere: " ,$(element).text());
          });
           }
        })
  });
} 

function getsubQuestionUrl(url){
  return  new Promise(function(resolve, reject){
    request("https://goprep.co"+url, (error, response, html) => {
       if (!error && response.statusCode == 200) {
           const $ = cheerio.load(html);
           $('div[class="flex flex-column overflow-y-auto question-list-cont pb3"]').find('div > div > a').each(function (index, element) {
             subQuestionUrl.push($(element).attr('href'));
            });
            resolve(subQuestionUrl);
           }
        })
  });
} 

async function getQuestionUrls(){
  let resarray = await getHomeUrl;
  resarray.forEach(async function(item, index) {
  let subQuestion = await questionUrls(item).then(res=> res);  
  subQuestion.forEach(async function(item, index) {
    let subquesurl = await getsubQuestionUrl(item).then(res=> res);  
    subquesurl.forEach(async function(item, index) {
     await getQuesAnswere(item).then(res=> res);   
    })
  })
})
}
 getQuestionUrls();