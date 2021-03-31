const Shell = require('node-powershell')

const ps = new Shell({
    executionPolicy: 'Bypass',
    noProfile: true
})

ps.addCommand('cd ./modules/@types/FileManager;tsc')
ps.addCommand('cd ../DistributionManager;tsc')
ps.addCommand('cd ../DBManager; tsc')
ps.addCommand('cd ../../../routes/@types; tsc')
ps.addCommand('cd ../../models/@types; tsc')

ps.invoke().then(output => {
    console.log(output)
    ps.addCommand('exit')
    ps.invoke().then(output => {
        console.log(output)
    })
})