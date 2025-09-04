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
  Modal,
  Button,
} from '@mui/material';
import { useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';

interface ScoringResultsProps {
  users: string[];
  history: any[];
}

const ScoringResults: React.FC<ScoringResultsProps> = ({ users, history }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [vocalScores, setVocalScores] = useState<{ [key: string]: string }>({});

  const selectedUser = users[tabIndex];
  const selectedData = history.filter((item) => item.user === selectedUser);

  const handleVocalScoreChange = (index: number, value: string) => {
    setVocalScores((prev) => ({ ...prev, [index]: value }));
  };

  const handleOpenModal = (title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setModalContent('');
    setModalTitle('');
  };

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
                <TableCell sx={{ width: '20%' }}>出現word</TableCell>
                <TableCell sx={{ width: '10%' }}>score</TableCell>
                <TableCell sx={{ width: '10%' }}>歌唱</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>コメント</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedData.map((item, idx) => {
                const vocal = vocalScores[idx] || '';
                const total = vocal ? parseInt(vocal) + (item.keywordScore ?? 0) : '—';
                return (
                <TableRow key={idx}>
                  <TableCell>{item.keyword}</TableCell>
                  <TableCell>{item.artist || '—'}</TableCell>
                  <TableCell>{item.music || '—'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        handleOpenModal('出現word', (item.targetWordText || []).join(', '))
                      }
                    >
                      表示
                    </Button>
                  </TableCell>
                  <TableCell>{item.keywordScore}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      sx={{ width: '60px' }}
                      value={vocal}
                      onFocus={(e) => {
                        if (!e.target.value) {
                          handleVocalScoreChange(idx, '85');
                        }
                      }}
                      onChange={(e) =>
                        handleVocalScoreChange(idx, e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>{total}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        handleOpenModal('コメント', item.comment || 'なし')
                      }
                    >
                      表示
                    </Button>
                  </TableCell>
                  <TableCell>
                    <SaveIcon sx={{ cursor: 'pointer' }} />
                  </TableCell>
                </TableRow>
                );
              })}
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
            {modalTitle}
          </Typography>
          <Typography sx={{ mt: 2 }}>{modalContent}</Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default ScoringResults;
