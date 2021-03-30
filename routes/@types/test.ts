import {Report} from '../../models/@js/Report'
import {Type} from '../../models/@js/Report'

let report = new Report();

report.type = Type.Campaign
console.log(report.type)
