import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Container, Typography, Box, Paper, Card, CardContent, CardHeader,
  Button, Divider, List, ListItem, ListItemText, ListItemIcon, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, IconButton, Alert, Snackbar, CircularProgress, Chip, Avatar,
  Menu, MenuItem, FormControl, InputLabel, Select, FormControlLabel, Switch
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
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GamesIcon from '@mui/icons-material/Games';
import { useNavigate } from 'react-router-dom';

const fetchStudentProgress = async (studentId) => {
  try {
    const res = await fetch(`/kong/app-game/getProgress.php?student_id=${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (!res.ok) throw new Error('Failed to fetch progress');
    const data = await res.json();
    return {
      matchingGame: data.matchingGame ?? 0,
      codingGame: data.codingGame ?? 0,
      bridgeGame: data.bridgeGame ?? 0,
      mathPuzzle: data.mathPuzzle ?? 0,
    };
  } catch (e) {
    console.error('Error fetching student progress:', e);
    return { matchingGame: 0, codingGame: 0, bridgeGame: 0, mathPuzzle: 0 }; // fallback
  }
};

const GAME_LABELS = {
  
  codingGame: { icon: '💻', label: 'โค้ดดิ้ง', category: 'programming', order: 2, enabled: true },
  bridgeGame: { icon: '🌉', label: 'สะพาน', category: 'engineering', order: 3, enabled: true },
  mathPuzzle: { icon: '🔢', label: 'คณิต', category: 'math', order: 4, enabled: true },
  
};

const GAME_CATEGORIES = {
  
  programming: { label: 'เกมโค้ดดิ้ง', icon: '💻' },
  engineering: { label: 'เกมสร้างสะพาน', icon: '⚙️' },
  math: { label: 'เกม Math Puzzle', icon: '📐' }
  
};

const TeacherDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_BASE_URL = 'http://mgt2.pnu.ac.th/kong/app-game';

  // Consolidated state
  const [state, setState] = useState({
    tabValue: 0,
    students: [],
    loading: false,
    openDialog: false,
    openProfileDialog: false,
    openGameDialog: false,
    dialogType: 'add',
    currentStudent: null,
    anchorEl: null,
    snackbar: { open: false, message: '', severity: 'success' },
    formData: {
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      classroom: '',
      age: ''
    },
    gameSettings: { ...GAME_LABELS }
  });

  const [studentProgress, setStudentProgress] = useState({});

  useEffect(() => {
    fetchStudents();
    fetchGameSettings();
  }, []);

  const fetchAllProgress = async (students) => {
    const progressObj = {};
    await Promise.all(students.map(async (stu) => {
      progressObj[stu.student_id] = await fetchStudentProgress(stu.student_id);
    }));
    setStudentProgress(progressObj);
  };

  const fetchStudents = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/read.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Server responded with an error');
      
      const data = await response.json();
      setState(prev => ({
        ...prev,
        students: Array.isArray(data) ? data : [],
        loading: false
      }));
      if (Array.isArray(data)) fetchAllProgress(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setState(prev => ({
        ...prev,
        students: [
          { id: 1, student_id: "1001", first_name: "John", last_name: "Doe", email: "john@example.com", classroom: "Math 101", age: "18" },
          { id: 2, student_id: "1002", first_name: "Jane", last_name: "Smith", email: "jane@example.com", classroom: "Physics 202", age: "19" },
          { id: 3, student_id: "1003", first_name: "Bob", last_name: "Johnson", email: "bob@example.com", classroom: "CS 303", age: "20" },
        ],
        loading: false,
        snackbar: {
          open: true,
          message: `Failed to load students: ${error.message}`,
          severity: 'error'
        }
      }));
    }
  };

  const handleStateChange = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [name]: value }
    }));
  };

  const handleSubmit = async () => {
    if (state.dialogType !== 'delete' && !validateForm()) return;
    
    handleStateChange({ loading: true });
    try {
      const endpoint = `${API_BASE_URL}/${state.dialogType === 'add' ? 'create' : state.dialogType === 'edit' ? 'update' : 'delete'}.php`;
      const body = state.dialogType === 'delete' 
        ? { id: state.currentStudent.id }
        : state.formData;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) throw new Error('Server responded with an error');
      
      const data = await response.json();
      handleStateChange({
        snackbar: {
          open: true,
          message: data.message || `Operation ${state.dialogType} successful`,
          severity: 'success'
        },
        openDialog: false
      });
      
      fetchStudents();
    } catch (error) {
      handleStateChange({
        snackbar: {
          open: true,
          message: `Error: ${error.message}`,
          severity: 'error'
        }
      });
    } finally {
      handleStateChange({ loading: false });
    }
  };

  const validateForm = () => {
    const { formData, dialogType } = state;
    const requiredFields = dialogType === 'add' 
      ? ['student_id', 'first_name', 'last_name', 'email', 'password']
      : ['student_id', 'first_name', 'last_name', 'email'];

    if (requiredFields.some(field => !formData[field])) {
      handleStateChange({
        snackbar: {
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        }
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      handleStateChange({
        snackbar: {
          open: true,
          message: 'Please enter a valid email address',
          severity: 'error'
        }
      });
      return false;
    }
    
    return true;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      handleStateChange({
        snackbar: {
          open: true,
          message: 'Error logging out: ' + error.message,
          severity: 'error'
        }
      });
    }
  };

  // Utility functions
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    return '#' + Array(3).fill(0).map((_, i) => 
      ('00' + ((hash >> (i * 8)) & 0xFF).toString(16)).slice(-2)
    ).join('');
  };

  const getInitials = (firstName, lastName) => 
    `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  // Render functions
  const renderHeader = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
      <Box>
        <IconButton
          onClick={(e) => handleStateChange({ anchorEl: e.currentTarget })}
          sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          <AccountCircleIcon />
        </IconButton>
        <Menu
          anchorEl={state.anchorEl}
          open={Boolean(state.anchorEl)}
          onClose={() => handleStateChange({ anchorEl: null })}
        >
          <MenuItem onClick={() => handleStateChange({ openProfileDialog: true, anchorEl: null })}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountCircleIcon />
              <Typography>Profile</Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LogoutIcon />
              <Typography>Logout</Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  const renderStudentTable = () => (
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
            <TableCell sx={{ color: 'white' }}>Progress</TableCell>
            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {state.students.length > 0 ? (
            state.students.map((student) => (
              <TableRow key={student.id} hover>
                <TableCell>{student.id}</TableCell>
                <TableCell>{student.student_id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: stringToColor(`${student.first_name} ${student.last_name}`), width: 30, height: 30, mr: 1 }}>
                      {getInitials(student.first_name, student.last_name)}
                    </Avatar>
                    {`${student.first_name} ${student.last_name}`}
                  </Box>
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <Chip size="small" label={student.classroom} sx={{ bgcolor: stringToColor(student.classroom), color: 'white' }} />
                </TableCell>
                <TableCell>{student.age}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {Object.keys(GAME_LABELS).map((key) => (
                      <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: 18 }}>{GAME_LABELS[key].icon}</span>
                        <span style={{ minWidth: 50 }}>{GAME_LABELS[key].label}:</span>
                        <span style={{ fontWeight: 'bold', color: '#5c258d' }}>
                          {studentProgress[student.student_id]?.[key] ?? 0}
                        </span>
                      </Box>
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleStateChange({ currentStudent: student, dialogType: 'edit', openDialog: true })} size="small" sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleStateChange({ currentStudent: student, dialogType: 'delete', openDialog: true })} size="small">
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
                  <Button variant="outlined" startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={() => handleStateChange({ dialogType: 'add', openDialog: true })}>
                    Add Student
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const handleGameSettingsChange = (gameKey, setting, value) => {
    setState(prev => ({
      ...prev,
      gameSettings: {
        ...prev.gameSettings,
        [gameKey]: {
          ...prev.gameSettings[gameKey],
          [setting]: value
        }
      }
    }));
  };

  const fetchGameSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_game_settings.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.status === 'success') {
        setState(prev => ({
          ...prev,
          gameSettings: result.data
        }));
      } else {
        console.error('Error fetching game settings:', result.message);
      }
    } catch (error) {
      console.error('Error fetching game settings:', error);
      setState(prev => ({
        ...prev,
        gameSettings: { ...GAME_LABELS }
      }));
    }
  };

  const saveGameSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/save_game_settings.php`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(state.gameSettings)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save game settings');
      }
      
      const data = await response.json();
      handleStateChange({
        snackbar: {
          open: true,
          message: data.message || 'Game settings saved successfully',
          severity: 'success'
        },
        openGameDialog: false
      });
      fetchGameSettings();
    } catch (error) {
      console.error('Error saving game settings:', error);
      handleStateChange({
        snackbar: {
          open: true,
          message: `Error saving game settings: ${error.message}`,
          severity: 'error'
        }
      });
    }
  };

  const renderGameManagement = () => (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="medium">Game Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleStateChange({ openGameDialog: true })}
        >
          Manage Games
        </Button>
      </Box>

      <Grid container spacing={3}>
        {Object.entries(GAME_CATEGORIES).map(([category, info]) => (
          <Grid item xs={12} md={6} lg={4} key={category}>
            <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
              <CardHeader
                title={info.label}
                titleTypographyProps={{ variant: 'h6' }}
                avatar={
                  <Avatar sx={{ bgcolor: stringToColor(category) }}>
                    {info.icon}
                  </Avatar>
                }
              />
              <CardContent>
                <List>
                  {Object.entries(state.gameSettings)
                    .filter(([_, game]) => game.category === category)
                    .map(([key, game]) => (
                      <ListItem key={key}>
                        <ListItemIcon>
                          <span style={{ fontSize: 24 }}>{game.icon}</span>
                        </ListItemIcon>
                        <ListItemText 
                          primary={game.label}
                          secondary={`Order: ${game.order}`}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={game.enabled ? 'Enabled' : 'Disabled'}
                            color={game.enabled ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mb: 8 }}>
      <Paper elevation={3} sx={{ mt: 4, p: 3, borderRadius: 2 }}>
        {renderHeader()}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={state.tabValue} 
            onChange={(event, newValue) => handleStateChange({ tabValue: newValue })} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<DashboardIcon />} label="Overview" iconPosition="start" />
            <Tab icon={<ClassIcon />} label="Students" iconPosition="start" />
            <Tab icon={<GamesIcon />} label="Games" iconPosition="start" />
          </Tabs>
        </Box>
        
        {state.tabValue === 0 && (
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
                    {state.students.length}
                  </Typography>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    color="secondary"
                    sx={{ mt: 1 }}
                    onClick={(event) => handleStateChange({ tabValue: 2 })}
                  >
                    Manage Students
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Box>
        )}
        
        {state.tabValue === 1 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="medium">Student Management</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={(event) => handleStateChange({ dialogType: 'add', openDialog: true })}
              >
                Add New Student
              </Button>
            </Box>
            {state.loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              renderStudentTable()
            )}
          </Box>
        )}

        {state.tabValue === 2 && renderGameManagement()}
      </Paper>

      {/* Dialogs and Snackbar */}
      <Dialog open={state.openDialog && state.dialogType !== 'delete'} onClose={() => handleStateChange({ openDialog: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {state.dialogType === 'add' ? 'Add New Student' : 'Edit Student'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {['student_id', 'first_name', 'last_name', 'email', 'password', 'classroom', 'age'].map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    name={field}
                    label={field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    type={field === 'password' ? 'password' : field === 'age' ? 'number' : 'text'}
                    value={state.formData[field]}
                    onChange={handleInputChange}
                    fullWidth
                    required={field !== 'password' || state.dialogType === 'add'}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => handleStateChange({ openDialog: false })} disabled={state.loading} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={state.loading}>
            {state.loading ? 'Processing...' : state.dialogType === 'add' ? 'Add Student' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={state.openDialog && state.dialogType === 'delete'} onClose={() => handleStateChange({ openDialog: false })}>
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>Confirm Delete</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText>
            Are you sure you want to delete {state.currentStudent?.first_name} {state.currentStudent?.last_name}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => handleStateChange({ openDialog: false })} disabled={state.loading} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="error" variant="contained" disabled={state.loading}>
            {state.loading ? 'Processing...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={state.openGameDialog} onClose={() => handleStateChange({ openGameDialog: false })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Manage Games
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {Object.entries(state.gameSettings).map(([key, game]) => (
                <Grid item xs={12} key={key}>
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <span style={{ fontSize: 24 }}>{game.icon}</span>
                      <Typography variant="h6">{game.label}</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Order"
                          type="number"
                          value={game.order}
                          onChange={(e) => handleGameSettingsChange(key, 'order', parseInt(e.target.value))}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={game.category}
                            onChange={(e) => handleGameSettingsChange(key, 'category', e.target.value)}
                            label="Category"
                          >
                            {Object.entries(GAME_CATEGORIES).map(([cat, info]) => (
                              <MenuItem key={cat} value={cat}>
                                {info.icon} {info.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={game.enabled}
                              onChange={(e) => handleGameSettingsChange(key, 'enabled', e.target.checked)}
                            />
                          }
                          label="Enable Game"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => handleStateChange({ openGameDialog: false })} variant="outlined">
            Cancel
          </Button>
          <Button onClick={saveGameSettings} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={state.snackbar.open} autoHideDuration={6000} onClose={() => handleStateChange({ snackbar: { ...state.snackbar, open: false } })}>
        <Alert onClose={() => handleStateChange({ snackbar: { ...state.snackbar, open: false } })} severity={state.snackbar.severity}>
          {state.snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TeacherDashboard;