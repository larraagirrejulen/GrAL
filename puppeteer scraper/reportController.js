
const sqlite3 = require('sqlite3').verbose();


class ReportController{

    #db;

    constructor(){

        this.#db = new sqlite3.Database('reports.db');

        /*this.#db.run(`
            DROP TABLE reports;
        `);*/

        this.#db.run(`
            CREATE TABLE IF NOT EXISTS reports (
                domain TEXT NOT NULL,
                version INTEGER NOT NULL,
                uploadedBy TEXT NOT NULL,
                report TEXT NOT NULL,
                PRIMARY KEY (domain, version)
            );
        `);

    }

    // Request handler
    async handleReportRequest(report, uploadedBy) { 

        let response;

        console.log("\n  Storing new report...");
        response = await this.#insertNewEvaluationReport(report, uploadedBy); 

        console.log("\n  Response: " + JSON.stringify(response));
        return JSON.stringify(response);

    }
    
    // Function to check if a user exists
    #insertNewEvaluationReport(report, uploadedBy) {

        const domain = report.evaluationScope.website.siteName;

        return new Promise((resolve, reject) => { 
            this.#db.serialize(() => {
                this.#db.run(`
                    INSERT INTO reports (domain, version, uploadedBy, report)
                    VALUES (?, (SELECT COALESCE(MAX(version), 0) + 1 FROM reports WHERE domain = ?), ?, ?)
                `, [domain, domain, uploadedBy, report], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({"success": true});
                    }
                });
            });
        });
    }
      
}

module.exports = ReportController;