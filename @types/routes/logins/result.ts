/**
 * /login/result
 */
import * as express from 'express'
import SessionManager from '../../modules/DBManager/SessionManager'
var router = express.Router()

/**
 * 로그인 성공시 기존 세션 제거
 * ---> Session Middleware에서 처리했지만 passport적용 후 세션 생성 전에 작동하므로 에러 발생
 * 1. sessionManager에서 User Id 검색
 * 2. res.locals.result에 들어있는 session들을 순회하며
 * 3. 세션 id가 일치하고 user id가 일치하는 것을 제외하고 toDelete 배열에 삽입
 * 4. sessionManager의 deleteSession에 배열을 넣어 세션 삭제
 */
router.get('/success', function(req, res){
    let id = req.session.passport.user.id
    let sessman = new SessionManager(req, res)
    sessman.findByUId(id).then(async () => {
        let toDelete: Array<any> = []
        const run = async() => {
            for (const session of res.locals.result) {
                let sess = JSON.parse(session.sess)
                let user = sess.passport.user
                if((user.id == req.session.passport.user.id)
                    && (session.id == `sess:${req.sessionID}`)
                ){
                    continue;
                }
                toDelete.push(session)
            }
        }
        await run()
        sessman.deleteSession(toDelete)
        console.log('로그인 성공!')
    })

    let result = {
        result: 'success',
        message: req.user,
        session: req.sessionID
    }
    res.status(200).send(result)
})

router.get('/fail', function(req: express.Request, res: express.Response){
    let result = {
        result : 'failed',
        error: req.flash().error[0]
      }
      console.log('로그인 실패')
      res.status(402).send(result)
})

module.exports = router