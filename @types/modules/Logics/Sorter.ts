export const campaignSort = function(campA: any, campB: any){
  if(campA.name < campB.name){
    return -1
  }
  if(campA.name > campB.name){
    return 1
  }
  if(campA.name == campB.name){
    return 0
  }
}

export const rankingSort = function(a, b){
  if(a.cleared > b.cleared){
    return -1;
  }
  if(a.cleared < b.cleared){
    return 1;
  }
  if(a.cleared == b.cleared){
    return 0
  }
}