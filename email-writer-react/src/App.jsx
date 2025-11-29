import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Button, Box, CircularProgress, Container, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generaratedReply, setGeneratedReply] = useState('');
  const [Loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setGeneratedReply('');

    try {
      const response = await axios.post('http://localhost:8080/api/email/generate',
        {
          emailContent,
          tone
        }); 
        setGeneratedReply(typeof response.data === 'string' ? response.data : JSON.stringify(esponse.data));
    } catch (err) {
      setError('An error occurred while generating the reply. Please try again.');
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      <Container maxWidth="md" sx={{py:4}}>
        <Typography variant="h3" component="h1" gutterBottom>AI Email Reply Generator</Typography>
        <Box sx={{mt:3}}>
          <TextField 
          fullWidth
          multiline
          minRows={6}
          label="Original Email Content"
          variant="outlined"
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{mb:3}}
          />
          <FormControl fullWidth sx={{mb:2}}>
            <InputLabel>Tone(Optional)</InputLabel>
            <Select
              value={tone||''}
              label={"Tone(Optional)"}
              onChange={(e) => setTone(e.target.value)}>
                <MenuItem value={''}>None</MenuItem>
                <MenuItem value={'Friendly'}>Friendly</MenuItem>
                <MenuItem value={'Casual'}>Casual</MenuItem>
                <MenuItem value={'Professional'}>Professional</MenuItem>
              </Select>
          </FormControl>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!emailContent || Loading}
          fullWidth>
            {Loading ? <CircularProgress size={24} /> : 'Generate Reply'}
        </Button>
        </Box>

        {error && (<Typography color='error' sx={{mb:2}}>{error}</Typography>)}
        {generaratedReply && (
          <Box sx={{mt:4}}>
            <Typography variant="h6" gutterBottom>Generated Reply:</Typography>
            <TextField
              fullWidth
              multiline
              Rows={6}
              variant="outlined"
              value={generaratedReply||''}
              InputProps={{readOnly:true}}
            />

            <Button variant='outlined'
            sx={{mt:2}}
            onClick={() => {
              navigator.clipboard.writeText(generaratedReply);
            }}>
              Copy to Clipboard
            </Button>
          </Box>
        )}
        </Container>
      </>

  )
}

export default App
