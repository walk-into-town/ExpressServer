/**
 * /login/result
 */
import * as express from 'express'
import SessionManager from '../../modules/DBManager/SessionManager'
import { error, fail, success } from '../../static/result'
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
    sessman.findByUId(id).then(async () => {            // 사용자 id가 동일한 세션을 찾아 순회
        let toDelete: Array<any> = []           // 삭제할 세션을 담는 배열
        const run = async() => {
            for (const session of res.locals.result) {
                let sess = JSON.parse(session.sess)     //세션 정보를 받아오기
                let user = sess.passport.user
                req.session.passport.user.quiz.push(... user.quiz)  // 세션 정보 동기화
                if((user.id == req.session.passport.user.id) && (session.id == `sess:${req.sessionID}`)){       // 지금 세션과 동일한 세션인 경우 통과
                    continue;
                }
                toDelete.push(session)          // 아닌 경우 삭제할 세션에 추가
            }
            await sessman.deleteSession(toDelete)
            console.log('로그인 성공!')
            success.data = req.user
            console.log(`응답 JSON\n${JSON.stringify(success, null, 2)}`)
            res.status(200).send(success)
        }
        run()

    })
})

router.get('/fail', function(req: express.Request, res: express.Response){
      fail.error = '로그인 실패'
      fail.errdesc = req.flash().error[0]
      console.log('로그인 실패')
      res.status(400).send(fail)
})

module.exports = router