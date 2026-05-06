import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  LinearProgress,
  Box,
  TextField,
  Button,
  MenuItem
} from "@mui/material";

const API_URL = "https://script.google.com/macros/s/AKfycbx64JrwjFFCIU_E_Jue1eD4OxkNthCmr-NGmUQUM92EWyRoZ5Q-py9HfRaWfGhYbXbRsg/exec";

const checklistItems = [
  "Price reached my pre-marked zone",
  "Zone marked before market",
  "Market is not choppy",
  "Clear rejection candle (5 min)",
  "1-min pullback confirmation",
  "Bias is fixed (CE/PE)",
  "Not influenced by news/fear",
  "Premium between ₹15–₹25",
  "SL defined (₹4–₹5)",
  "Risk ≤ ₹200",
  "Target ≥ 2x SL",
  "SL & Target set properly"
];

export default function App() {
  const [checked, setChecked] = useState(Array(checklistItems.length).fill(false));
  const [emotion, setEmotion] = useState("");
  const [notes, setNotes] = useState("");
  const [journal, setJournal] = useState([]);
  const [page, setPage] = useState(1);

  const itemsPerPage = 5;

  const toggleCheck = (index) => {
    const updated = [...checked];
    updated[index] = !updated[index];
    setChecked(updated);
  };

  const checkedCount = checked.filter(Boolean).length;
  const percentage = Math.round((checkedCount / checklistItems.length) * 100);

  const getColor = () => {
    if (percentage < 50) return "error";
    if (percentage < 80) return "warning";
    return "success";
  };

  // ✅ FETCH DATA FROM GOOGLE SHEET
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.length === 0) return;
  
        const formatted = data.slice(1).map((row) => ({
          date: row[0],
          percentage: row[1],
          emotion: row[2],
          notes: row[3]
        }));
  
        setJournal(formatted.reverse());
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
  }, []);
  // ✅ SAVE DATA
  const handleSave = async () => {
    if (!emotion) {
      alert("Select emotion before saving");
      return;
    }

    const entry = { percentage, emotion, notes };

    try {
      await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(entry)
      });

      alert("Saved to Google Sheet!");
      setEmotion("");
      setNotes("");
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    }
  };

  // ✅ PAGINATION LOGIC
  const paginatedData = journal.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="sm" style={{ marginTop: "20px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Trading Checklist Pro
      </Typography>

      {/* Checklist */}
      <Card elevation={4}>
        <CardContent>
          {checklistItems.map((item, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={checked[index]}
                  onChange={() => toggleCheck(index)}
                />
              }
              label={item}
            />
          ))}
        </CardContent>
      </Card>

      {/* Progress */}
      <Box mt={3}>
        <Typography variant="h6" align="center">
          Readiness: {percentage}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={getColor()}
          style={{ height: "10px", borderRadius: "5px", marginTop: "10px" }}
        />
        <Typography align="center" mt={1}>
          {percentage < 80 ? "🚫 Do NOT trade" : "✅ You can execute trade"}
        </Typography>
      </Box>

      {/* Emotion Tracker */}
      <Box mt={4}>
        <Typography variant="h6">Emotion Before Trade</Typography>
        <TextField
          select
          fullWidth
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          margin="normal"
        >
          <MenuItem value="Confident">Confident</MenuItem>
          <MenuItem value="Fear">Fear</MenuItem>
          <MenuItem value="FOMO">FOMO</MenuItem>
          <MenuItem value="Confused">Confused</MenuItem>
        </TextField>

        <TextField
          label="Notes"
          multiline
          rows={3}
          fullWidth
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: "10px" }}
          onClick={handleSave}
        >
          Save Trade Journal
        </Button>
      </Box>

      {/* Journal History */}
      <Box mt={4}>
        <Typography variant="h6">Trade Journal</Typography>

        {paginatedData.map((entry, index) => (
          <Card key={index} style={{ marginTop: "10px" }}>
            <CardContent>
              <Typography variant="body2">{entry.date}</Typography>
              <Typography>Readiness: {entry.percentage}%</Typography>
              <Typography>Emotion: {entry.emotion}</Typography>
              <Typography>Notes: {entry.notes}</Typography>
            </CardContent>
          </Card>
        ))}

        {/* Pagination Buttons */}
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </Button>
          <Button
            disabled={page * itemsPerPage >= journal.length}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
