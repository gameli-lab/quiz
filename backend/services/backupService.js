import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export class BackupService {
  constructor() {
    this.backupDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir);
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.gz`;
    const filepath = path.join(this.backupDir, filename);

    try {
      await execAsync(
        `mongodump --uri="${process.env.MONGO_URI}" --archive="${filepath}" --gzip`
      );
      return filepath;
    } catch (error) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  async restoreBackup(filepath) {
    try {
      await execAsync(
        `mongorestore --uri="${process.env.MONGO_URI}" --archive="${filepath}" --gzip`
      );
    } catch (error) {
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  async listBackups() {
    const files = await fs.promises.readdir(this.backupDir);
    return files.map((file) => ({
      name: file,
      path: path.join(this.backupDir, file),
      created: fs.statSync(path.join(this.backupDir, file)).birthtime,
    }));
  }
}
