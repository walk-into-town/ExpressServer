var aws = require('aws-sdk')
var dotenv = require('dotenv')
dotenv.config()
aws.config.update({
    region: 'us-east-1',
    endpoint: 'http://localhost:8000'
})
var dynamodb = new aws.DynamoDB()

let doclient = new aws.DynamoDB.DocumentClient()
doclient.scan({
  TableName: 'Session'
}, function(err, data){
  if(err){
    console.log(err)
  }
  else{
    console.log(data)
  }
})

// dynamodb.describeTable({
//   TableName: 'Campaign'
// }, function(err, data){
//   if(err) console.log(err);
//   else console.log(data)
// })

// var params = {
//     AttributeDefinitions: [
//       {
//         AttributeName: 'id',
//         AttributeType: 'S'
//       }
//     ],
//     KeySchema: [
//       {
//         AttributeName: 'id',
//         KeyType: 'HASH'
//       }
//     ],
//     ProvisionedThroughput: {
//       ReadCapacityUnits: 10,
//       WriteCapacityUnits: 10
//     },
//     TableName: 'Session'
//   };


// dynamodb.createTable(params, function(err, data){
//     if(err) console.log(err);
//     else console.log(data)
// })

// let test = new Date()
// console.log(test)

// dynamodb.deleteTable({
//   TableName: 'Session'
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
//   TableName: 'test',
//   Item: {
//     id: '132',
//     test2: 'test',
//     test4: 'test2'
//   }
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
//   AttributeDefinitions: [
//     {
//       AttributeName: 'ownner',
//       AttributeType: 'S'
//     }
//   ],
//   GlobalSecondaryIndexUpdates: [
//     {
//       Create: {
//         IndexName: 'ownnerIndex',
//         KeySchema: [
//           {
//             AttributeName: 'ownner',
//             KeyType: 'HASH'
//           }
//         ],
//         Projection: {
//           ProjectionType: 'ALL'
//         },
//         ProvisionedThroughput: {
//           ReadCapacityUnits: 10,
//           WriteCapacityUnits: 10
//         }
//       }
//     }
//   ]
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
//   TableName: 'test',
//   IndexName: null,
//   KeyConditionExpression: 'id = :test',
//   ExpressionAttributeValues: {':test': '132'}
// }, function(err, data){
//   if(err) console.log(err);
//   else console.log(data)
// })

const bcrypt = require('bcrypt')
const saltRounds = 10;
const password = 'test123'

let testhash

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