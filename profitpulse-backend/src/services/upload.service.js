import fs from 'fs';
import db from '../models/index.js';
import { parseExcel } from '../utils/excelParser.js';
import { UPLOAD_TYPES, UPLOAD_STATUS, AUDIT_ACTIONS } from '../config/constants.js';

export const processEmployeeMasterUpload = async (filePath, financialYear, uploadedBy, fileStats) => {
    const transaction = await db.sequelize.transaction();
    let uploadLog = null;
    let successCount = 0;
    let errorCount = 0;
    let errors = [];

    try {
        uploadLog = await db.UploadLog.create({
            upload_type: UPLOAD_TYPES.EMPLOYEE_MASTER,
            file_name: fileStats.originalname,
            file_size: fileStats.size,
            financial_year: financialYear,
            uploaded_by: uploadedBy,
            status: UPLOAD_STATUS.PROCESSING
        }, { transaction });

        const rawData = parseExcel(filePath);
        await uploadLog.update({ total_rows: rawData.length }, { transaction });

        // Fetch Departments for mapping
        const departments = await db.Department.findAll({ transaction });
        const deptMap = {};
        departments.forEach(d => { deptMap[d.name.toLowerCase()] = d.id; });

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            try {
                const empCode = row['Employee ID'];
                const deptName = row['Department'];
                const designation = row['Designation'];
                const ctc = row['Annual CTC'];
                const billableFlag = row['Billable / Non-Billable'];
                const joiningDate = row['Joining Date'];

                if (!empCode || !deptName || !ctc || !joiningDate) {
                    throw new Error('Missing required fields');
                }

                const deptId = deptMap[deptName.toLowerCase()];
                if (!deptId) throw new Error(`Unknown Department: ${deptName}`);

                const isBillable = String(billableFlag).toLowerCase() === 'true' || String(billableFlag).toLowerCase() === 'y';

                // Excel dates might be numbers depending on config, but assuming string 'YYYY-MM-DD' for simplicity
                let parsedDate = joiningDate;
                if (typeof joiningDate === 'number') {
                    // Excel serial date to JS
                    const excelEpoch = new Date(1899, 11, 30);
                    parsedDate = new Date(excelEpoch.getTime() + joiningDate * 86400000).toISOString().split('T')[0];
                }

                // UPSERT LOGIC
                const [emp, created] = await db.Employee.findOrCreate({
                    where: { employee_code: String(empCode), financial_year: financialYear },
                    defaults: {
                        name: row['Name'] || empCode, // Guessing Name is a column if not explicitly listed in SRD
                        department_id: deptId,
                        designation: designation,
                        annual_ctc: Number(ctc),
                        is_billable: isBillable,
                        joining_date: parsedDate,
                        upload_batch_id: uploadLog.id,
                        financial_year: financialYear
                    },
                    transaction
                });

                if (!created) {
                    await emp.update({
                        name: row['Name'] || empCode,
                        department_id: deptId,
                        designation: designation,
                        annual_ctc: Number(ctc),
                        is_billable: isBillable,
                        joining_date: parsedDate,
                        upload_batch_id: uploadLog.id
                    }, { transaction });
                }

                successCount++;
            } catch (err) {
                errorCount++;
                errors.push({ row: i + 2, data: row, error: err.message });
            }
        }

        if (errorCount === rawData.length) {
            await uploadLog.update({ status: UPLOAD_STATUS.FAILED, error_rows: errorCount, error_details: JSON.stringify(errors) }, { transaction });
        } else if (errorCount > 0) {
            await uploadLog.update({ status: UPLOAD_STATUS.PARTIAL, success_rows: successCount, error_rows: errorCount, error_details: JSON.stringify(errors) }, { transaction });
        } else {
            await uploadLog.update({ status: UPLOAD_STATUS.COMPLETED, success_rows: successCount }, { transaction });
        }

        await db.AuditLog.create({
            user_id: uploadedBy,
            action: AUDIT_ACTIONS.UPLOAD,
            entity: 'employee_master',
            entity_id: uploadLog.id,
            new_values: { file_name: fileStats.originalname, status: uploadLog.status }
        }, { transaction });

        await transaction.commit();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Cleanup

        return uploadLog;

    } catch (err) {
        if (transaction) await transaction.rollback();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Cleanup
        throw err;
    }
};

export const processTimesheetUpload = async (filePath, monthStr, uploadedBy, fileStats) => {
    const transaction = await db.sequelize.transaction();
    let uploadLog = null;
    let successCount = 0;
    let errorCount = 0;
    let errors = [];

    try {
        uploadLog = await db.UploadLog.create({
            upload_type: UPLOAD_TYPES.TIMESHEET,
            file_name: fileStats.originalname,
            file_size: fileStats.size,
            month: monthStr,
            uploaded_by: uploadedBy,
            status: UPLOAD_STATUS.PROCESSING
        }, { transaction });

        const rawData = parseExcel(filePath);
        await uploadLog.update({ total_rows: rawData.length }, { transaction });

        // Cache lookup maps for perf
        const employees = await db.Employee.findAll({ attributes: ['id', 'employee_code'], transaction });
        const projects = await db.Project.findAll({ attributes: ['id', 'project_code'], transaction });

        const empMap = {}; employees.forEach(e => { empMap[e.employee_code] = e.id; });
        const projMap = {}; projects.forEach(p => { projMap[p.project_code] = p.id; });

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            try {
                const rowEmpCode = row['Employee ID'];
                const rowProjCode = String(row['Project ID']);
                const rowBillable = Number(row['Billable Hours'] || 0);
                const rowNonBillable = Number(row['Non-Billable Hours'] || 0);
                // The month comes from the upload config or row, SRD says "Month", we'll prefer config to enforce strict bounds

                if (!rowEmpCode || !rowProjCode) throw new Error('Missing Employee ID or Project ID');

                const empId = empMap[rowEmpCode];
                if (!empId) throw new Error(`Employee ID ${rowEmpCode} does not exist in master data`);

                const projId = projMap[rowProjCode];
                if (!projId) throw new Error(`Project ID ${rowProjCode} does not exist in master data`);

                const [ts, created] = await db.Timesheet.findOrCreate({
                    where: { employee_id: empId, project_id: projId, month: monthStr },
                    defaults: {
                        billable_hours: rowBillable,
                        non_billable_hours: rowNonBillable,
                        upload_batch_id: uploadLog.id
                    },
                    transaction
                });

                if (!created) {
                    // Upsert overwrites hours as per SRD instructions
                    await ts.update({
                        billable_hours: rowBillable,
                        non_billable_hours: rowNonBillable,
                        upload_batch_id: uploadLog.id
                    }, { transaction });
                }

                successCount++;
            } catch (err) {
                errorCount++;
                errors.push({ row: i + 2, data: row, error: err.message });
            }
        }

        if (errorCount === rawData.length) {
            await uploadLog.update({ status: UPLOAD_STATUS.FAILED, error_rows: errorCount, error_details: JSON.stringify(errors) }, { transaction });
        } else if (errorCount > 0) {
            await uploadLog.update({ status: UPLOAD_STATUS.PARTIAL, success_rows: successCount, error_rows: errorCount, error_details: JSON.stringify(errors) }, { transaction });
        } else {
            await uploadLog.update({ status: UPLOAD_STATUS.COMPLETED, success_rows: successCount }, { transaction });
        }

        await db.AuditLog.create({
            user_id: uploadedBy,
            action: AUDIT_ACTIONS.UPLOAD,
            entity: 'timesheet',
            entity_id: uploadLog.id,
            new_values: { file_name: fileStats.originalname, month: monthStr, success: successCount, fails: errorCount }
        }, { transaction });

        await transaction.commit();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        return uploadLog;

    } catch (err) {
        if (transaction) await transaction.rollback();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw err;
    }
};

export const processRevenueUpload = async (filePath, monthStr, uploadedBy, fileStats) => {
    const transaction = await db.sequelize.transaction();
    let uploadLog = null;
    let successCount = 0;
    let errorCount = 0;
    let errors = [];

    try {
        uploadLog = await db.UploadLog.create({
            upload_type: UPLOAD_TYPES.REVENUE,
            file_name: fileStats.originalname,
            file_size: fileStats.size,
            month: monthStr,
            uploaded_by: uploadedBy,
            status: UPLOAD_STATUS.PROCESSING
        }, { transaction });

        const rawData = parseExcel(filePath);
        await uploadLog.update({ total_rows: rawData.length }, { transaction });

        // Client maps via Projects
        const projects = await db.Project.findAll({ include: ['client'], transaction });
        const projObjMap = {}; projects.forEach(p => { projObjMap[p.project_code] = p; });

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            try {
                const code = String(row['Project ID']);
                const invAmt = Number(row['Invoice Amount'] || 0);
                const invDate = row['Invoice Date']; // string YYYY-MM-DD

                if (!code) throw new Error('Missing Project ID');

                const p = projObjMap[code];
                if (!p) throw new Error(`Project ID ${code} does not exist in master data`);

                // Multiple revenues might exist in a month for a project? SRD says "duplicates in same month are aggregated".
                const rev = await db.Revenue.findOne({ where: { project_id: p.id, month: monthStr }, transaction });
                if (rev) {
                    await rev.update({
                        invoice_amount: rev.invoice_amount + invAmt,
                        upload_batch_id: uploadLog.id
                    }, { transaction });
                } else {
                    await db.Revenue.create({
                        project_id: p.id,
                        client_id: p.client_id, // Ensure referential integrity constraint works.
                        invoice_amount: invAmt,
                        invoice_date: invDate || new Date().toISOString().split('T')[0],
                        month: monthStr,
                        project_type: p.project_type,
                        vertical: p.vertical,
                        upload_batch_id: uploadLog.id
                    }, { transaction });
                }
                successCount++;
            } catch (err) {
                errorCount++;
                errors.push({ row: i + 2, data: row, error: err.message });
            }
        }

        if (errorCount === rawData.length) {
            await uploadLog.update({ status: UPLOAD_STATUS.FAILED, error_rows: errorCount, error_details: JSON.stringify(errors) }, { transaction });
        } else if (errorCount > 0) {
            await uploadLog.update({ status: UPLOAD_STATUS.PARTIAL, success_rows: successCount, error_rows: errorCount, error_details: JSON.stringify(errors) }, { transaction });
        } else {
            await uploadLog.update({ status: UPLOAD_STATUS.COMPLETED, success_rows: successCount }, { transaction });
        }

        await transaction.commit();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return uploadLog;
    } catch (e) {
        if (transaction) await transaction.rollback();
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw e;
    }
};
