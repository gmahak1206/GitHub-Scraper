const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

request('https://www.github.com/topics', cb);

function cb(error , response , html){
    if (error){
        console.log('error' , error);
    }
    else{
        handleHtml(html);
    }
}


function handleHtml(html){
    let $ = cheerio.load(html);
    let cntarr = $('.topic-box');
    let topicarr = $('.topic-box .f3');
    let cnt = 0;
    for (let i = 0 ; i < cntarr.length ; i++){
        let elem = $(cntarr[i]);
        let topic = $(topicarr[i]).text();
        let href = $(elem.find('a')).attr('href');
        let complete_url = 'https://github.com' + href;
        cnt++;
        topics(complete_url , topic);
    }
        
}

function topics(url , topic_name){
    topic_name = topic_name.trim()
    fs.mkdir(topic_name , function(err) {
        if (err) {
          console.log(err)
        } else {
          console.log("New directory successfully created.")
        }
      })
    request(url, cb2);

    function cb2(error , response , html){
        if (error){
            console.log('error' , error);
        }
        else{
            handleTopics(html);
        }
    }

    
    function handleTopics(html){
        let $ = cheerio.load(html);
        let arr = $('article .px-3');
        

        for (let i = 0 ; i < 8 ; i++){
            let data = $(arr[i]).text().split(' ');
            let cnt = 0 , repo_name , repo_owner;
            let new_url = "https://github.com/"
            for(let j in data){
                if (data[j] != '' && data[j] != '\n'){
                    if (cnt == 1){
                        repo_owner = data[j].trim();
                    }
                    if  (cnt == 3){
                        repo_name = data[j].trim();
                    }
                    new_url += data[j].trim();
                    cnt++;
                }
                if (cnt > 3){
                    break;
                }
            }
            
            issues(new_url+'/issues' , topic_name , repo_owner , repo_name);
        }
        
    }
}

function issues(url , topic , repo_owner , repo_name){

    request(url, cb3);

    function cb3(error , response , html){
        if (error){
            console.log('error' , error);
        }
        else{
            handleIssues(html);
        }
    }

    function handleIssues(html){
        
        let $ = cheerio.load(html);
        let arr = $('.Box-row');
        temp_links = {}
        for (let i = 0 ; i < arr.length ; i++){
            let data = $(arr[i]).find('a').attr('href');
            temp_links[i] = data;
        }
        let stringData = JSON.stringify(temp_links);
        fs.writeFileSync(topic + '/' + repo_owner + "_" + repo_name + ".json" ,stringData);
        // console.log(temp_links);
    }

}


