import { Request, Response } from "express";

export = function(req: Request, res: Response, next: Function){
    console.log('called')
    console.log(req.isAuthenticated())
    if(req.isAuthenticated() == true){
        next()
        return;
    }
    let result = {
        result: 'failed',
        error: '먼저 로그인 해주세요'
    }
    res.status(400).send(result)
    return;
}