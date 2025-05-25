import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  useTheme,
  Alert
} from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { db } from '../db/config';
import { dbInitPromise } from '../db/config';

const EXAMPLE_QUERIES = [
  {
    title: 'Get all patients',
    query: 'SELECT * FROM patients ORDER BY created_at DESC;'
  },
  {
    title: 'Get patients by age range',
    query: 'SELECT * FROM patients WHERE age BETWEEN 20 AND 40;'
  },
  {
    title: 'Count patients by gender',
    query: 'SELECT gender, COUNT(*) as count FROM patients GROUP BY gender;'
  },
  {
    title: 'Recent registrations',
    query: "SELECT name, age, gender, created_at FROM patients WHERE created_at >= NOW() - INTERVAL '24 hours';"
  }
];

const SQLQueryTool = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    // Wait for database initialization
    dbInitPromise
      .then(() => setDbReady(true))
      .catch(error => {
        console.error('Database initialization failed:', error);
        setError('Failed to initialize database. Please refresh the page.');
      });
  }, []);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setError(null);
  };

  const executeQuery = async () => {
    if (!dbReady) {
      setError('Database is not ready. Please wait...');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await db.query(query);
      setResults(result.rows);
    } catch (err) {
      setError(err.message);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
    setError(null);
  };

  const renderResults = () => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      );
    }

    if (!results || results.length === 0) {
      return results === null ? null : (
        <Typography color="text.secondary" mt={2}>
          No results found
        </Typography>
      );
    }

    const columns = Object.keys(results[0]);

    return (
      <TableContainer 
        component={Paper} 
        sx={{ 
          mt: 3,
          backgroundColor: theme.palette.background.paper,
          '& .MuiTableCell-root': {
            borderColor: theme.palette.divider
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column}
                  sx={{ 
                    fontWeight: 'bold',
                    backgroundColor: theme.palette.background.default
                  }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((row, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <TableCell key={column}>{row[column]?.toString()}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (!dbReady) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          SQL Query Tool
        </Typography>
        <Paper elevation={3} sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        SQL Query Tool
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          Example Queries
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {EXAMPLE_QUERIES.map((example, index) => (
            <Chip
              key={index}
              label={example.title}
              onClick={() => handleExampleClick(example.query)}
              sx={{
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white'
                }
              }}
            />
          ))}
        </Box>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <TextField
          fullWidth
          multiline
          rows={6}
          value={query}
          onChange={handleQueryChange}
          placeholder="Enter your SQL query here..."
          error={!!error}
          helperText={error}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              fontFamily: 'monospace'
            }
          }}
        />
        <Button
          variant="contained"
          onClick={executeQuery}
          disabled={!query.trim() || isLoading || !dbReady}
          startIcon={<PlayArrowIcon />}
          sx={{
            px: 4,
            py: 1,
            borderRadius: 2
          }}
        >
          {isLoading ? 'Executing...' : 'Run Query'}
        </Button>
      </Paper>

      {renderResults()}
    </Box>
  );
};

export default SQLQueryTool; 