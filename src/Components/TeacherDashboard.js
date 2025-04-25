import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Container, Typography, Box, Paper, Card, CardContent, CardHeader,
  Button, Divider, List, ListItem, ListItemText, ListItemIcon, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, IconButton, Alert, Snackbar, CircularProgress, Chip, Avatar
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DashboardIcon from '@mui/icons-material/Dashboard';

const TeacherDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [students, setStudents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('add'); // 'add', 'edit', 'delete'
  const [currentStudent, setCurrentStudent] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    classroom: '',
    age: ''
  });
  
  // API base URL
  const API_BASE_URL = 'http://mgt2.pnu.ac.th/kong/app-game/';
  
  // Mock data for other tabs (classes and assignments)
  const classes = [
    { id: 1, name: 'Mathematics 101', students: 25, color: '#4caf50' },
    { id: 2, name: 'Physics 202', students: 18, color: '#2196f3' },
    { id: 3, name: 'Computer Science 303', students: 30, color: '#ff9800' }
  ];
  
  const assignments = [
    { id: 1, title: 'Algebra Quiz', dueDate: '2023-10-20', class: 'Mathematics 101', status: 'Active' },
    { id: 2, title: 'Physics Lab Report', dueDate: '2023-10-25', class: 'Physics 202', status: 'Upcoming' },
    { id: 3, title: 'Programming Project', dueDate: '2023-11-01', class: 'Computer Science 303', status: 'Upcoming' }
  ];

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Using real API
      const response = await fetch(`${API_BASE_URL}/read.php`);
      if (!response.ok) throw new Error('Server responded with an error');
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setStudents(data);
      } else if (data.message) {
        // API returned a message but no students
        setStudents([]);
        console.info(data.message);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setSnackbar({
        open: true,
        message: `Failed to load students: ${error.message}`,
        severity: 'error'
      });
      // Fallback to mock data
      setStudents([
        { id: 1, student_id: "1001", first_name: "John", last_name: "Doe", email: "john@example.com", classroom: "Math 101", age: "18" },
        { id: 2, student_id: "1002", first_name: "Jane", last_name: "Smith", email: "jane@example.com", classroom: "Physics 202", age: "19" },
        { id: 3, student_id: "1003", first_name: "Bob", last_name: "Johnson", email: "bob@example.com", classroom: "CS 303", age: "20" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const openAddDialog = () => {
    setFormData({
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      classroom: '',
      age: ''
    });
    setDialogType('add');
    setOpenDialog(true);
  };

  const openEditDialog = (student) => {
    setCurrentStudent(student);
    setFormData({
      id: student.id,
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      password: '', // Don't show password for security
      classroom: student.classroom,
      age: student.age
    });
    setDialogType('edit');
    setOpenDialog(true);
  };

  const openDeleteDialog = (student) => {
    setCurrentStudent(student);
    setDialogType('delete');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const validateForm = () => {
    // Basic validation
    if (dialogType === 'add') {
      if (!formData.student_id || !formData.first_name || !formData.last_name || 
          !formData.email || !formData.password) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        return false;
      }
    } else if (dialogType === 'edit') {
      if (!formData.student_id || !formData.first_name || !formData.last_name || 
          !formData.email) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid email address',
        severity: 'error'
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (dialogType !== 'delete' && !validateForm()) return;
    
    setLoading(true);
    try {
      let endpoint, method, body;
      
      if (dialogType === 'add') {
        endpoint = `${API_BASE_URL}/create.php`;
        method = 'POST';
        body = formData;
      } else if (dialogType === 'edit') {
        endpoint = `${API_BASE_URL}/update.php`;
        method = 'POST';
        body = {...formData};
        if (!body.password) delete body.password;
      } else if (dialogType === 'delete') {
        endpoint = `${API_BASE_URL}/delete.php`;
        method = 'POST';
        body = { id: currentStudent.id };
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) throw new Error('Server responded with an error');
      
      const data = await response.json();
      setSnackbar({
        open: true,
        message: data.message || `Operation ${dialogType} successful`,
        severity: 'success'
      });
      
      fetchStudents(); // Refresh the list after successful operation
      handleCloseDialog();
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Generates a color based on string input (for consistent class colors)
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  // Get first letter of first and last name for avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <Container maxWidth="lg" sx={{ mb: 8 }}>
      <Paper elevation={3} sx={{ mt: 4, p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SchoolIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Teacher Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Welcome back, {currentUser?.displayName || currentUser?.email || 'Teacher'}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<DashboardIcon />} label="Overview" iconPosition="start" />
            
    
            
          </Tabs>
        </Box>
        
        {tabValue === 0 && (
          <Box sx={{ mt: 3 }}>
            

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
                  <CardHeader
                    title="Students"
                    titleTypographyProps={{ variant: 'h6' }}
                    avatar={
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <PeopleIcon />
                      </Avatar>
                    }
                  />
                  <CardContent>
                    <Typography variant="h3" sx={{ textAlign: 'center', mb: 2, color: 'secondary.main' }}>
                      {students.length}
                    </Typography>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      color="secondary"
                      sx={{ mt: 1 }}
                      onClick={() => setTabValue(2)}
                    >
                      Manage Students
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              
              
             
            
          </Box>
        )}
        
        
        
        {tabValue === 2 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="medium">Student Management</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={openAddDialog}
              >
                Add New Student
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.main' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white' }}>ID</TableCell>
                      <TableCell sx={{ color: 'white' }}>Student ID</TableCell>
                      <TableCell sx={{ color: 'white' }}>Name</TableCell>
                      <TableCell sx={{ color: 'white' }}>Email</TableCell>
                      <TableCell sx={{ color: 'white' }}>Classroom</TableCell>
                      <TableCell sx={{ color: 'white' }}>Age</TableCell>
                      <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.length > 0 ? (
                      students.map((student) => (
                        <TableRow 
                          key={student.id}
                          hover
                          sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
                        >
                          <TableCell>{student.id}</TableCell>
                          <TableCell>{student.student_id}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: stringToColor(`${student.first_name} ${student.last_name}`),
                                  width: 30,
                                  height: 30,
                                  mr: 1
                                }}
                              >
                                {getInitials(student.first_name, student.last_name)}
                              </Avatar>
                              {`${student.first_name} ${student.last_name}`}
                            </Box>
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <Chip 
                              size="small" 
                              label={student.classroom} 
                              sx={{ 
                                bgcolor: stringToColor(student.classroom),
                                color: 'white'
                              }} 
                            />
                          </TableCell>
                          <TableCell>{student.age}</TableCell>
                          <TableCell>
                            <IconButton 
                              color="primary" 
                              onClick={() => openEditDialog(student)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={() => openDeleteDialog(student)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                            <Typography color="text.secondary">No students found</Typography>
                            <Button 
                              variant="outlined" 
                              startIcon={<AddIcon />} 
                              sx={{ mt: 2 }}
                              onClick={openAddDialog}
                            >
                              Add Student
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
        
        
      </Paper>

      {/* Student Form Dialog */}
      <Dialog open={openDialog && dialogType !== 'delete'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {dialogType === 'add' ? 'Add New Student' : 'Edit Student'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="student_id"
                  label="Student ID"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <SchoolIcon color="primary" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="first_name"
                  label="First Name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <PersonIcon color="primary" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="last_name"
                  label="Last Name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <EmailIcon color="primary" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="password"
                  label={dialogType === 'edit' ? 'New Password (leave blank to keep current)' : 'Password'}
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  fullWidth
                  required={dialogType === 'add'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="classroom"
                  label="Classroom"
                  value={formData.classroom}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: <ClassIcon color="primary" sx={{ mr: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="age"
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : dialogType === 'add' ? <AddIcon /> : <EditIcon />}
          >
            {loading ? 'Processing...' : dialogType === 'add' ? 'Add Student' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog && dialogType === 'delete'} onClose={handleCloseDialog}>
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText>
            Are you sure you want to delete {currentStudent?.first_name} {currentStudent?.last_name}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {loading ? 'Processing...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TeacherDashboard;