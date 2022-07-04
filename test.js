
const ldc = require("./index")
//sAMAccountName = "siyami.s"
//userPrincipalName = "siyami.s@rayanehkomak.com"

async function main(params) {
    const url = ""
    const bindDN = ''
    const bindCredentials = ''
    const base = ""
    try {
        //const result = await getUsersPromised({ active: true, json: true })
        const result = await ldc.findUsers({ 
            json: true,url,bindDN,bindCredentials,base,
            f:'',
            active:true
         })
        console.log(JSON.stringify(result))
    } catch (error) {
        console.error(error)
    } finally {
        process.exit(0);
    }
}
main()