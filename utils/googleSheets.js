const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class GoogleSheetsClient {
    constructor() {
        this.jwt = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
        this.doc = null;
    }

    async init() {
        if (!this.doc) {
            this.doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, this.jwt);
            await this.doc.loadInfo();
        }
    }

    async searchAccounts(criteria) {
        await this.init();
        const sheet = this.doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        return rows.filter(row => {
            if (criteria.id && row.ID !== criteria.id) return false;
            if (criteria.username && !row.USERNAME.toLowerCase().includes(criteria.username.toLowerCase())) return false;
            if (criteria.minHours && parseInt(row.HOURS) < parseInt(criteria.minHours)) return false;
            if (criteria.maxHours && parseInt(row.HOURS) > parseInt(criteria.maxHours)) return false;
            return true;
        }).map(row => ({
            id: row.ID,
            username: row.USERNAME,
            hours: parseInt(row.HOURS)
        }));
    }

    async getAccountById(id) {
        await this.init();
        const sheet = this.doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        
        const account = rows.find(row => row.ID === id);
        return account ? {
            id: account.ID,
            username: account.USERNAME,
            hours: parseInt(account.HOURS)
        } : null;
    }

    async getAccountsByHourRange(min, max) {
        await this.init();
        const sheet = this.doc.sheetsByIndex[0];
        const rows = await sheet.getRows();

        return rows.filter(row => {
            const hours = parseInt(row.HOURS);
            return hours >= min && hours <= max;
        }).map(row => ({
            id: row.ID,
            username: row.USERNAME,
            hours: parseInt(row.HOURS)
        }));
    }
}

module.exports = new GoogleSheetsClient();