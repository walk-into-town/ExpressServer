const fetch = require('node-fetch')
var aws = require('aws-sdk')
var dotenv = require('dotenv')
const fs = require('fs')
dotenv.config()
aws.config.update({
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
})
var dynamodb = new aws.DynamoDB()
let doclient = new aws.DynamoDB.DocumentClient()


let value = 'Coupon'
const run = async() => {
  let scan = await doclient.scan({
    TableName: value,
    ProjectionExpression: 'id'
  }).promise()
  let ItemsArray = [] 
  scan.Items.forEach(id => {
    let deleteparams = {
      TableName: value,
      Key:{
        'id': id.id
      }
    }
    doclient.delete(deleteparams, function(err, data){
      if(err){
        console.log(err)
      }
      else{
        console.log(data)
      }
    })
  })
}
run()

// let RankParam = {
//   TableName: 'test',
//   Key: {test: 'test'},
//   UpdateExpression: 'add cleared :clear',
//   ExpressionAttributeValues: {':clear': 1}
// }
// doclient.update(RankParam, function(err, data){
//   if(err) console.log(err)
//   else console.log(data)
// })

// doclient.query({
//   TableName: 'test', 
//   KeyConditionExpression: 'test = :value', 
//   ExpressionAttributeValues: {':value': 'test'}
//   }, 
//   function(err, data){
//     if(err) console.log(err)
//     else console.log(data.Items)
// })

// doclient.scan({TableName: 'Coupon'}, function(err, data){
//   if(err) console.log(err)
//   else console.log(data)
// })

// let queryParam = {
//   TableName: 'Coupon',
//   KeyConditionExpression: 'id = :id',
//   ExpressionAttributeValues: {':id': 'zlGtU4+U01IZnxnZkszUw79XGpviS6Bw578Kjx3u/0U='}
// }
// const run = async() => {
//   let result = await doclient.query(queryParam).promise()
//   for(const coupon of result.Items){
//     let date = coupon.endDate
//     let currdate = new Date().toISOString()
//     console.log(date)
//     console.log(currdate)
//     if(date > currdate){
//       console.log('test')
//     }
//   }
// }
// run()

// let dir = __dirname + '/uploads/4a31b72ba06ebe76b32f11197ab4260442015a45.mp3'
// fs.unlink(dir, err => {
//   console.log(err)
// })

// doclient.query({
//   TableName: 'Coupon',
//   KeyConditionExpression: 'id = :id',
//   ExpressionAttributeValues: {':id': 'm3Qrb7YlVEbw0UUdvNf73w8sElm1aNuvmY0q6bdmYsg='}
// }, function(err, data){
//   if(err) console.log(err)
//   else console.log(data)
// })
// doclient.query({
//   TableName: 'Coupon',
//   KeyConditionExpression: 'id = :id',
//   ExpressionAttributeValues: {':id': 'DWJrrhor2TQAYD242x9jmOEqJWVZlrb+U+VrqdSqmbY='}
// }, function(err, data){
//   if(err) console.log(err)
//   else console.log(data)
// })


// let couponParams = {
//   TableName: 'Coupon',
//   Key: {id: 'wuiwWbmYmJU3w2+m/BtJ7DVhMil5mDxLF9gImc3xZ28='},
//   UpdateExpression: 'add issued :number',
//   ConditionExpression: 'attribute_exists(id) and issued < #limit',
//   ExpressionAttributeValues: {':number': 1},
//   ExpressionAttributeNames: {'#limit': 'limit'}
// }
// doclient.update(couponParams, function(err, data){
//   if(err) console.log(err)
//   else console.log(data)
// })

// let couponParam = {
//   TableName: 'Coupon'
// }
// let updateParam = {
//   TableName: 'Coupon',
//   Key: {id: null},
//   UpdateExpression: 'set #limit = :newlimit',
//   ExpressionAttributeValues: {':newlimit': null},
//   ExpressionAttributeNames: {'#limit': 'limit'}
// }

// const run = async() => {
//   let result = await doclient.scan(couponParam).promise()
//   for(const coupon of result.Items){
//     if(coupon.limit != null){
//       console.log(coupon)
//       updateParam.Key.id = coupon.id
//       updateParam.ExpressionAttributeName = Number(coupon.limit)
//       console.log(coupon.limit)
//       console.log(Number(coupon.limit))
//       let test = await doclient.update(updateParam).promise()
//       console.log(test)
//     }
//   }
// }
// run()

// doclient.scan({TableName: 'Coupon'}, function(err, data){
//   if(err) console.log(err)
//   else{
//     for(const test of data.Items){
//       console.log(test)
//       if(test.limit != null){
//         console.log(test)
//       }
//     }
//   }
// })


// let couponParams = {
//   TableName: 'Coupon',
//   Key: {
//       id: 'XjlG6o/hxstl4r6tvRiqTnR1f0F3BhKU9DuIySHEeNY='
//   },
//   UpdateExpression: 'add issued :number',
//   ConditionExpression: 'attribute_exists(id) and issued < #limit',
//   ExpressionAttributeValues: {':number': 1},
//   ExpressionAttributeNames: {'#limit': 'limit'}
// }
// doclient.update(couponParams, function(err, data){
//   if(err) console.log(err)
//   else console.log(data)
// })


// fs.readdir(__dirname + '\\uploads\\Images.ver2', 'utf-8', function(err, files){
//   let updateParams = {
//     TableName: 'Monster',
//     Key: {number: 100},
//     UpdateExpression: 'set imgs = list_append(imgs, :newimg)',
//     ExpressionAttributeValues: {':newimg': null}
//   }
//   let files2add = []  
//   files.forEach(id => {
//     id = 'https://witmonsterimg.s3.ap-northeast-2.amazonaws.com/' + id
//     files2add.push(id)
//   })
//   updateParams.ExpressionAttributeValues[':newimg'] = files2add
//   doclient.update(updateParams, function(err, data){
//     if(err) console.log(err)
//     else console.log(data)
//   })
// })

// let temp = {
//   TableName: 'Campaign',
//   KeyConditionExpression: 'id = :id',
//   ExpressionAttributeValues: {':id': 'yixS4sojKjpQ4hywP/g0h2IniHk0jH83cF+iBVO6c8c='}
// }
// doclient.query(temp, function(err, data){
//   if(err) console.log(err)
//   else console.log(data.Items)
// })

// let campUpdateParams = {
//   TableName: 'Campaign',
//   Key: {id: 'yqlL+51D8jveaAbu69MYQd7QGDEnYlgYjFXxldLgIus='},
//   UpdateExpression: 'set #users = list_append(if_not_exists(#users, :emptylist), :newUser)',
//   ExpressionAttributeValues: {':newUser': ['aaaa'], ':emptylist': []},
//   ExpressionAttributeNames: {'#users': 'users'},
//   ReturnValues: 'UPDATED_NEW',
//   ConditionExpression: 'attribute_exists(id)'
// }
// doclient.update(campUpdateParams, function(err, data){
//   if(err) console.log(err)
//   else console.log(data)
// })

// let test = {}
// test[':a'] = 'a'
// test[':b'] = 'b'
// console.log(test)

// let value = 'Member'
// const run = async() => {
//   let scan = await doclient.scan({
//     TableName: value,
//     ProjectionExpression: 'id'
//   }).promise()
//   let ItemsArray = [] 
//   scan.Items.forEach(id => {
//     let deleteparams = {
//       TableName: value,
//       Key:{
//         'id': id.id
//       }
//     }
//     doclient.delete(deleteparams, function(err, data){
//       if(err){
//         console.log(err)
//       }
//       else{
//         console.log(data)
//       }
//     })
//   })
// }
// run()

// let memberComment = [{
//   type: 'campaign',
//   id: 'test',
//   coid: 'test'
// }]
// let memberParam = {
//   TableName: 'Member',
//   Key: { id: 'bbbb' },
//   UpdateExpression: 'set nickname = :nickname, profileImg = :defaultImg',
//   ExpressionAttributeValues: { ':nickname': 'bbbb', ':defaultImg': 'https://walk-into-town.kro.kr/defaultProfileImg.jpg' },
//   ReturnValues: 'UPDATED_NEW',
//   ConditionExpression: 'attribute_exists(id)'
// };
// doclient.update(memberParam, function(err, data){
//   if(err) console.log(err)
//   else console.log(data)
// })

// let member = {
//   TableName: 'Member',
//   ProjectionExpression: 'myCampaigns, id'
// }
// let updateParams = {
//   TableName: 'Member',
//   Key: {id: null},
//   UpdateExpression: 'set myCampaigns = :newCampaign',
//   ExpressionAttributeValues: {':newCampaign': null},
//   ReturnValues: 'UPDATED_NEW',
//   ConditionExpression: "attribute_exists(id)"
// }
// const run = async() => {
//   let result = await doclient.scan(member).promise()
//   console.log(result.Items)
//   let members = result.Items
//   for(const member of result.Items){
//     let temp = []
//     updateParams.Key.id = member.id
//     for(const camp of member.myCampaigns){
//       if(camp.name != undefined){
//         temp.push(camp)
//       }
//     }
//     updateParams.ExpressionAttributeValues[':newCampaign'] = temp
//     console.log(`member id: ${member.id}\n`)
//     console.log(updateParams.ExpressionAttributeValues[':newCampaign'])
//     await doclient.update(updateParams).promise()
//   }
// }
// run()

// doclient.scan({TableName: 'Session'}, function(err, data){
//   if(err) console.log(err)
//   else console.log(data.Items)
// })

// console.log(new Date().toString())
// console.log(Math.random())


// const dynamo = new aws.DynamoDB()
// let MemberParams = {
//   TableName: 'Member',
//   Key: {id: 'aaaa'},
//   UpdateExpression: 'set playingCampaigns = list_append(if_not_exists(playingCampaign, :emptylist), :newCampaign), myCampaigns = list_append(if_not_exists(myCampaigns, :emptylist), :newCampaign)',
//   ExpressionAttributeValues: {':newCampaign': [], ':emptylist': []},
//   ReturnValues: 'UPDATED_NEW',
//   ConditionExpression: "attribute_exists(id)"
// }
// doclient.update(MemberParams, function(err, data){
//   if(err) console.log(err);
//   else console.log(data);
// })


// let date = new Date()
// console.log(date.toString())

// data = {
//     // 'id': 'TestID',
//     // 'pw': 'TestPW'
// }
// postData('http://ip-api.com/json', data)
//   .then(data => console.log(data)) // JSON-string from `response.json()` call
//   .catch(error => console.error(error));





// 

// dynamodb.describeTable({
//   TableName: 'test'
// }, function(err, data){
//   if(err) console.log(err);
//   else console.log(data.Table.AttributeDefinitions)
// })
/*
 var params = {
     AttributeDefinitions: [
       {
         AttributeName: 'id',
         AttributeType: 'S'
       }
     ],
     KeySchema: [
       {
         AttributeName: 'id',
         KeyType: 'HASH'
       }
     ],
     ProvisionedThroughput: {
       ReadCapacityUnits: 10,
       WriteCapacityUnits: 10
     },
     TableName: 'Prison'
   };


 dynamodb.createTable(params, function(err, data){
     if(err) console.log(err);
     else console.log(data)
 })
*/
/*
let updateParam = {
  TableName: 'Report',
  Key: {id: 'kfUa4DZjPh/luupjVfI1NADb3ETlh6IQRgGq6omNyCM='},
  UpdateExpression: 'set typeId = :newdata',
  ExpressionAttributeValues: {':newdata': 'Mlq8MD8aWzKA/5gxDDvoisisCrKE5LTcNX6CGlzI62E='}
}
doclient.update(updateParam, function(err, data){
  if(err) console.log(err)
  else console.log(data)
})
*/
// let test = new Date()
// console.log(test)

// dynamodb.deleteTable({
//   TableName: 'test'
// }, function(err, data){
//   if(err) console.log(err);
//   else console.log(data)
// })

// dynamodb.listTables({}, function(err, data){
//   if(err){
//     console.log(err)
//   }
//   else{
//     console.log(data)
//   }
// })

// let doclent = new aws.DynamoDB.DocumentClient()
// doclent.put({
//   "TableName": "Campaign",
//   "Item": {
//     "id": "wQIxsQljs+2LN82wA1qqwySvXlPpe6JXEkYbycoVe7U00=",
//     "ownner": "java",
//     "imgs": [],
//     "name": "?????????",
//     "description": "????????? ????????? ????????????",
//     "updateTime": "2021-05-12T15:09:25.544Z",
//     "region": "????????????",
//     "pinpoints": [
//       "uiLZ7SZxeGePJDi8pr1jGNVuLR10eT1qDFwbrI1KF8g="
//     ],
//     "coupons": [
//       "J6W8/mZZTZ0gQLfZsQbp0Vtno0OYFEoctKuBM/zjjpo="
//     ],
//     "comments": []
//   },
//   "ConditionExpression": "attribute_not_exists(id)"
// }, function(err, data){
//   if(err){
//     console.log(err)
//   }
//   else{
//     console.log(data)
//   }
// })


// dynamodb.updateTable({
//   TableName: 'Campaign',
//   BillingMode: 'PAY_PER_REQUEST'
//   // AttributeDefinitions: [
//   //   {
//   //     AttributeName: 'nickname',
//   //     AttributeType: 'S'
//   //   }
//   // ],
//   // GlobalSecondaryIndexUpdates: [
//   //   {
//   //     Create: {
//   //       IndexName: 'nicknameIndex',
//   //       KeySchema: [
//   //         {
//   //           AttributeName: 'nickname',
//   //           KeyType: 'HASH'
//   //         }
//   //       ],
//   //       Projection: {
//   //         ProjectionType: 'ALL'
//   //       },
//   //       ProvisionedThroughput: {
//   //         ReadCapacityUnits: 10,
//   //         WriteCapacityUnits: 10
//   //       }
//   //     }
//   //   }
//   // ]
// }, function(err, data){
//   if(err){
//     console.log(err)
//   }
//   else{
//     console.log(data)
//   }
// })


// let doclent = new aws.DynamoDB.DocumentClient()
// doclent.query({
//   TableName: 'Coupon',
//   IndexName: null,
//   KeyConditionExpression: 'id = :test',
//   ExpressionAttributeValues: {':test': 'weGd3NHjfaKK0xSpGkNGJDL31MJrKs4IgXQhs4VYnCg='},
//   ScanIndexForward: false
//   }, function(err, data){
//   if(err) console.log(err);
//   else console.log(data.Items)
// })

// const quickSort = require('./@js/modules/Logics/Sorter')

// let test = async(criterion, value) => {
//   let FilterExp; let ExpAttrNames
//   switch (criterion) {
//     case 'name':
//       FilterExp = `contains(#${criterion}, :value)`
//       ExpAttrNames = {'#name': 'name'}
//       break;
//     case 'ownner':
//       FilterExp = `contains(#${criterion}, :value)`
//       ExpAttrNames = {'#ownner': 'ownner'}
//       break;
//     case 'region':
//       FilterExp = `contains(#${criterion}, :value)`
//       ExpAttrNames = {'#region': 'region'}
//       break; 
//     default:
//       break;
//   }

// let queryParams = {
//   TableName: 'Session',
//   ProjectionExpression: 'sess, id'
// }

// const run = async() => {
//   let result = await doclient.scan(queryParams).promise()
//   console.log(typeof(result.Items[0].sess))
// }
// run()

// let queryParams = {
//   RequestItems:{
//       'Campaign':{
//           Keys: [
//             {'id' : 'TAYH+TUgT16qmnorjmqyBM86J2pUXMJaZ0DXRXDY8pg='}
//           ],
//           ProjectionExpression: 'coupons, id, #name, imgs, description',
//           ExpressionAttributeNames: {'#name': 'name'}
//       }
//   }
// }

// doclient.batchGet(queryParams, function(err, data){
//   if(err) console.log(err)
//   else console.log(data.Responses.Campaign)
// })

//   let toSort = []
//   let primearr = []
//   for (const object of result.Items) {
//     if(object.name.startsWith(value)){
//       primearr.push(object)
//     }
//     else{
//       toSort.push(object)
//     }
//   }
//   toSort = await quickSort(toSort)
//   primearr = await quickSort(primearr)
//   primearr.push(toSort)
//   console.log(`primearr\n${JSON.stringify(primearr, null, 2)}`)
// }
// test('name', '???')


// async function quickSort (array, left = 0, right = array.length - 1) {
//   if (left >= right) {
//     return array;
//   }
//   const mid = Math.floor((left + right) / 2);
//   const pivot = array[mid].name;
//   const partition = divide(array, left, right, pivot);
//   quickSort(array, left, partition - 1);
//   quickSort(array, partition, right);
//   function divide (array, left, right, pivot) {
//     while (left <= right) {
//       while (array[left].name < pivot) {
//         left++;
//       }
//       while (array[right].name > pivot) {
//         right--;
//       }
//       if (left <= right) {
//         let swap = array[left];
//         array[left] = array[right];
//         array[right] = swap;
//         left++;
//         right--;
//       }
//     }
//       return left;
//   }
//   return array;
// }
  
  
// const bcrypt = require('bcrypt')
// const saltRounds = 10;
// const password = 'test123'

// let testhash

// const run = async () => {
//   await bcrypt.hash(password, saltRounds).then(function(hash){
//     testhash = hash
//   })
//   bcrypt.compare(password, '$2b$10$ZxZqgp7XcQfyDb7RreWz1Oh6/OLEGqMducbCLiq9vl7hDtBo9i.T6').then(function(result){
//     console.log(result)
//   })
// }

// run()

// let test2 =bcrypt.hash(Date.now().toString(), 10)


// var checkParams = {
//   TableName: 'Member',
//   Key : {
//       'id' : 'TestID',
//   },
// }
// doclient.get(checkParams, function(err, data){
//   if(err){
//     console.log(err)
//   }
//   else{
//     console.log(data)
//   }
// })

// doclient.scan({
//   TableName: 'Campaign'
// }, function(err, data){
//   if(err) console.log(err);
//   else console.log(data);
// })

// let deleteparams = {
//   TableName: 'Campaign',
//   Key:{
//     'id': 'gCucow7sPHDwBR2ggRa0CUD2OTAhrB13IM+aZ1kBGMQ='
//   }
// }
// doclient.delete(deleteparams, function(err, data){
//   if(err){
//     console.log(err)
//   }
//   else{
//     console.log(data)
//   }
// })

// let queryParams = {
//   TableName: 'Member',
//   KeyConditionExpression: 'id = :sid',
//   // ExpressionAttributeNames: {
//   //     '#id' : 'id'
//   // },
//   ExpressionAttributeValues: {
//       ':sid' : 'TestID'
//   }
// }
// doclient.query(queryParams, function(err, data){
//   if(err) console.log(err);
//   else console.log(data)
// })

// const bcrypt = require('bcrypt')
// const run = async() => {
//   let testval = await bcrypt.hash('temp', 10)
//   console.log(testval)
// }
// run()


// var queryParams = {
//   TableName: 'Test',
//   Key: {id: '100'},
//   UpdateExpression: 'SET imgs = :imgs2',
//   ExpressionAttributeValues: {
//     ':cond': {
//       id: 'id2',
//       value: 'value2'
//     },
//     ':imgs2': {
//       id: 'id3',
//       value: 'value3'
//     }
//   },
//   ReturnValues: 'UPDATED_NEW',
//   ConditionExpression: "attribute_exists(id) AND contains(imgs, :cond)"
// }
// doclient.update(queryParams, (err, data) => {
//   if(err) console.log(err)
//   else console.log(data)
// })

// var queryParams = {
//   TableName: 'Test',
//   Key: {'id': '100'},
//   ReturnValues: 'ALL_NEW',
//   UpdateExpression: 'set imgs.id = :change',
//   ExpressionAttributeValues: {':change': {id: 'id3', value: 'value3'}}
// }
// doclient.update(queryParams, function(err, data){
//   if(err) console.log(err)
//   console.log(data)
// })

// postData('https://walk-into-town.kro.kr/game/ranking', {answer: 42})
//   .then(data => console.log(JSON.stringify(data))) // JSON-string from `response.json()` call
//   .catch(error => console.error(error));

// function postData(url = 'https://walk-into-town.kro.kr/game/ranking', data = {}) {
//   // Default options are marked with *
//     return fetch(url, {
//         method: 'PUT', // *GET, POST, PUT, DELETE, etc.
//         mode: 'cors', // no-cors, cors, *same-origin
//         cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//         credentials: 'same-origin', // include, *same-origin, omit
//         headers: {
//             'Content-Type': 'application/json',
//             // 'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         redirect: 'follow', // manual, *follow, error
//         referrer: 'no-referrer', // no-referrer, *client
//         body: JSON.stringify(data), // body data type must match "Content-Type" header
//     })
//     .then(response => response.json()); // parses JSON response into native JavaScript objects
// }
