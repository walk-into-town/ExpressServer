export let successInit = function(success: any){
    success.data = {}
}

export let failInit = function(fail: any){
    fail.error = ''
    fail.errdesc = ''
}