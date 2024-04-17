import dayjs from "dayjs";
import {dbOptions} from "./db";
import * as util from "node:util";
const exec = util.promisify(require('node:child_process').exec);
import {Client} from "basic-ftp";

export async function backupDatabase() {
    console.log("Backing up the database.");
    const fileName = `tlf_gestionale_backup_${dayjs().format()}.sql`;
    const {
        _,  // stdout
        stderr
    } = await exec(`mysqldump -h ${dbOptions.host} -P ${dbOptions.port} -u ${dbOptions.user} -p${dbOptions.password} ${dbOptions.database} --column-statistics=0 > ${fileName}`);
    console.error(stderr);

    const client = new Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: process.env.FTP_HOST,
            port: 2121,     // QuotaGard static IP is used, tunnel from ftp.tlftechnology.it:2121 to ftp.tlftechnology.it:21
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: true,
            secureOptions: {
                servername: process.env.FTP_SERVERNAME
            }
        })
        await client.uploadFrom(`./${fileName}`, `./${process.env.FTP_BACKUP_FOLDER}/${fileName}`);
    } catch (err) {
        console.error(err);
    }
    client.close()
    await exec(`rm ./${fileName}`);
}