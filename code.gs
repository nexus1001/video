var CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("token");
var id = PropertiesService.getScriptProperties().getProperty("doc");

function doPost(post) {
  var obj = JSON.parse(post.postData.contents);
  var events = obj["events"];
      reply_message(events[0]);
  
}
function getImg(messageId) {   
  var url = "https://api-data.line.me/v2/bot/message/" + messageId + "/content";  
  var options = { 
    "method" : "get",
    "headers" : {
    "Content-Type" : "application/json", 
    'Authorization': "Bearer " + CHANNEL_ACCESS_TOKEN
    }
  }; 
  return UrlFetchApp.fetch(url, options);     
 }


function reply_message(e) 
{
  var return_text;
  if(e.message.type=="text") 
  {
    var input_text = e.message.text;
    var document = DocumentApp.openById(id).appendParagraph(input_text);
    return_text = "追加しました";
    
  }
  else if(e.message.type=="image")
  {
    var input_img = getImg(e.message.id);
    var document = DocumentApp.openById(id).appendImage(input_img);
    return_text = "追加しました";
  }
  else
  {
    return_text = "非対応の形式です"
  }
  
  var postData = {
    "replyToken" : e.replyToken,
    "messages" : [
      {
        "type" : "text",
        "text" : return_text
      }
    ]
  };
  
  var options = {
    "method" : "post",
    "headers" : {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer " + CHANNEL_ACCESS_TOKEN
    },
    "payload" : JSON.stringify(postData)
  };
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", options);

}