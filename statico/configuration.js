import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configFileName = path.join(__dirname, 'config.json')

export default async function isConfigurationDone(){
    try{
        let res = await new Promise((resolve, reject)=>{
            fs.readFile(configFileName, "utf8", (error, data) => {
                if (error) {
                    // file not exists
                    reject(error)
                }else{
                    const config = JSON.parse(data);

                    if(!config.configurationDone){
                        // config not done
                        reject(error)
                    }else{
                        resolve()
                    }
                }
            })
        })
        return true
    }catch(err){
        return false
    }
}