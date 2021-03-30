const Shell = require('node-powershell')

const ps = new Shell({
    executionPolicy: 'Bypass',
    noProfile: true
})

ps.addCommand('cd ./modules/@types/FileManager;tsc; cd ../DistributionManager;tsc; cd ../../../routes/@types; tsc; cd ../../models/@types; tsc')

ps.invoke().then(output => {
    console.log(output)
    ps.addCommand('exit')
    ps.invoke().then(output => {
        console.log(output)
    })
})