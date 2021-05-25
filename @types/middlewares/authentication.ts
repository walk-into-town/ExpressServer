import { Request, Response } from "express";

export = function(req: Request, res: Response, next: Function){
    console.log('사용자 인증중...')
    if(req.isAuthenticated() == true){
        console.log('인증된 사용자입니다')
        next()
        return;
    }
    let result = {
        result: 'failed',
        error: '먼저 로그인 해주세요'
    }
    console.log(`인증되지 않은 사용자.\n${JSON.stringify(result, null, 2)}`)
    res.status(400).send(result)
    return;
}