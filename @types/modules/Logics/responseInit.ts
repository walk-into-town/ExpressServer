export let successInit = function(success: any){
    success.data = null
}

export let failInit = function(fail: any){
    fail.error = null
    fail.errdesc = null
}