import {
  Tabs,
  Tab,
  Box,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  Button,
} from '@mui/material';
import { useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';

const users = ['shui', 'ichigo'];

interface ScoringResultsProps {
  users: string[];
}

const ScoringResults: React.FC<ScoringResultsProps> = ({ users }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [scoringData, setScoringData] = useState(
    users.map((name) => ({
      name,
      keyword: '夢',
      artist: 'YOASOBI',
      title: 'アイドル',
      bonusWords: ['夢', '未来', '希望'],
      bonusScore: 15,
      vocalScore: '',
      comment: 'すばらしい選曲でした！',
    }))
  );
  const [openModal, setOpenModal] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const handleVocalScoreChange = (index: number, value: string) => {
    const updated = [...scoringData];
    updated[index].vocalScore = value;
    setScoringData(updated);
  };

  const handleOpenModal = (content: string) => {
    setModalContent(content);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalContent('');
  };

  const selected = scoringData[tabIndex];
  if (!selected) return null;

  return (
    <Box>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        採点履歴
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={(_, newIndex) => setTabIndex(newIndex)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {users.map((user, index) => (
          <Tab key={index} label={user} />
        ))}
      </Tabs>

      <Paper elevation={3} sx={{ mt: 2, p: 2, overflowX: 'auto' }}>
        <Box minWidth={800}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '20%' }}>お題</TableCell>
                <TableCell sx={{ width: '20%' }}>Artist</TableCell>
                <TableCell sx={{ width: '20%' }}>Music</TableCell>
                <TableCell sx={{ width: '20%' }}>加点word</TableCell>
                <TableCell sx={{ width: '10%' }}>word</TableCell>
                <TableCell sx={{ width: '10%' }}>歌唱</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>コメント</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{selected.keyword}</TableCell>
                <TableCell>{selected.artist}</TableCell>
                <TableCell>{selected.title}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      handleOpenModal(selected.bonusWords.join(', '))
                    }
                  >
                    表示
                  </Button>
                </TableCell>
                <TableCell>{selected.bonusScore}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    sx={{ width: '60px' }}
                    value={selected.vocalScore}
                    onFocus={(e) => {
                      if (!e.target.value) {
                        handleVocalScoreChange(tabIndex, '85');
                      }
                    }}
                    onChange={(e) =>
                      handleVocalScoreChange(tabIndex, e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  {selected.vocalScore
                    ? parseInt(selected.vocalScore) + selected.bonusScore
                    : '—'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenModal(selected.comment)}
                  >
                    表示
                  </Button>
                </TableCell>
                <TableCell>
                  <SaveIcon sx={{ cursor: 'pointer' }} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            コメント
          </Typography>
          <Typography sx={{ mt: 2 }}>{modalContent}</Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default ScoringResults;
