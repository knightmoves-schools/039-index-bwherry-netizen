const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

function runScript(db, script) {
  const sql = fs.readFileSync(script, 'utf8');
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const getIndexInfo = (db) => {
  const sql = `SELECT * FROM SQLITE_MASTER WHERE type = 'index';`
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

describe('the SQL in the `exercise.sql` file', () => {
  let db;
  let scriptPath;
  let cleanup;

  beforeAll(async() => {
    const dbPath = path.resolve(__dirname, '..', 'lesson39.db');
    db = new sqlite3.Database(dbPath);

    scriptPath = path.resolve(__dirname, '..', 'exercise.sql');
    cleanup = path.resolve(__dirname, './cleanup.sql');
    await runScript(db, cleanup);
  });

  afterAll(async() => {
    await runScript(db, cleanup);
    db.close();
  });

  it('should return all of the columns from the `DEMOGRAPHIC` and constrain the maximum number of rows to 10', async () => {
      await runScript(db, scriptPath);
      const indexInfo = await getIndexInfo(db);

      const emailIndex = indexInfo.find((info) => {
        return info.name == "IDX_CONTACT_INFO_EMAIL" && info.tbl_name == "Contact_Info";
      });

      expect(emailIndex.sql).toMatch(/ON +Contact_Info +\(Email\);*/gi);
  });
});
