const express = require('express');
const router = express.Router();
const Attendance = require('./models/attandence');
const employee = require('./models/employee');
const company = require('./models/company');
const { sendToClients } = require('./utils/sse');
const { sendTelegramMessage } = require('./utils/telegram');
const dayjs = require('dayjs');

router.get('/', (req, res) => {
    console.log("➡️ GET request on essl index page");
    res.send('OK');
});
router.post('/', (req, res) => {
    console.log("➡️ POst request on essl index page");
    res.send('OK');
});
router.get('/api/refreshDevice/:deviceSN', async (req, res, next) => {
    const { deviceSN } = req.params;
    const whichcomapny = await company.findOne({ "devices.SN": deviceSN }).select('_id devices');
    // console.log(deviceSN)
    // console.log(whichcomapny)
    if (!whichcomapny) {
        return res.status(400).json({ message: 'Device not Found' });
    }
    return res.status(200).json({ devices: whichcomapny.devices });
});

// Device command polling
router.get('/essl/iclock/devicecmd', (req, res) => {
    console.log("➡️ GET /iclock/devicecmd");
    // console.log("Query:", req.query);
    res.send('OK');
});

// GET request for device for server exist , is receive ok then next requesta on GET /iclock/getrequest
router.get(['/essl/iclock/cdata', '/essl/iclock/cdata.aspx'], (req, res) => {
    // console.log("➡️ GET /iclock/cdata or /iclock/cdata.aspx");
    // console.log("Query params:", req.query);
    res.send('OK iclock/cdata');
});

// Device heartbeat / info request
router.get('/essl/iclock/getrequest.aspx', async (req, res) => {
    // console.log("➡️ GET /iclock/getrequest.aspx");
    console.log("heartbeat ESSL SN:", req.query.SN);

    const deviceSN = req.query.SN;
    const now = new Date();
    try {
        let kyahua = await company.updateOne(
            { "devices.SN": deviceSN },
            { $set: { "devices.$.lastHeartbeat": now } }
        );
        // console.log(kyahua)
    } catch (error) {
        console.log(error.message)
    }
    res.send('OK');
});

// POST request for device
router.post(['/essl/iclock/cdata', '/essl/iclock/cdata.aspx'], async (req, res) => {
    const raw = req.bodyRaw || '';
    const deviceSN = req.query.SN || null;
    // console.log('deviceSN', deviceSN)
    // console.log('raw', raw)

    if (raw.startsWith('USER')) {
        // Parse user data
        const users = raw.trim().split('\n').map(line => {
            const obj = {};
            line.split(/\s+/).forEach(part => {
                const [key, ...rest] = part.split('=');
                obj[key] = rest.join('');
            });
            return obj;
        });
        // console.log('🧑 Users:', users);

    } else if (raw.startsWith('OPLOG')) {
        // Parse device operation log
        const logs = raw.trim().split('\n').map(line => {
            const parts = line.split(/\s+/);
            return {
                type: parts[0],
                PIN: parts[1],
                DeviceID: parts[2],
                Timestamp: parts[3] + ' ' + parts[4],
                VerifyMode: parts[5],
                Status: parts[6],
                WorkCode: parts[7],
                Reserved: parts[8]
            };
        });
        // console.log('📋 Operation Logs:', logs);

    } else if (/^\d+\s/.test(raw)) {
        // Parse live attendance (ATTLOG)
        const fields = raw.trim().split(/\s+/);
        const attendancee = {
            PIN: fields[0],
            Timestamp: fields[1] + ' ' + fields[2],
            VerifyMode: fields[4],
            Status: fields[3]
        };

        console.log('⏱ Live Attendance:', attendancee);
        // console.log('⏱ raw field:', fields);

        const status = parseInt(attendancee.Status, 10);

        if (status > 1 || attendancee.VerifyMode != 1) {
            return res.send('ok')
        }
        // otherwise process further for attenense

        try {
            let deviceUserId = attendancee.PIN;
            let recordTime = attendancee.Timestamp;

            // const whichcomapny = await company.findOne({ deviceSN }).select('_id');
            const whichcomapny = await company.findOne({ "devices.SN": deviceSN }).select('_id devices');
            // console.log('whichcomapny', whichcomapny)

            // 1️⃣ Find employee by esslId
            const employeeDoc = await employee.findOne({ companyId: whichcomapny._id, deviceUserId }).select('_id branchId empId companyId');
            if (!employeeDoc) {
                console.warn(`⚠️ No employee found with esslId ${deviceUserId}`);
                return;
            }

            // 2️⃣ Normalize punch time → strip seconds & ms
            const punchDate = new Date(recordTime);
            punchDate.setSeconds(0, 0); // ✅ keep only till minutes

            // 2.1️⃣ Normalize attendance date to UTC midnight
            const dateObj = new Date(Date.UTC(
                punchDate.getUTCFullYear(),
                punchDate.getUTCMonth(),
                punchDate.getUTCDate()
            ));

            // 3️⃣ Check existing attendance for same employee + date
            let attendance = await Attendance.findOne({
                employeeId: employeeDoc._id,
                date: dateObj
            });

            if (!attendance) {
                // 4️⃣ First punch → create Punch In
                attendance = new Attendance({
                    companyId: employeeDoc.companyId,
                    branchId: employeeDoc.branchId,
                    empId: employeeDoc.empId,
                    employeeId: employeeDoc._id,
                    date: dateObj,
                    status: 'present',
                    punchIn: punchDate,
                    source: 'device'
                });
                await attendance.save();

                const updatedRecord = await Attendance.findById(attendance._id)
                    .populate({
                        path: 'employeeId',
                        select: 'userid profileimage',
                        populate: {
                            path: 'userid',
                            select: 'name'
                        }
                    });

                sendToClients(
                    {
                        type: 'attendance_update',
                        payload: { action: 'checkin', data: updatedRecord }
                    },
                    (employeeDoc?.companyId).toString(),
                    (employeeDoc?.branchId).toString() || null
                );
                // sendTelegramMessage(`${updatedRecord?.employeeId?.userid?.name} has Punched In at ${dayjs(updatedRecord.punchIn).format("hh:mm A")}, Date-${dayjs(updatedRecord.punchIn).format("DD/MM/YY")}`)
                sendTelegramMessage(
                    `${updatedRecord?.employeeId?.userid?.name} has Punched In at ${dayjs(updatedRecord.punchIn)
                        .utc()
                        .add(5, 'hours')
                        .add(30, 'minutes')
                        .format("hh:mm A")}, Date-${dayjs(updatedRecord.punchIn)
                            .utc()
                            .add(5, 'hours')
                            .add(30, 'minutes')
                            .format("DD/MM/YY")}`
                );

                // console.log(`✅ Punch In recorded for employee ${employeeDoc.empId} on ${dateObj.toDateString()}`);
            } else {
                // 5️⃣ If already has punchIn but no punchOut → set Punch Out with calculations
                if (!attendance.punchOut) {
                    attendance.punchOut = punchDate;

                    // ✅ Calculate working minutes
                    const diffMinutes = (attendance.punchOut - attendance.punchIn) / (1000 * 60);
                    attendance.workingMinutes = parseFloat(diffMinutes.toFixed(2));

                    // ✅ Calculate short minutes (assuming 480 min = 8 hours workday)
                    const short = 480 - attendance.workingMinutes;
                    attendance.shortMinutes = short > 0 ? parseFloat(short.toFixed(2)) : 0;

                    await attendance.save();

                    const updatedRecord = await Attendance.findById(attendance._id)
                        .populate({
                            path: 'employeeId',
                            select: 'userid profileimage',
                            populate: {
                                path: 'userid',
                                select: 'name'
                            }
                        });

                    sendToClients(
                        {
                            type: 'attendance_update',
                            payload: { action: 'checkOut', data: updatedRecord }
                        },
                        (employeeDoc?.companyId).toString(),
                        (employeeDoc?.branchId).toString() || null
                    );
                    // sendTelegramMessage(`${updatedRecord?.employeeId?.userid?.name} has Punched Out at ${dayjs(updatedRecord.punchIn).format("hh:mm A")}, Date-${dayjs(updatedRecord.punchIn).format("DD/MM/YY")}`)
                    sendTelegramMessage(
                        `${updatedRecord?.employeeId?.userid?.name} has Punched Out at ${dayjs(updatedRecord.punchOut)
                            .utc()
                            .add(5, 'hours')
                            .add(30, 'minutes')
                            .format("hh:mm A")}, Date-${dayjs(updatedRecord.punchOut)
                                .utc()
                                .add(5, 'hours')
                                .add(30, 'minutes')
                                .format("DD/MM/YY")}`
                    );

                    // console.log(`✅ Punch Out recorded for employee ${employeeDoc.empId} on ${dateObj.toDateString()} | Working: ${attendance.workingMinutes} min | Short: ${attendance.shortMinutes} min`);
                } else {
                    console.log(`ℹ️ Extra punch ignored for employee ${employeeDoc.empId} on ${dateObj.toDateString()}`);
                }
            }
        } catch (error) {
            console.error("❌ Error recording attendance:", error.message);
        }
    }

    res.send('OK'); // Device requires exact "OK"
});

module.exports = router;
