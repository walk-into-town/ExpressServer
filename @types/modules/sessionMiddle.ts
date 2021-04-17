import {Request, Response} from 'express'
import SessionManager from './DBManager/SessionManager'
import bodyparser from 'body-parser'

export const sessionCheck = function (req: Request, res: Response, next: Function) {
    if(req.originalUrl == '/member/login'){         //로그인 요청시
        let params = JSON.parse(req.body.json)
        if(req.session == undefined){                    //세션 없이 로그인 시 기존에 로그인된 세션 삭제
            let sessman = new SessionManager(this.req, this.res)
            sessman.findByUId(params.id).then(function () {
                sessman.deleteSession(this.res.locals.result)
            }.bind(this))
            next()
            return;
        }
        if(req.session.user.id != undefined){         //세션의 id가 존재 = 이미 로그인함
            let result = {
                result: 'failed',
                error: 'Already logged in'
            }
            res.status(400).send(result)
            return;
        }

        next()
        return;
    }
    if(req.session == undefined){               //로그인 이외 요청시
        let result = {
            result: 'failed',
            error: 'Session Expired'
        }
        res.status(200).send()
        return;
    }
    next()
}