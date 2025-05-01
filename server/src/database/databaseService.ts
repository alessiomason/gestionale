import dayjs from "dayjs";
import {dbOptions} from "./db";
import * as util from "node:util";
import {openAsBlob} from "node:fs";

const exec = util.promisify(require('node:child_process').exec);

export async function backupDatabase() {
    console.log("Backing up the database.");
    const fileName = `tm_gestionale_backup_${dayjs().format()}.sql`;
    const {stderr} = await exec(`mysqldump -h ${dbOptions.host} -P ${dbOptions.port} -u ${dbOptions.user} -p${dbOptions.password} ${dbOptions.database} --column-statistics=0 --no-tablespaces --single-transaction --set-gtid-purged=OFF > ${fileName}`);
    console.error(stderr);

    const file = await openAsBlob(`./${fileName}`, {type: "application/sql"});
    const form = new FormData();
    form.set("backupFile", file, fileName);
    try {
        const res = await fetch(process.env.DB_BACKUP_UPLOAD as string, {method: "POST", body: form});
        if (res.ok) {
            console.log("Database successfully backed up.");
        }
    } catch (err: any) {
        console.error(err);
    }

    await exec(`rm ./${fileName}`);
}