const express = require('express');
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads
const upload = multer({
  dest: uploadDir, // Temporary directory for uploads
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter(req, file, cb) {
    // Allow all image file types
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  },
});
const secretKey = process.env.JWT_SECRET_KEY;

// MSSQL configuration with Windows Authentication
const dbConfig = {
  server: '18.232.161.187,1401',
  database: 'Homesphere',
  options: {
    trustedConnection: true,
    encrypt: false,
    trustServerCertificate: true,
  },
  driver: 'msnodesqlv8',
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=18.232.161.187,1401;Database=Homesphere;Trusted_Connection=Yes;',
};

// Function to create a connection pool
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// Endpoint to get Admin ID based on Housing Society Name
app.get('/admin/get-id', async (req, res) => {
  const { HS_Name } = req.query;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('HS_Name', sql.NVarChar, HS_Name)
      .execute('GetAdminID');

    if (result.recordset.length > 0) {
      const A_id = result.recordset[0].A_id;
      res.status(200).json({ success: true, A_id });
    } else {
      res.status(404).json({ success: false, message: 'Invalid Housing Society Name' });
    }
  } catch (err) {
    console.error('Database query error:', err.message || err);
    res.status(500).json({ success: false, message: 'Database query error' });
  }
});



const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err); 
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    req.user = decoded; // Save the decoded token payload to the request object
    next(); // Proceed to the next middleware/handler
  });
};


// Login routes
app.post('/residents/login', async (req, res) => {
  const { CNIC, Passwords, A_id } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CNIC', sql.NVarChar, CNIC)
      .input('Passwords', sql.NVarChar, Passwords)
      .input('A_id', sql.NVarChar, A_id)
      .execute('LoggedinResidentssss');
    if (result.recordset.length > 0) {
      const resident = result.recordset[0];
      // Assuming passwords are stored in plain text in the database
      if (Passwords !== resident.Passwords) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign({ CNIC: resident.CNIC, A_id: resident.A_id }, secretKey);

      res.json({ success: true, message: 'Login successful', userName: resident.Names, token });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ success: false, message: 'Database query error' });
  }
});


app.post('/staff/login', async (req, res) => {
  const { CNIC, Passwords, A_id } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CNIC', sql.NVarChar, CNIC)
      .input('Passwords', sql.NVarChar, Passwords)
      .input('A_id', sql.VarChar, A_id)
      .execute('LoggedinStaffs');

    if (result.recordset.length > 0) {
      const staff = result.recordset[0];

      if (Passwords !== staff.Passwords) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign({ CNIC: staff.CNIC, A_id: staff.A_id }, secretKey);

      res.json({ success: true, message: 'Login successful', userName: staff.Names, token });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ success: false, message: 'Database query error' });
  }
});
// Resident details
app.get('/resident/details', verifyToken, async (req, res) => {
  const CNIC = req.user.CNIC; // Get CNIC from the decoded token

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CNIC', sql.VarChar, CNIC)
      .execute('GetLoginResident');

    if (result.recordset.length > 0) {
      const resident = result.recordset[0];
      if (resident.Picture) {
        const fullUrl = `http://192.168.0.102:3000${resident.Picture}`;
        resident.Picture = fullUrl;
      }
      res.json(resident);
    } else {
      res.status(404).json({ message: 'Resident not found' });
    }
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Database query error' });
  }
});
// Fetch Staff details
app.get('/Staff/details',verifyToken, async (req, res) => {
  const CNIC  = req.user.CNIC;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CNIC', sql.VarChar, CNIC)
      .execute('GetLoggedinStaff');  

    if (result.recordset.length > 0) {
      const staff = result.recordset[0];
      if (staff.Picture) {
        const fullUrl = `http://192.168.0.102:3000${staff.Picture}`;
        staff.Picture = fullUrl;
      }
      res.json(staff);
    } else {
      res.status(404).json({ message: 'Staff not found' });
    }
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Database query error' });
  }
});


  app.get('/resident/plots',verifyToken, async (req, res) => {
    const  CNIC  = req.user.CNIC;
  
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('CNIC', sql.VarChar, CNIC)
        .execute('GetPlotAndDetails');
  
      res.json(result.recordset);
    } catch (err) {
      console.error('Database query error:', err);
      res.status(500).json({ message: 'Database query error' });
    }
  });
  
app.get('/resident/ownership',verifyToken, async (req, res) => {
  const CNIC = req.user.CNIC;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CNIC', sql.VarChar, CNIC)
      .execute('GetOwnerShips');

    res.json(result.recordset);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Database query error' });
  }
});

// Update profile picture endpoint
app.post('/resident/update-picture', upload.single('Picture'), async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extracting the token from the Authorization header

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, secretKey);
    const CNIC = decoded.CNIC; // Get CNIC from the decoded token
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Picture is required' });
    }

    const filePath = path.join(__dirname, 'uploads', file.filename);
    const fileUrl = `/uploads/${file.filename}`; // URL for accessing the file

    const pool = await poolPromise;

    // Fetch the current picture URL for the resident
    const residentResult = await pool.request()
      .input('CNIC', sql.VarChar, CNIC)
      .execute('GetLoginResident');

    if (residentResult.recordset.length > 0) {
      const resident = residentResult.recordset[0];
      if (resident.Picture) {
        // Delete the old picture if it exists
        const oldFilePath = path.join(__dirname, 'uploads', path.basename(resident.Picture));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Move the newly uploaded file to a permanent location
      fs.rename(filePath, path.join(__dirname, 'uploads', file.filename), async (err) => {
        if (err) {
          console.error('Error moving file:', err);
          return res.status(500).json({ success: false, message: 'Error processing file' });
        }

        try {
          // Update the database with the new image URL for the resident
          const updateResult = await pool.request()
            .input('CNIC', sql.VarChar, CNIC)
            .input('Picture', sql.VarChar, fileUrl)
            .execute('UpdatePictureResident');

          if (updateResult.rowsAffected[0] > 0) {
            res.json({ success: true, message: 'Profile picture updated successfully' });
          } else {
            res.json({ success: false, message: 'Resident not found' });
          }
        } catch (err) {
          console.error('Database query error:', err);
          res.status(500).json({ success: false, message: 'Database query error' });
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'Resident not found' });
    }
  } catch (err) {
    console.error('Error verifying token or processing request:', err);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});


app.post('/Staff/update-picture', upload.single('Picture'), async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from the Authorization header

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, secretKey);
    const CNIC = decoded.CNIC;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'picture is required' });
    }

    const filePath = path.join(__dirname, 'uploads', file.filename);
    const fileUrl = `/uploads/${file.filename}`; // URL for accessing the file

    const pool = await poolPromise;

    // Fetch the current picture URL for the staff member
    const staffResult = await pool.request()
      .input('CNIC', sql.VarChar, CNIC)
      .execute('GetLoggedinStaff');

    if (staffResult.recordset.length > 0) {
      const staff = staffResult.recordset[0];
      if (staff.Picture) {
        // Delete the old picture if it exists
        const oldFilePath = path.join(__dirname, 'uploads', path.basename(staff.Picture));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Move the newly uploaded file to a permanent location
      fs.rename(filePath, path.join(__dirname, 'uploads', file.filename), async (err) => {
        if (err) {
          console.error('Error moving file:', err);
          return res.status(500).json({ success: false, message: 'Error processing file' });
        }

        try {
          // Update the database with the new image URL for the staff member
          const updateResult = await pool.request()
            .input('CNIC', sql.VarChar, CNIC)
            .input('Picture', sql.VarChar, fileUrl)
            .execute('UpdatePictureStaff');

          if (updateResult.rowsAffected[0] > 0) {
            res.json({ success: true, message: 'Profile picture updated successfully' });
          } else {
            res.json({ success: false, message: 'Staff Member not found' });
          }
        } catch (err) {
          console.error('Database query error:', err);
          res.status(500).json({ success: false, message: 'Database query error' });
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'Staff Member not found' });
    }
  } catch (err) {
    console.error('Error verifying token or processing request:', err);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

// Fetch services and staff details
app.get('/services-and-staff', verifyToken, async (req, res) => {
  const A_id = req.user.A_id; // Assuming A_id is in the token payload

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('A_id', sql.NVarChar, A_id)
      .execute('GetStaffByAdmin'); // Stored procedure to fetch staff data

    // Only send the staff data in the response
    res.json({
      staff: result.recordset
    });
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ message: 'Database query error' });
  }
});

app.get('/tasks/by-profession', verifyToken, async (req, res) => {
  const profession = req.query.profession;
  console.log('Requested profession:', profession); // Debug log

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('profession', sql.NVarChar, profession)
      .execute('GetTasksByProfession');
      console.log('Query result:', result.recordset); // Debug log
    res.json(result.recordset);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Database query error' });
  }
});

app.get('/tasks/my-requests-forstaff', verifyToken, async (req, res) => {
  const CNIC = req.user.CNIC; // CNIC from the token
  const requestId = req.query.requestId || null; // Optional parameter

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CNIC', sql.NVarChar(50), CNIC)
      .input('RequestId', sql.NVarChar(50), requestId)
      .execute('GetTaskRequestForStaff');

    // Log the result for debugging
    console.log('Fetched requests:', result.recordset);

    // Respond with the fetched requests
    res.json(result.recordset);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Database query error' });
  }
});


app.post('/tasks/update-status', verifyToken, async (req, res) => {
  const { Request_id, Statuss } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Request_id', sql.NVarChar, Request_id)
      .input('Statuss', sql.NVarChar, Statuss)
      .execute('UpdateTaskRequestStatuss');

    res.json({ success: true, message: 'Task request status updated successfully' });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Database query error' });
  }
});

app.post('/tasks/request', verifyToken, async (req, res) => {
  const { requestId } = req.body;

  try {
    // Log the input to verify what is being sent
    console.log('Request Body:', req.body);

    const pool = await poolPromise;
    const result = await pool.request()
      .input('Request_id', sql.NVarChar, requestId)
      .execute('GetTaskRequest');
    
    // Process your result here if needed
    console.log('Query result:', result.recordset);

    // Send only one response
    res.status(200).json({ message: 'Task request processed successfully' });

  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Database query error' });
  }
});


app.get('/Staff/detailsbyCNIC',verifyToken, async (req, res) => {
  const { CNIC } = req.query;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CNIC', sql.VarChar, CNIC)
      .execute('GetLoggedinStaff');  

    if (result.recordset.length > 0) {
      const staff = result.recordset[0];
      if (staff.Picture) {
        const fullUrl = `http://192.168.0.102:3000${staff.Picture}`;
        staff.Picture = fullUrl;
      }
      res.json(staff);
    } else {
      res.status(404).json({ message: 'Staff not found' });
    }
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Database query error' });
  }
});

app.post('/tasks/accept', verifyToken, async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
      return res.status(400).send('Request ID is required');
  }

  try {
      const pool = await sql.connect(dbConfig);
      await pool.request()
          .input('Request_id', sql.NVarChar(50), requestId)
          .input('Status', sql.NVarChar(50), 'In Progress')
          .execute('UpdateTaskRequestStatuss');

      res.send('Task request accepted');
  } catch (err) {
      console.error('Error accepting task request:', err);
      res.status(500).send('Error accepting task request');
  }
});

app.post('/tasks/decline', verifyToken, async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
      return res.status(400).send('Request ID is required');
  }

  try {
      const pool = await sql.connect(dbConfig);
      await pool.request()
          .input('Request_id', sql.NVarChar(50), requestId)
          .input('Status', sql.NVarChar(50), 'Not Available')
          .execute('UpdateTaskRequestStatuss');

      res.send('Task request declined');
  } catch (err) {
      console.error('Error declining task request:', err);
      res.status(500).send('Error declining task request');
  }
});

app.post('/tasks/complete', verifyToken, async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).send('Request ID is required');
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Request_id', sql.NVarChar(50), requestId)
      .input('Status', sql.NVarChar(50), 'Completed')
      .execute('UpdateTaskRequestStatuss');

    res.send('Task marked as completed');
  } catch (err) {
    console.error('Error completing task request:', err);
    res.status(500).send('Error completing task request');
  }
});

app.get('/tasks/my-requests-forresident', verifyToken, async (req, res) => {
  const CNIC = req.user.CNIC;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CNIC', sql.NVarChar(50), CNIC)
      .execute('GetTaskRequestsForResident');

    res.json(result.recordset);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Database query error' });
  }
});
app.post('/requests/create', verifyToken, async (req, res) => {
  console.log('Received request to create tasks:', req.body);

  const { residentCNIC, staffCNIC, description, taskIds } = req.body;

  if (!residentCNIC || !staffCNIC || !description || !Array.isArray(taskIds) || taskIds.length === 0) {
    return res.status(400).send('Resident CNIC, Staff CNIC, Description, and Task IDs are required');
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    console.log('Transaction started');

    const requestResult = await transaction.request()
      .input('ResidentCNIC', sql.NVarChar(50), residentCNIC)
      .input('StaffCNIC', sql.NVarChar(50), staffCNIC)
      .input('Description', sql.NVarChar(8000), description)
      .execute('CreateRequest');

    const newRequestId = requestResult.recordset[0].Request_id;
    console.log('New request ID:', newRequestId);

    const taskIdsString = taskIds.join(',');

    // Pass the newRequestId to the AssignTasksToRequest procedure
    await transaction.request()
      .input('RequestId', sql.Int, newRequestId)  // New parameter
      .input('Task_ids', sql.NVarChar(sql.MAX), taskIdsString)
      .execute('AssignTasksToRequests');

    console.log('Tasks assigned');

    await transaction.commit();
    console.log('Transaction committed');

    res.json({ requestId: newRequestId });

  } catch (err) {
    console.error('Error creating new request with tasks:', err);
    await transaction.rollback();
    res.status(500).send('Error creating new request with tasks');
  }
});




app.get('/tasks/requests-for-resident', verifyToken, async (req, res) => {
  const CNIC = req.user.CNIC; // CNIC from the token

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('CNIC', sql.NVarChar(50), CNIC)
      .execute('GetTaskRequestsForResident');



    res.json(result.recordset);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Database query error' });
  }
});


// Endpoint for submitting a general complaint
app.post('/complaints/general', verifyToken, async (req, res) => {
  const { complaintDescription, CNIC, A_id} = req.body;
  // Validate input
  if (!complaintDescription || !CNIC ) {
    return res.status(400).send({ error: 'All fields are required.' });
  }
  try {
    const pool = await poolPromise;
    console.log("Received data:", { complaintDescription, CNIC, A_id }); 
    const result = await pool.request()
    .input('complain_Description', sql.VarChar, complaintDescription)
    .input('CNIC', sql.VarChar, CNIC)
    .input('A_id', sql.VarChar, A_id)
      .execute('InsertGeneralComplaint');
      res.status(200).send({ 
        message: 'Complaint Submitted\n\nOur team will review it and get back to you shortly.\n\nThank you for your patience!' 
    }); 
    
    } catch (err) {
      console.error("Database error: ", err); 
      res.status(500).send({ error: 'Error submitting complaint' });
    }
});

app.post('/complaints/staff', verifyToken, async (req, res) => {
  const { complaintDescription, RCNIC, SCNIC } = req.body;

  // Validate input
  if (!complaintDescription || !RCNIC || !SCNIC) {
    return res.status(400).send({ error: 'All fields are required.' });
  }

  try {
    const pool = await poolPromise; 
    console.log("Received data:", { complaintDescription, RCNIC, SCNIC }); 

    const result = await pool.request()
      .input('Complain_Description', sql.VarChar, complaintDescription) // Match parameter name
      .input('RCNIC', sql.VarChar, RCNIC)
      .input('SCNIC', sql.VarChar, SCNIC)
      .execute('InsertStaffComplaint'); 

      res.status(200).send({ 
        message: 'Complaint Submitted\n\nOur team will review it and get back to you shortly.\n\nThank you for your patience!' 
    }); 
    
  } catch (err) {
    console.error("Database error: ", err); 
    res.status(500).send({ error: 'Error submitting staff complaint' });
  }
});
app.get('/events/details', verifyToken, async (req, res) => {
  const { A_id } = req.user; // Assuming the admin ID is stored in the token.

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('A_id', sql.VarChar, A_id)
      .execute('GetEventss');

      const events = result.recordset.map(event => {
        if (event.Picture) {
          event.Picture = `http://192.168.0.102:3000${event.Picture}`;
        }
        return event;
      });
  
      res.json(events);
    } catch (err) {
      console.error('Database query error:', err);
      res.status(500).json({ message: 'Database query error' });
    }
  });

app.post('/event/upload-picture', upload.single('Picture'), async (req, res) => {
  try {
    const { EID } = req.body; // Event ID
    const picturePath = `/uploads/${req.file.filename}`;

    // Update the Event picture path in the database
    const pool = await poolPromise;
    await pool.request()
      .input('EID', sql.Int, EID)
      .input('Picture', sql.VarChar, picturePath)
      .query('UPDATE Event SET Picture = @Picture WHERE EID = @EID');

    res.json({ success: true, message: 'Image uploaded successfully', picturePath });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ success: false, message: 'Error uploading image' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
