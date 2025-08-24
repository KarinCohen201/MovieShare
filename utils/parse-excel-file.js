const XLSX = require("xlsx");
const path = require('path')
const fs = require('fs')

const parseExcelFile = async (file) => {
    try {
       // Read the uploaded file
        const filePath = path.join(__dirname, `../uploads/${file}`);
        const workbook = XLSX.readFile(filePath);

        // Get the first sheet name
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: ["urlName", "url", "description", "linkType"], // Force the first two columns as "name" and "url"
            defval: "", // Default value for empty cells
        });

        // Delete file after reading
        fs.unlinkSync(filePath);
        
        return jsonData.slice(1, jsonData.length-1)

    }catch(error){
        console.error("Error processing file:", error);
        return false
    }
}

module.exports = parseExcelFile